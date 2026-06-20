from typing import Protocol

from chatterbox.domain.entities.conversation import Conversation
from chatterbox.domain.entities.message import Message


class ConversationRepository(Protocol):
    async def create(self) -> Conversation: ...

    async def get_by_id(self, conversation_id: str) -> Conversation | None: ...

    async def add_message(self, message: Message) -> Message: ...
