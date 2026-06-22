from chatterbox.domain.entities.conversation_summary import ConversationSummary
from chatterbox.domain.ports.conversation_repository import ConversationRepository


class ListConversationsUseCase:
    def __init__(self, repository: ConversationRepository) -> None:
        self._repository = repository

    async def execute(self, limit: int = 50) -> list[ConversationSummary]:
        return await self._repository.list(limit=limit)
