# Arquitetura — ChatterBox API

## Visão geral

A API segue **Clean Architecture** com quatro camadas. A regra central: dependências apontam **para dentro** — camadas externas conhecem as internas, nunca o contrário.

```
┌─────────────────────────────────────────┐
│           presentation (FastAPI)       │
├─────────────────────────────────────────┤
│           application (use cases)        │
├─────────────────────────────────────────┤
│           domain (entities + ports)      │
├─────────────────────────────────────────┤
│     infrastructure (MongoDB, Gemini)     │
└─────────────────────────────────────────┘
```

## Camadas

| Camada | Responsabilidade | Exemplos |
|--------|------------------|----------|
| **domain** | Regras e contratos puros | `Conversation`, `Message`, `ConversationRepository` (Protocol) |
| **application** | Orquestração de casos de uso | `SendMessageUseCase`, `StartConversationUseCase` |
| **infrastructure** | Implementações concretas | `MongoConversationRepository`, `GeminiService` |
| **presentation** | HTTP, DTOs, DI | Routers, schemas Pydantic, `dependencies.py` |

## Fluxo: enviar mensagem

1. Router recebe `POST /conversations/{id}/messages`
2. `SendMessageUseCase` valida existência da conversa
3. Persiste mensagem do usuário via `ConversationRepository`
4. Chama `AIService.generate_reply()` com histórico
5. Persiste resposta da IA
6. Retorna ambas as mensagens

## Decisões

- **FastAPI** — async nativo, OpenAPI automático, WebSocket futuro
- **Motor** — driver async oficial do MongoDB
- **Poetry** — lockfile reproduzível
- **FakeAIService** — desenvolvimento e testes sem API externa
- **Prompt guards** — defesa em camadas contra injection (ver `docs/patterns/prompt-injection.md`)
- **mongomock-motor** — testes de integração sem banco real

Ver também: [`docs/patterns/`](patterns/).
