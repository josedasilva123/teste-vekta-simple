# Convenções de nomenclatura

## Arquivos e módulos

- `snake_case` para arquivos Python
- Um use case por arquivo: `send_message.py` → `SendMessageUseCase`

## Classes

| Sufixo | Camada | Exemplo |
|--------|--------|---------|
| `UseCase` | application | `SendMessageUseCase` |
| `Repository` | infrastructure | `MongoConversationRepository` |
| `Service` | infrastructure | `GeminiService`, `FakeAIService` |
| `Schema` | presentation | `MessageSchema`, `ConversationSchema` |

## Enums

- `StrEnum` para valores serializáveis em JSON
- Nomes em UPPER_SNAKE: `SenderRole.USER`, `SenderRole.AI`

## Ports (interfaces)

- Nome descritivo sem prefixo `I`: `ConversationRepository`, `AIService`
- Definidos como `typing.Protocol` em `domain/ports/`

## Exceções de domínio

- Sufixo `Error`: `ConversationNotFoundError`
- Herdam de `DomainError`
- Mapeadas para HTTP na camada presentation
