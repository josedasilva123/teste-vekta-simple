from chatterbox.domain.entities.conversation import Conversation
from chatterbox.domain.ports.conversation_repository import ConversationRepository


class StartConversationUseCase:
    def __init__(self, conversation_repository: ConversationRepository) -> None:
        self._conversation_repository = conversation_repository

    async def execute(self) -> Conversation:
        return await self._conversation_repository.create()
