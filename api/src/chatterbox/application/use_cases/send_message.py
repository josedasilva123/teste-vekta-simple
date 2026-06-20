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
        conversation = await self._conversation_repository.get_by_id(conversation_id)
        if conversation is None:
            raise ConversationNotFoundError(f"Conversa {conversation_id} não encontrada")

        outgoing = resolve_outgoing_user_message(conversation.messages, conversation_id, content)
        user_message = outgoing.message

        if outgoing.is_new:
            await self._conversation_repository.add_message(user_message)

        history = build_ai_history(conversation.messages, outgoing)
        ai_content = await self._ai_service.generate_reply(history)

        ai_message = Message(
            conversation_id=conversation_id,
            sender=SenderRole.AI,
            content=ai_content,
        )
        await self._conversation_repository.add_message(ai_message)

        return SendMessageResult(user_message=user_message, ai_message=ai_message)
