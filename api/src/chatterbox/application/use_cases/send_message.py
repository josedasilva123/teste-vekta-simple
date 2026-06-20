from dataclasses import dataclass

from chatterbox.application.services.message_turn import prepare_message_turn
from chatterbox.domain.entities.message import Message
from chatterbox.domain.enums.sender_role import SenderRole
from chatterbox.domain.ports.ai_service import AIService
from chatterbox.domain.ports.conversation_repository import ConversationRepository


@dataclass
class SendMessageResult:
    user_message: Message
    ai_message: Message


class SendMessageUseCase:
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
    ) -> SendMessageResult:
        turn = await prepare_message_turn(self._conversation_repository, conversation_id, content)
        ai_content = await self._ai_service.generate_reply(turn.history)

        ai_message = Message(
            conversation_id=turn.conversation_id,
            sender=SenderRole.AI,
            content=ai_content,
        )
        await self._conversation_repository.add_message(ai_message)

        return SendMessageResult(user_message=turn.user_message, ai_message=ai_message)
