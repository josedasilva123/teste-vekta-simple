from dataclasses import dataclass

from chatterbox.domain.entities.message import Message
from chatterbox.domain.enums.sender_role import SenderRole


@dataclass(frozen=True)
class OutgoingUserMessage:
    message: Message
    is_new: bool


def resolve_outgoing_user_message(
    messages: list[Message],
    conversation_id: str,
    content: str,
) -> OutgoingUserMessage:
    trimmed = content.strip()
    if (
        messages
        and messages[-1].sender == SenderRole.USER
        and messages[-1].content.strip() == trimmed
    ):
        return OutgoingUserMessage(message=messages[-1], is_new=False)

    return OutgoingUserMessage(
        message=Message(
            conversation_id=conversation_id,
            sender=SenderRole.USER,
            content=content,
        ),
        is_new=True,
    )


def build_ai_history(messages: list[Message], outgoing: OutgoingUserMessage) -> list[Message]:
    if outgoing.is_new:
        return messages + [outgoing.message]
    return messages
