# ChatterBox Web Simple

Frontend React de tela única para o ChatterBox Simple — chat com IA em tempo real via WebSocket.

## Stack

- React + TypeScript (Vite)
- Tailwind CSS
- Vitest + Testing Library

## Estrutura

```
src/
├── components/     # Atomic Design (atoms, molecules, organisms, templates)
├── domains/chat/   # conversa única e WebSocket
├── pages/          # ChatPage
├── lib/            # HTTP, sessionStorage
└── config/         # variáveis de ambiente
```

## Desenvolvimento

```powershell
copy .env.example .env
npm install
npm run dev
```

Abre em `http://localhost:5173`. A API deve estar em `http://localhost:8000`.

## Testes

```powershell
npm run test
npm run test:unit
npm run test:integration
```
