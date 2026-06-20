from chatterbox.domain.entities.conversation import Conversation
from chatterbox.domain.exceptions import ConversationNotFoundError
from chatterbox.domain.ports.conversation_repository import ConversationRepository


class GetConversationUseCase:
    def __init__(self, conversation_repository: ConversationRepository) -> None:
        self._conversation_repository = conversation_repository

    async def execute(self, conversation_id: str) -> Conversation:
        conversation = await self._conversation_repository.get_by_id(conversation_id)
        if conversation is None:
            raise ConversationNotFoundError(f"Conversa {conversation_id} não encontrada")
        return conversation
