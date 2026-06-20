from collections.abc import AsyncIterator

from google import genai
from google.genai import errors, types

from chatterbox.domain.entities.ai_stream_event import AIStreamEvent
from chatterbox.domain.entities.message import Message
from chatterbox.domain.enums.sender_role import SenderRole
from chatterbox.domain.policies.prompt_injection_guard import (
    InjectionRisk,
    assess_injection_risk,
    get_injection_fallback_response,
)
from chatterbox.infrastructure.ai.conversation_context import build_model_contents
from chatterbox.infrastructure.ai.prompts import FLAT_EARTH_SYSTEM_PROMPT, RETRY_SYSTEM_APPENDIX
from chatterbox.infrastructure.ai.response_finalizer import finalize_ai_response
from chatterbox.infrastructure.config.settings import Settings


class GeminiService:
    def __init__(self, settings: Settings) -> None:
        self._client = genai.Client(api_key=settings.gemini_api_key)
        self._model = settings.gemini_model
        self._fallback_model = settings.gemini_fallback_model
        self._settings = settings

    async def generate_reply(self, history: list[Message]) -> str:
        latest_user_message = _latest_user_message(history)
        if latest_user_message and assess_injection_risk(latest_user_message) == InjectionRisk.HIGH:
            return get_injection_fallback_response(latest_user_message)

        contents = build_model_contents(history, self._settings.ai_max_history_turns)
        response_text = await self._generate(contents, FLAT_EARTH_SYSTEM_PROMPT)

        return await finalize_ai_response(
            latest_user_message,
            response_text,
            lambda: self._generate(
                contents,
                f"{FLAT_EARTH_SYSTEM_PROMPT}\n\n{RETRY_SYSTEM_APPENDIX}",
            ),
        )

    async def generate_reply_stream(self, history: list[Message]) -> AsyncIterator[AIStreamEvent]:
        latest_user_message = _latest_user_message(history)
        if latest_user_message and assess_injection_risk(latest_user_message) == InjectionRisk.HIGH:
            fallback = get_injection_fallback_response(latest_user_message)
            yield AIStreamEvent(kind="chunk", content=fallback)
            return

        contents = build_model_contents(history, self._settings.ai_max_history_turns)
        accumulated = ""

        async for event in self._stream_with_fallback(contents, FLAT_EARTH_SYSTEM_PROMPT):
            if event.kind == "chunk":
                accumulated += event.content
            yield event

        final_text = await finalize_ai_response(
            latest_user_message,
            accumulated,
            lambda: self._generate(
                contents,
                f"{FLAT_EARTH_SYSTEM_PROMPT}\n\n{RETRY_SYSTEM_APPENDIX}",
            ),
        )
        if final_text != accumulated:
            yield AIStreamEvent(kind="replace", content=final_text)

    async def _generate(self, contents: list[types.Content], system_instruction: str) -> str:
        return await self._generate_with_fallback(contents, system_instruction)

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


def _latest_user_message(history: list[Message]) -> str:
    for item in reversed(history):
        if item.sender == SenderRole.USER:
            return item.content
    return ""
