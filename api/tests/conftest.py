from contextlib import asynccontextmanager

import pytest
from httpx import ASGITransport, AsyncClient
from mongomock_motor import AsyncMongoMockClient
from starlette.testclient import TestClient

from chatterbox.infrastructure.config import settings as settings_module
from chatterbox.infrastructure.config.settings import Settings
from chatterbox.infrastructure.persistence.mongo_database import MongoDatabase
from chatterbox.presentation.main import app


@pytest.fixture
def test_settings() -> Settings:
    return Settings(
        mongodb_uri="mongodb://localhost:27017",
        mongodb_database="chatterbox_test",
        ai_provider="fake",
        api_reload=False,
    )


@pytest.fixture
def mongo_database(test_settings: Settings) -> MongoDatabase:
    database = MongoDatabase(test_settings)
    database._client = AsyncMongoMockClient()
    return database


@pytest.fixture
def patched_settings(monkeypatch, test_settings: Settings):
    monkeypatch.setattr(settings_module, "settings", test_settings)
    monkeypatch.setattr(
        "chatterbox.presentation.dependencies.settings",
        test_settings,
    )
    monkeypatch.setattr(
        "chatterbox.presentation.api.routers.conversations_ws.settings",
        test_settings,
    )


@pytest.fixture
def mock_mongo_lifespan(monkeypatch, mongo_database: MongoDatabase):
    @asynccontextmanager
    async def test_lifespan(application):
        application.state.mongo_database = mongo_database
        yield

    monkeypatch.setattr("chatterbox.presentation.main.lifespan", test_lifespan)


@pytest.fixture
async def client(patched_settings, mock_mongo_lifespan, mongo_database: MongoDatabase):
    app.state.mongo_database = mongo_database
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as http_client:
        yield http_client


@pytest.fixture
def ws_test_app(mongo_database: MongoDatabase, patched_settings):
    @asynccontextmanager
    async def test_lifespan(application):
        application.state.mongo_database = mongo_database
        yield

    app.router.lifespan_context = test_lifespan
    return app


@pytest.fixture
def ws_client(ws_test_app):
    with TestClient(ws_test_app) as client:
        yield client


@pytest.fixture
def fake_repository():
    from tests.fakes import FakeConversationRepository

    return FakeConversationRepository()
