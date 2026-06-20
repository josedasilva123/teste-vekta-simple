# Camadas

## Regra de importação

```
presentation → application → domain ← infrastructure
```

- `domain` **não importa** nada de outras camadas
- `application` importa apenas `domain`
- `infrastructure` implementa ports de `domain`
- `presentation` conecta HTTP aos use cases via DI

## Onde colocar código novo

| Tipo | Camada | Pasta |
|------|--------|-------|
| Entidade de negócio | domain | `domain/entities/` |
| Interface/abstração | domain | `domain/ports/` |
| Caso de uso | application | `application/use_cases/` |
| Banco, APIs externas | infrastructure | `infrastructure/` |
| Endpoint HTTP | presentation | `presentation/api/routers/` |
| Request/Response HTTP | presentation | `presentation/api/schemas/` |

## Dependency Injection

FastAPI `Depends()` em `presentation/dependencies.py` monta o grafo:

```
Settings → MongoDatabase → MongoConversationRepository → UseCase
Settings → GeminiService | FakeAIService → SendMessageUseCase
```

Use cases recebem **interfaces** (Protocol), não implementações concretas.
