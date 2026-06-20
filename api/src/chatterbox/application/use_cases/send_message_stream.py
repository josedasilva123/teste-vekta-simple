from collections.abc import AsyncIterator
from dataclasses import dataclass

from chatterbox.application.services.outgoing_user_message import (
    build_ai_history,
    resolve_outgoing_user_message,
)
from chatterbox.domain.entities.message import Message
from chatterbox.domain.enums.sender_role import SenderRole
from chatterbox.domain.exceptions import ConversationNotFoundError
from chatterbox.domain.ports.ai_service import AIService
from chatterbox.domain.ports.conversation_repository import ConversationRepository


@dataclass
class StreamUserMessageEvent:
    type: str
    user_message: Message


@dataclass
class StreamChunkEvent:
    type: str
    content: str


@dataclass
class StreamReplaceEvent:
    type: str
    content: str


@dataclass
class StreamDoneEvent:
    type: str
    ai_message: Message


StreamEvent = StreamUserMessageEvent | StreamChunkEvent | StreamReplaceEvent | StreamDoneEvent


class SendMessageStreamUseCase:
    def __init__(
        self,
        conversation_repository: ConversationRepository,
        ai_service: AIService,
    ) -> None:
        self._conversation_repository = conversation_repository
        self._ai_service = ai_service

    async def execute(
        self,
        conversation_id: str,
        content: str,
    ) -> AsyncIterator[StreamEvent]:
        conversation = await self._conversation_repository.get_by_id(conversation_id)
        if conversation is None:
            raise ConversationNotFoundError(f"Conversa {conversation_id} não encontrada")

        outgoing = resolve_outgoing_user_message(conversation.messages, conversation_id, content)
        user_message = outgoing.message

        if outgoing.is_new:
            await self._conversation_repository.add_message(user_message)
            yield StreamUserMessageEvent(type="user_message", user_message=user_message)

        history = build_ai_history(conversation.messages, outgoing)
        accumulated = ""

        async for event in self._ai_service.generate_reply_stream(history):
            if event.kind == "chunk":
                accumulated += event.content
                yield StreamChunkEvent(type="chunk", content=event.content)
            elif event.kind == "replace":
                accumulated = event.content
                yield StreamReplaceEvent(type="replace", content=event.content)

        ai_message = Message(
            conversation_id=conversation_id,
            sender=SenderRole.AI,
            content=accumulated,
        )
        await self._conversation_repository.add_message(ai_message)
        yield StreamDoneEvent(type="done", ai_message=ai_message)
