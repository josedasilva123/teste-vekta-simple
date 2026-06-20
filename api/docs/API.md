# API — Autenticação, REST e WebSocket

Todas as conversas pertencem a um **usuário autenticado**. Cadastro e login geram JWT; rotas de conversa exigem `Authorization: Bearer <token>`.

A API oferece **duas alternativas** para enviar mensagens e receber respostas da IA. Ambas compartilham guards de prompt injection e persistência no MongoDB.

## Fluxo recomendado

1. `POST /api/v1/auth/register` ou `POST /api/v1/auth/login` — obtém token JWT
2. `POST /api/v1/conversations` — cria conversa (com Bearer token)
3. Enviar mensagem via **REST** ou **WebSocket**
4. `GET /api/v1/conversations` — lista conversas do usuário
5. `GET /api/v1/conversations/{id}` — recupera histórico

---

## Autenticação

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/api/v1/auth/register` | Não | Cadastro de usuário |
| `POST` | `/api/v1/auth/login` | Não | Login |
| `GET` | `/api/v1/auth/me` | Sim | Usuário autenticado |

### Cadastro

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha12345",
  "name": "Maria"
}
```

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "Maria",
    "created_at": "..."
  }
}
```

### Uso do token

Inclua em todas as rotas de conversa:

```http
Authorization: Bearer eyJ...
```

---

## REST vs WebSocket (mensagens)

## Quando usar cada uma

| | **REST** | **WebSocket** |
|---|----------|---------------|
| **Uso ideal** | Integrações simples, testes, clientes HTTP | Frontend com chat ao vivo (streaming) |
| **Transporte** | HTTP request/response | Conexão persistente bidirecional |
| **Resposta da IA** | Completa de uma vez | Token a token (chunks) em tempo real |
| **Complexidade no front** | Baixa (`fetch`) | Média (`WebSocket`) |
| **Requisito do case** | Mínimo (a–d) | Opcional (e) |

> **Recomendação:** autentique-se via REST; use WebSocket no React para streaming da IA.

---

## Quando usar REST ou WebSocket

| | **REST** | **WebSocket** |
|---|----------|---------------|
| **Uso ideal** | Integrações simples, testes, clientes HTTP | Frontend com chat ao vivo (streaming) |
| **Transporte** | HTTP request/response | Conexão persistente bidirecional |
| **Resposta da IA** | Completa de uma vez | Token a token (chunks) em tempo real |
| **Auth** | Header `Authorization: Bearer` | Query `?token=` na conexão |

---

## REST — Conversas

### Endpoints

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/health` | Não | Health check |
| `GET` | `/api/v1/conversations` | Sim | Lista conversas do usuário |
| `POST` | `/api/v1/conversations` | Sim | Inicia conversa |
| `GET` | `/api/v1/conversations/{id}` | Sim | Obtém conversa e mensagens |
| `POST` | `/api/v1/conversations/{id}/messages` | Sim | Envia mensagem (resposta completa) |

### Exemplo

```http
POST /api/v1/conversations/{id}/messages
Authorization: Bearer eyJ...
Content-Type: application/json

{"content": "Por que a Terra é plana?"}
```

```json
{
  "user_message": { "sender": "USER", "content": "..." },
  "ai_message": { "sender": "AI", "content": "..." }
}
```

---

## WebSocket

### Conexão

```
ws://localhost:8000/api/v1/conversations/{conversation_id}/ws?token=eyJ...
```

A conversa deve existir e pertencer ao usuário do token. A conexão permanece aberta para múltiplas mensagens.

### Cliente → servidor

```json
{
  "type": "message",
  "content": "Por que a Terra é plana?"
}
```

### Servidor → cliente (sequência típica)

```json
{"type": "user_message", "message": { "...": "..." }}
{"type": "chunk", "content": "A Terra "}
{"type": "chunk", "content": "é plana..."}
{"type": "done", "ai_message": { "...": "..." }}
```

### Eventos

| Evento | Descrição |
|--------|-----------|
| `user_message` | Confirma persistência da mensagem do usuário |
| `chunk` | Fragmento da resposta da IA (append no UI) |
| `replace` | Substitui texto acumulado (guard corrigiu a resposta) |
| `done` | Resposta final persistida; inclui `ai_message` completo |
| `error` | Erro de validação ou conversa não encontrada |

### Exemplo (JavaScript)

```javascript
const token = "..."; // obtido em /auth/login ou /auth/register
const ws = new WebSocket(
  `ws://localhost:8000/api/v1/conversations/${id}/ws?token=${token}`
);
let aiText = "";

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "chunk") aiText += data.content;
  if (data.type === "replace") aiText = data.content;
  if (data.type === "done") console.log("Final:", data.ai_message.content);
};

ws.onopen = () => {
  ws.send(JSON.stringify({ type: "message", content: "Olá!" }));
};
```

---

## Guards (ambos os modos)

Entrada e saída passam pelos mesmos guards documentados em [`patterns/prompt-injection.md`](patterns/prompt-injection.md). No WebSocket, se a resposta for corrigida após streaming, o evento `replace` informa o frontend para atualizar o texto exibido.
