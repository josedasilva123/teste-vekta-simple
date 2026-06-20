# ChatterBox 2.0 — API

PoC de REST API para conversas com IA (Python + FastAPI + MongoDB).

> Comandos abaixo assumem que você está na pasta `api/` (`cd api`).

## Pré-requisitos

- Python 3.11+
- [Poetry](https://python-poetry.org/)
- MongoDB (uma das opções abaixo)

## Setup local (sem Docker)

Recomendado quando não há espaço ou Docker disponível.

```powershell
# 1. Instalar dependências Python + MongoDB (Win10: baixa MongoDB 7.0 portable)
.\scripts\setup-local.ps1

# 2. Iniciar MongoDB local (em outro terminal — deixe aberto)
.\scripts\start-mongodb.ps1

# 3. Iniciar a API (em outro terminal)
python -m poetry run chatterbox
```

A API estará em `http://localhost:8000` — documentação interativa em `/docs`.

> **Windows 10:** MongoDB 8.x (instalado via winget) **não roda** no Windows 10. O script `setup-local.ps1` instala automaticamente o MongoDB **7.0 portable** em `tools/mongodb/`. Se ainda não tiver, rode manualmente: `.\scripts\install-mongodb-win10.ps1` (~600 MB).

> **Poetry no PATH:** se `poetry run` falhar com caminho de Python inexistente, use sempre `python -m poetry run ...`.

### Alternativas ao MongoDB local

| Opção | Quando usar |
|-------|-------------|
| **MongoDB 7.0 portable** (`scripts/install-mongodb-win10.ps1`) | Windows 10, sem Docker |
| **MongoDB local** (`scripts/start-mongodb.ps1`) | Desenvolvimento offline |
| **MongoDB Atlas** (free tier) | Sem instalar nada; atualize `MONGODB_URI` no `.env` |
| **mongomock** (automático nos testes) | Apenas `pytest`, sem banco real |

### Variáveis de ambiente

Copie `.env.example` para `.env`. Para desenvolvimento sem chave Gemini:

```env
AI_PROVIDER=fake
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=chatterbox
```

## Docker Compose (opcional)

O `docker-compose.yml` fica na **raiz do repositório** e sobe MongoDB, API e Web juntos:

```bash
# na raiz do projeto
docker compose up --build
```

Apenas MongoDB (útil para dev local da API sem container da API):

```bash
docker compose up mongodb -d
```

## Endpoints

Documentação completa (REST **e** WebSocket como alternativas): [`docs/API.md`](docs/API.md).

| Modo | Rota | Descrição |
|------|------|-----------|
| REST | `POST /api/v1/auth/register` | Cadastro |
| REST | `POST /api/v1/auth/login` | Login |
| REST | `GET /api/v1/auth/me` | Perfil autenticado |
| REST | `GET /api/v1/conversations` | Lista conversas do usuário |
| REST | `POST /api/v1/conversations` | Inicia conversa |
| REST | `GET /api/v1/conversations/{id}` | Obtém conversa e mensagens |
| REST | `POST /api/v1/conversations/{id}/messages` | Envia mensagem; resposta completa |
| **WS** | `WS /api/v1/conversations/{id}/ws?token=` | Streaming (requer JWT na query) |
| REST | `GET /health` | Health check |

## Testes

```powershell
poetry run pytest
poetry run pytest tests/unit          # use cases (sem banco)
poetry run pytest tests/integration   # API com mongomock
```

## Estrutura

```
src/chatterbox/
├── domain/          # Entidades, enums, ports (interfaces)
├── application/     # Casos de uso
├── infrastructure/  # MongoDB, Gemini, config
└── presentation/    # FastAPI (routers, schemas)
```

Documentação detalhada em [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) e [`docs/API.md`](docs/API.md).

## Scripts Poetry

```powershell
poetry run chatterbox    # inicia servidor
poetry run pytest        # testes
poetry run ruff check .  # lint
```
