from collections.abc import AsyncIterator
from dataclasses import dataclass

from google import genai
from google.genai import errors, types

from chatterbox.domain.entities.ai_stream_event import AIStreamEvent
from chatterbox.domain.entities.message import Message
from chatterbox.domain.policies.conversation_history import latest_user_message_content
from chatterbox.domain.policies.prompt_injection_guard import (
    InjectionRisk,
    assess_injection_risk,
    get_injection_fallback_response,
)
from chatterbox.infrastructure.ai.conversation_context import build_model_contents
from chatterbox.infrastructure.ai.prompts import FLAT_EARTH_SYSTEM_PROMPT, RETRY_SYSTEM_APPENDIX
from chatterbox.infrastructure.ai.response_finalizer import finalize_ai_response
from chatterbox.infrastructure.config.settings import Settings


@dataclass(frozen=True)
class _PreparedGeneration:
    latest_user_message: str
    contents: list[types.Content]
    fallback: str | None


class GeminiService:
    def __init__(self, settings: Settings) -> None:
        self._client = genai.Client(api_key=settings.gemini_api_key)
        self._model = settings.gemini_model
        self._fallback_model = settings.gemini_fallback_model
        self._settings = settings

    async def generate_reply(self, history: list[Message]) -> str:
        prepared = self._prepare(history)
        if prepared.fallback is not None:
            return prepared.fallback

        response_text = await self._generate_with_fallback(prepared.contents, FLAT_EARTH_SYSTEM_PROMPT)

        return await finalize_ai_response(
            prepared.latest_user_message,
            response_text,
            lambda: self._generate_with_fallback(
                prepared.contents,
                f"{FLAT_EARTH_SYSTEM_PROMPT}\n\n{RETRY_SYSTEM_APPENDIX}",
            ),
        )

    async def generate_reply_stream(self, history: list[Message]) -> AsyncIterator[AIStreamEvent]:
        prepared = self._prepare(history)
        if prepared.fallback is not None:
            yield AIStreamEvent(kind="chunk", content=prepared.fallback)
            return

        accumulated = ""

        async for event in self._stream_with_fallback(prepared.contents, FLAT_EARTH_SYSTEM_PROMPT):
            if event.kind == "chunk":
                accumulated += event.content
            yield event

        final_text = await finalize_ai_response(
            prepared.latest_user_message,
            accumulated,
            lambda: self._generate_with_fallback(
                prepared.contents,
                f"{FLAT_EARTH_SYSTEM_PROMPT}\n\n{RETRY_SYSTEM_APPENDIX}",
            ),
        )
        if final_text != accumulated:
            yield AIStreamEvent(kind="replace", content=final_text)

    def _prepare(self, history: list[Message]) -> _PreparedGeneration:
        latest_user_message = latest_user_message_content(history)
        if latest_user_message and assess_injection_risk(latest_user_message) == InjectionRisk.HIGH:
            return _PreparedGeneration(
                latest_user_message,
                [],
                get_injection_fallback_response(latest_user_message),
            )

        contents = build_model_contents(history, self._settings.ai_max_history_turns)
        return _PreparedGeneration(latest_user_message, contents, None)

    def _generation_config(self, system_instruction: str) -> types.GenerateContentConfig:
        return types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=self._settings.gemini_temperature,
            top_p=self._settings.gemini_top_p,
            max_output_tokens=self._settings.gemini_max_output_tokens,
        )

    async def _generate_with_fallback(
        self,
        contents: list[types.Content],
        system_instruction: str,
    ) -> str:
        for model in (self._model, self._fallback_model):
            try:
                response = await self._client.aio.models.generate_content(
                    model=model,
                    contents=contents,
                    config=self._generation_config(system_instruction),
                )
                return response.text or ""
            except errors.APIError:
                if model == self._fallback_model:
                    raise
        return ""

    async def _stream_with_fallback(
        self,
        contents: list[types.Content],
        system_instruction: str,
    ) -> AsyncIterator[AIStreamEvent]:
        for model in (self._model, self._fallback_model):
            try:
                stream = await self._client.aio.models.generate_content_stream(
                    model=model,
                    contents=contents,
                    config=self._generation_config(system_instruction),
                )
                async for chunk in stream:
                    text = chunk.text or ""
                    if not text:
                        continue
                    yield AIStreamEvent(kind="chunk", content=text)
                return
            except errors.APIError:
                if model == self._fallback_model:
                    raise
