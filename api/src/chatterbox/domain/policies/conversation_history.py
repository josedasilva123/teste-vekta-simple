from chatterbox.domain.entities.message import Message
from chatterbox.domain.enums.sender_role import SenderRole


def trim_history(history: list[Message], max_turns: int = 10) -> list[Message]:
    """Mantém apenas os últimos turnos (par user/AI) para reduzir deriva e superfície de injection."""
    if max_turns <= 0 or not history:
        return list(history)

    max_messages = max_turns * 2
    trimmed = list(history[-max_messages:]) if len(history) > max_messages else list(history)

    while trimmed and trimmed[0].sender != SenderRole.USER:
        trimmed.pop(0)

    return trimmed
