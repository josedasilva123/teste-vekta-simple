# ChatterBox Simple

Versão simplificada do ChatterBox — chat com IA em tela única, sem autenticação.

## Estrutura

```
├── api/    # REST API + WebSocket (Python + FastAPI + MongoDB)
└── web/    # Frontend (React + Vite + Tailwind)
```

## Início rápido

### Docker (API + Web + MongoDB)

```powershell
copy api\.env.example api\.env   # ajuste GEMINI_API_KEY ou AI_PROVIDER=fake
docker compose up --build
```

- API: `http://localhost:8000` (docs em `/docs`)
- Web: `http://localhost:5173`

### Desenvolvimento local

**API**

```powershell
cd api
.\scripts\setup-local.ps1
.\scripts\start-mongodb.ps1   # outro terminal
poetry run chatterbox
```

**Web**

```powershell
cd web
npm install
npm run dev
```

## Diferenças em relação ao ChatterBox completo

- Sem autenticação (JWT, login, cadastro)
- Tela única de chat (sem sidebar, sem React Router)
- Uma conversa por sessão do navegador
