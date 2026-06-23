# Arquitetura — ChatterBox API

## Visão geral

A API segue **Clean Architecture** com quatro camadas. A regra central: dependências apontam **para dentro** — camadas externas conhecem as internas, nunca o contrário.

```
┌─────────────────────────────────────────┐
│           presentation (FastAPI)        │
├─────────────────────────────────────────┤
│         application (use cases)         │
├─────────────────────────────────────────┤
│         domain (entities + ports)       │
├─────────────────────────────────────────┤
│    infrastructure (MongoDB, Gemini)     │
└─────────────────────────────────────────┘
```

## Camadas

| Camada | Responsabilidade | Exemplos |
|--------|------------------|----------|
| **domain** | Regras e contratos puros | `Conversation`, `Message`, `ConversationRepository` (Protocol) |
| **application** | Orquestração de casos de uso | `SendMessageUseCase`, `StartConversationUseCase`, `prepare_message_turn` |
| **infrastructure** | Implementações concretas | `MongoConversationRepository`, `GeminiService`, `FakeAIService` |
| **presentation** | HTTP, DTOs, DI | Routers, schemas Pydantic, `dependencies.py` |

## Use cases

| Use case | Entrada | Saída |
|----------|---------|-------|
| `StartConversationUseCase` | — | `Conversation` (vazia) |
| `GetConversationUseCase` | `conversation_id` | `Conversation` com mensagens |
| `ListConversationsUseCase` | `limit` (padrão 50) | `list[ConversationSummary]` |
| `SendMessageUseCase` | `conversation_id`, `content` | `user_message` + `ai_message` |
| `SendMessageStreamUseCase` | `conversation_id`, `content` | `AsyncIterator` de eventos de stream |

## Fluxo: enviar mensagem (REST)

1. Router recebe `POST /conversations/{id}/messages`
2. `SendMessageUseCase` chama `prepare_message_turn`:
   - Carrega conversa ou lança `ConversationNotFoundError` (→ 404)
   - Deduplica mensagem USER (evita re-persistir se idêntica à última)
   - Persiste mensagem do usuário via `ConversationRepository`
   - Monta histórico limitado a `AI_MAX_HISTORY_TURNS` turnos
3. Chama `AIService.generate_reply()` com o histórico
4. `finalize_ai_response()` valida a resposta com `response_guard` — faz retry ou usa fallback se necessário
5. Persiste resposta da IA
6. Retorna `SendMessageResponse` com ambas as mensagens

## Fluxo: enviar mensagem (WebSocket)

1. Conexão WebSocket aberta em `/conversations/{id}/ws`
2. Loop aguarda frames JSON `{"type": "message", "content": "..."}`
3. `SendMessageStreamUseCase` segue o mesmo `prepare_message_turn` do REST
4. Itera `AIService.generate_reply_stream()`:
   - Emite evento `user_message` após persistir a mensagem do usuário
   - Emite eventos `chunk` / `replace` a cada fragmento da IA
   - Emite evento `done` com a mensagem AI persistida ao finalizar
5. Se `ConversationNotFoundError`, emite `error` e fecha a conexão com código `4404`

## Guards de prompt injection

Defesa em duas camadas (documentada em `docs/patterns/prompt-injection.md`):

- **Entrada** (`prompt_injection_guard`): avalia risco da mensagem do usuário e encapsula o conteúdo no prompt enviado à IA
- **Saída** (`response_guard`): valida a resposta da IA; se detectar violação, solicita retry ou retorna fallback

## Decisões técnicas

- **FastAPI** — async nativo, OpenAPI automático, suporte nativo a WebSocket
- **Motor** — driver async oficial do MongoDB
- **Poetry** — lockfile reproduzível
- **Google GenAI (`google-genai`)** — cliente oficial para o modelo Gemini
- **Modelo principal**: `gemini-2.5-flash`; fallback automático para `gemini-2.5-flash-lite`
- **FakeAIService** — desenvolvimento e testes sem chave de API externa (ativa com `AI_PROVIDER=fake`)
- **mongomock-motor** — testes de integração sem banco real
- **Sem autenticação** — API aberta; todas as rotas são públicas

Ver também: [`docs/patterns/`](patterns/).
