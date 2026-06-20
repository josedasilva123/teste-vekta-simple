from google.genai import types

from chatterbox.domain.entities.message import Message
from chatterbox.domain.enums.sender_role import SenderRole
from chatterbox.domain.policies.conversation_history import trim_history
from chatterbox.domain.policies.prompt_injection_guard import (
    InjectionRisk,
    assess_injection_risk,
    build_safe_user_content,
)


def build_model_contents(history: list[Message], max_turns: int = 10) -> list[types.Content]:
    trimmed = trim_history(history, max_turns)
    latest_user_index = _latest_user_index(trimmed)

    contents: list[types.Content] = []
    for index, item in enumerate(trimmed):
        text = item.content
        if item.sender == SenderRole.USER and index == latest_user_index:
            risk = assess_injection_risk(text)
            if risk != InjectionRisk.HIGH:
                text = build_safe_user_content(text, risk)

        contents.append(
            types.Content(
                role="user" if item.sender == SenderRole.USER else "model",
                parts=[types.Part.from_text(text=text)],
            )
        )

    return contents


def _latest_user_index(messages: list[Message]) -> int | None:
    for index in range(len(messages) - 1, -1, -1):
        if messages[index].sender == SenderRole.USER:
            return index
    return None
