# Testes

## Pirâmide

```
        ┌─────────┐
        │  e2e    │  (futuro: com MongoDB real)
       ┌┴─────────┴┐
       │ integration│  tests/integration/ — API + mongomock
      ┌┴───────────┴┐
      │    unit      │  tests/unit/ — use cases + fakes
      └──────────────┘
```

## Unitários (`tests/unit/`)

- Testam use cases isoladamente
- Usam `FakeConversationRepository` e `FakeAIService`
- Sem I/O de rede ou banco

## Integração (`tests/integration/`)

- Testam endpoints HTTP com `httpx.AsyncClient`
- MongoDB substituído por `mongomock_motor.AsyncMongoMockClient`
- `AI_PROVIDER=fake` para respostas determinísticas

## Executar

```powershell
poetry run pytest                    # todos
poetry run pytest tests/unit -v      # unitários
poetry run pytest tests/integration  # integração
poetry run pytest -k send_message    # filtro por nome
```

## Fixtures

- `tests/conftest.py` — `FakeConversationRepository`
- `tests/integration/test_api.py` — fixture `client` com app configurada

## Ao adicionar testes

1. Novo use case → teste unitário com fakes
2. Novo endpoint → teste de integração com mongomock
3. Evite depender de MongoDB real ou Gemini nos testes automatizados
