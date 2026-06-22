from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from chatterbox.infrastructure.config.settings import settings
from chatterbox.infrastructure.persistence.mongo_conversation_repository import (
    MongoConversationRepository,
)
from chatterbox.infrastructure.persistence.mongo_launcher import ensure_local_mongodb_running
from chatterbox.infrastructure.persistence.mongo_database import MongoDatabase
from chatterbox.presentation.api.routers.conversations import router as conversations_router
from chatterbox.presentation.api.routers.conversations_ws import router as conversations_ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await ensure_local_mongodb_running(settings)
    mongo_database = MongoDatabase(settings)
    await mongo_database.connect()
    await MongoConversationRepository(mongo_database).ensure_indexes()
    app.state.mongo_database = mongo_database
    yield
    await mongo_database.disconnect()


app = FastAPI(
    title="ChatterBox Simple API",
    description=(
        "API simplificada para conversas com IA — sem autenticação. "
        "REST (resposta completa) e WebSocket (streaming em tempo real)."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(conversations_router, prefix="/api/v1")
app.include_router(conversations_ws_router, prefix="/api/v1")


@app.get("/health", tags=["health"])
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


def run() -> None:
    uvicorn.run(
        "chatterbox.presentation.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload,
    )


if __name__ == "__main__":
    run()
