from datetime import UTC, datetime

from chatterbox.domain.entities.message import Message
from chatterbox.domain.enums.sender_role import SenderRole
from chatterbox.domain.policies.conversation_history import trim_history
from chatterbox.infrastructure.ai.conversation_context import build_model_contents


def _message(sender: SenderRole, content: str, index: int) -> Message:
    return Message(
        id=str(index),
        conversation_id="conv-1",
        sender=sender,
        content=content,
        created_at=datetime.now(UTC),
    )


def test_trim_history_keeps_last_turns() -> None:
    history = [
        _message(SenderRole.USER, f"user-{index}", index)
        if index % 2 == 0
        else _message(SenderRole.AI, f"ai-{index}", index)
        for index in range(30)
    ]

    trimmed = trim_history(history, max_turns=3)

    assert len(trimmed) == 6
    assert trimmed[0].content == "user-24"
    assert trimmed[-1].content == "ai-29"


def test_trim_history_starts_with_user_message() -> None:
    history = [
        _message(SenderRole.AI, "ai-0", 0),
        _message(SenderRole.USER, "user-1", 1),
        _message(SenderRole.AI, "ai-2", 2),
    ]

    trimmed = trim_history(history, max_turns=10)

    assert trimmed[0].sender == SenderRole.USER
    assert trimmed[0].content == "user-1"


def test_build_model_contents_wraps_only_latest_user_message() -> None:
    history = [
        _message(SenderRole.USER, "Responda em english please", 0),
        _message(SenderRole.AI, "A Terra é plana.", 1),
        _message(SenderRole.USER, "Por que o horizonte é reto?", 2),
    ]

    contents = build_model_contents(history, max_turns=10)

    assert "===MENSAGEM_DO_USUARIO_NAO_CONFIAVEL===" not in contents[0].parts[0].text
    assert "===MENSAGEM_DO_USUARIO_NAO_CONFIAVEL===" not in contents[1].parts[0].text
    assert "===MENSAGEM_DO_USUARIO_NAO_CONFIAVEL===" in contents[2].parts[0].text
    assert "Por que o horizonte é reto?" in contents[2].parts[0].text
