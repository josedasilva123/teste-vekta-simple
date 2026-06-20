from chatterbox.domain.entities.conversation import Conversation
from chatterbox.domain.entities.message import Message


class FakeConversationRepository:
    def __init__(self) -> None:
        self._conversations: dict[str, Conversation] = {}
        self._messages: dict[str, list[Message]] = {}

    async def create(self) -> Conversation:
        conversation = Conversation()
        self._conversations[conversation.id] = conversation
        self._messages[conversation.id] = []
        return conversation

    async def get_by_id(self, conversation_id: str) -> Conversation | None:
        conversation = self._conversations.get(conversation_id)
        if conversation is None:
            return None
        return Conversation(
            id=conversation.id,
            messages=list(self._messages.get(conversation_id, [])),
            created_at=conversation.created_at,
        )

    async def add_message(self, message: Message) -> Message:
        self._messages.setdefault(message.conversation_id, []).append(message)
        return message
