# Tratamento de erros

## Domínio

Exceções em `domain/exceptions.py`:

```python
class DomainError(Exception): ...
class ConversationNotFoundError(DomainError): ...
```

Use cases **levantam** exceções de domínio — não conhecem HTTP.

## Presentation

Routers capturam e mapeiam para status HTTP:

| Exceção | HTTP Status |
|---------|-------------|
| `ConversationNotFoundError` | 404 |
| Validação Pydantic | 422 (automático pelo FastAPI) |
| Erro não tratado | 500 |

## Exemplo

```python
try:
    result = await use_case.execute(conversation_id, content)
except ConversationNotFoundError as error:
    raise HTTPException(status_code=404, detail=str(error)) from error
```

## Regra

- Nunca importar `HTTPException` em `domain` ou `application`
- Infraestrutura pode levantar exceções de biblioteca; use cases traduzem para domínio quando necessário
