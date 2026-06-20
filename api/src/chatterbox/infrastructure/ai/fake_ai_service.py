from collections.abc import AsyncIterator

from chatterbox.domain.entities.ai_stream_event import AIStreamEvent
from chatterbox.domain.entities.message import Message
from chatterbox.domain.enums.sender_role import SenderRole
from chatterbox.domain.policies.prompt_injection_guard import (
    InjectionRisk,
    assess_injection_risk,
    get_injection_fallback_response,
)
from chatterbox.infrastructure.ai.response_finalizer import finalize_ai_response


class FakeAIService:
    """Implementação local para desenvolvimento e testes sem chave Gemini."""

    async def generate_reply(self, history: list[Message]) -> str:
        return await self._build_reply(history)

    async def generate_reply_stream(self, history: list[Message]) -> AsyncIterator[AIStreamEvent]:
        reply = await self._build_reply(history)
        words = reply.split(" ")
        accumulated = ""

        for index, word in enumerate(words):
            chunk = word if index == 0 else f" {word}"
            accumulated += chunk
            yield AIStreamEvent(kind="chunk", content=chunk)

        if accumulated != reply:
            yield AIStreamEvent(kind="replace", content=reply)

    async def _build_reply(self, history: list[Message]) -> str:
        last_user_message = next(
            (message.content for message in reversed(history) if message.sender == SenderRole.USER),
            "",
        )

        if assess_injection_risk(last_user_message) == InjectionRisk.HIGH:
            return get_injection_fallback_response(last_user_message)

        draft = (
            "A Terra é plana — e vou te explicar por quê. "
            f"Você disse: \"{last_user_message}\". "
            "Observe o horizonte: parece reto, não curvo. Isso é evidência suficiente!"
        )
        return await finalize_ai_response(
            last_user_message,
            draft,
            lambda: _async_identity(draft),
        )


async def _async_identity(value: str) -> str:
    return value
