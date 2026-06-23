# API — REST e WebSocket

A API **não possui autenticação**. Qualquer cliente pode criar conversas e enviar mensagens.

A API oferece **duas alternativas** para enviar mensagens e receber respostas da IA. Ambas compartilham guards de prompt injection e persistência no MongoDB.

## Fluxo típico

1. `POST /api/v1/conversations` — cria uma conversa (retorna `id`)
2. Enviar mensagem via **REST** ou **WebSocket**
3. `GET /api/v1/conversations` — lista todas as conversas
4. `GET /api/v1/conversations/{id}` — recupera histórico completo

---

## REST vs WebSocket (mensagens)

| | **REST** | **WebSocket** |
|---|----------|---------------|
| **Uso ideal** | Integrações simples, testes, clientes HTTP | Frontend com chat ao vivo (streaming) |
| **Transporte** | HTTP request/response | Conexão persistente bidirecional |
| **Resposta da IA** | Completa de uma vez | Token a token (chunks) em tempo real |
| **Complexidade no front** | Baixa (`fetch`) | Média (`WebSocket`) |

> **Recomendação:** use REST para testes rápidos; use WebSocket no frontend para streaming da IA.

---

## REST — Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Health check |
| `GET` | `/api/v1/conversations` | Lista todas as conversas |
| `POST` | `/api/v1/conversations` | Cria uma conversa |
| `GET` | `/api/v1/conversations/{id}` | Obtém conversa com histórico completo |
| `POST` | `/api/v1/conversations/{id}/messages` | Envia mensagem (resposta completa) |

### Health check

```http
GET /health
```

```json
{"status": "ok"}
```

### Listar conversas

```http
GET /api/v1/conversations?limit=50
```

| Query param | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| `limit` | `int` (1–100) | `50` | Máximo de conversas retornadas |

Retorna lista ordenada por `created_at` decrescente:

```json
[
  {
    "id": "...",
    "created_at": "2024-01-01T00:00:00Z",
    "preview": "Últimas palavras da última mensagem...",
    "message_count": 4
  }
]
```

### Criar conversa

```http
POST /api/v1/conversations
```

Resposta `201 Created`:

```json
{
  "id": "...",
  "messages": [],
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Obter conversa

```http
GET /api/v1/conversations/{id}
```

Retorna a conversa com todas as mensagens:

```json
{
  "id": "...",
  "messages": [
    {
      "id": "...",
      "conversation_id": "...",
      "sender": "USER",
      "content": "Por que a Terra é plana?",
      "created_at": "..."
    },
    {
      "id": "...",
      "conversation_id": "...",
      "sender": "AI",
      "content": "A Terra não é plana...",
      "created_at": "..."
    }
  ],
  "created_at": "..."
}
```

Retorna `404` se a conversa não existir.

### Enviar mensagem (REST)

```http
POST /api/v1/conversations/{id}/messages
Content-Type: application/json

{"content": "Por que a Terra é plana?"}
```

| Campo | Tipo | Restrições |
|-------|------|------------|
| `content` | `string` | 1–4000 caracteres |

Resposta `200 OK`:

```json
{
  "user_message": {
    "id": "...",
    "conversation_id": "...",
    "sender": "USER",
    "content": "Por que a Terra é plana?",
    "created_at": "..."
  },
  "ai_message": {
    "id": "...",
    "conversation_id": "...",
    "sender": "AI",
    "content": "A Terra não é plana...",
    "created_at": "..."
  }
}
```

Retorna `404` se a conversa não existir.

---

## WebSocket

### Conexão

```
ws://localhost:8000/api/v1/conversations/{conversation_id}/ws
```

A conversa deve existir antes de conectar. A conexão permanece aberta para múltiplas mensagens.

### Cliente → servidor

```json
{
  "type": "message",
  "content": "Por que a Terra é plana?"
}
```

| Campo | Tipo | Restrições |
|-------|------|------------|
| `type` | `string` | deve ser exatamente `"message"` |
| `content` | `string` | 1–4000 caracteres |

### Servidor → cliente (sequência típica)

```json
{"type": "user_message", "message": {"id": "...", "sender": "USER", "content": "...", "created_at": "..."}}
{"type": "chunk", "content": "A Terra "}
{"type": "chunk", "content": "não é plana..."}
{"type": "done", "ai_message": {"id": "...", "sender": "AI", "content": "...", "created_at": "..."}}
```

### Eventos

| Evento | Descrição |
|--------|-----------|
| `user_message` | Confirma persistência da mensagem do usuário |
| `chunk` | Fragmento da resposta da IA (acumular no UI) |
| `replace` | Substitui todo o texto acumulado (guard corrigiu a resposta) |
| `done` | Resposta final persistida; inclui `ai_message` completo |
| `error` | Payload inválido, conversa não encontrada (fecha com código `4404`), ou erro na IA |

### Exemplo (JavaScript)

```javascript
const ws = new WebSocket(
  `ws://localhost:8000/api/v1/conversations/${id}/ws`
);
let aiText = "";

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "chunk")   aiText += data.content;
  if (data.type === "replace") aiText = data.content;
  if (data.type === "done")    console.log("Final:", data.ai_message.content);
  if (data.type === "error")   console.error("Erro:", data.detail);
};

ws.onopen = () => {
  ws.send(JSON.stringify({ type: "message", content: "Olá!" }));
};
```

---

## Guards (ambos os modos)

Entrada e saída passam pelos mesmos guards documentados em [`patterns/prompt-injection.md`](patterns/prompt-injection.md). No WebSocket, se a resposta for corrigida após o streaming, o evento `replace` instrui o frontend a substituir o texto exibido.
