from collections.abc import AsyncIterator
from typing import Protocol

from chatterbox.domain.entities.ai_stream_event import AIStreamEvent
from chatterbox.domain.entities.message import Message


class AIService(Protocol):
    async def generate_reply(self, history: list[Message]) -> str: ...

    def generate_reply_stream(
        self,
        history: list[Message],
    ) -> AsyncIterator[AIStreamEvent]: ...
