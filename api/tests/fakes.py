from chatterbox.domain.entities.conversation import Conversation
from chatterbox.domain.entities.conversation_summary import ConversationSummary
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

    async def list(self, limit: int = 50) -> list[ConversationSummary]:
        conversations = sorted(
            self._conversations.values(), key=lambda c: c.created_at, reverse=True
        )
        result = []
        for conv in conversations[:limit]:
            messages = self._messages.get(conv.id, [])
            last = messages[-1] if messages else None
            result.append(
                ConversationSummary(
                    id=conv.id,
                    created_at=conv.created_at,
                    preview=last.content[:100] if last else None,
                    message_count=len(messages),
                )
            )
        return result
