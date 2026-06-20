from typing import Annotated

from fastapi import Depends, Request

from chatterbox.application.use_cases.get_conversation import GetConversationUseCase
from chatterbox.application.use_cases.send_message import SendMessageUseCase
from chatterbox.application.use_cases.start_conversation import StartConversationUseCase
from chatterbox.domain.ports.ai_service import AIService
from chatterbox.domain.ports.conversation_repository import ConversationRepository
from chatterbox.infrastructure.ai.fake_ai_service import FakeAIService
from chatterbox.infrastructure.ai.gemini_service import GeminiService
from chatterbox.infrastructure.config.settings import Settings, settings
from chatterbox.infrastructure.persistence.mongo_conversation_repository import (
    MongoConversationRepository,
)
from chatterbox.infrastructure.persistence.mongo_database import MongoDatabase


def get_settings() -> Settings:
    return settings


def get_mongo_database(
    request: Request,
    app_settings: Annotated[Settings, Depends(get_settings)],
) -> MongoDatabase:
    return request.app.state.mongo_database


def get_conversation_repository(
    mongo_database: Annotated[MongoDatabase, Depends(get_mongo_database)],
) -> ConversationRepository:
    return MongoConversationRepository(mongo_database)


def get_ai_service(
    app_settings: Annotated[Settings, Depends(get_settings)],
) -> AIService:
    if app_settings.ai_provider.lower() == "fake":
        return FakeAIService()
    return GeminiService(app_settings)


def get_start_conversation_use_case(
    repository: Annotated[ConversationRepository, Depends(get_conversation_repository)],
) -> StartConversationUseCase:
    return StartConversationUseCase(repository)


def get_get_conversation_use_case(
    repository: Annotated[ConversationRepository, Depends(get_conversation_repository)],
) -> GetConversationUseCase:
    return GetConversationUseCase(repository)


def get_send_message_use_case(
    repository: Annotated[ConversationRepository, Depends(get_conversation_repository)],
    ai_service: Annotated[AIService, Depends(get_ai_service)],
) -> SendMessageUseCase:
    return SendMessageUseCase(repository, ai_service)
