from chatterbox.application.services.conversation_loader import load_conversation
from chatterbox.domain.entities.conversation import Conversation
from chatterbox.domain.ports.conversation_repository import ConversationRepository


class GetConversationUseCase:
    def __init__(self, conversation_repository: ConversationRepository) -> None:
        self._conversation_repository = conversation_repository

    async def execute(self, conversation_id: str) -> Conversation:
        return await load_conversation(self._conversation_repository, conversation_id)
