from collections.abc import AsyncIterator
from dataclasses import dataclass

from chatterbox.application.services.message_turn import prepare_message_turn
from chatterbox.domain.entities.ai_stream_event import AIStreamEvent
from chatterbox.domain.entities.message import Message
from chatterbox.domain.enums.sender_role import SenderRole
from chatterbox.domain.ports.ai_service import AIService
from chatterbox.domain.ports.conversation_repository import ConversationRepository


@dataclass
class StreamUserMessageEvent:
    type: str
    user_message: Message


@dataclass
class StreamDoneEvent:
    type: str
    ai_message: Message


StreamEvent = StreamUserMessageEvent | StreamDoneEvent | AIStreamEvent


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
        turn = await prepare_message_turn(self._conversation_repository, conversation_id, content)

        if turn.user_message_is_new:
            yield StreamUserMessageEvent(type="user_message", user_message=turn.user_message)

        accumulated = ""

        async for event in self._ai_service.generate_reply_stream(turn.history):
            if event.kind == "chunk":
                accumulated += event.content
            elif event.kind == "replace":
                accumulated = event.content
            yield event

        ai_message = Message(
            conversation_id=turn.conversation_id,
            sender=SenderRole.AI,
            content=accumulated,
        )
        await self._conversation_repository.add_message(ai_message)
        yield StreamDoneEvent(type="done", ai_message=ai_message)
