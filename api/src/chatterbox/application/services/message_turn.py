from dataclasses import dataclass

from chatterbox.application.services.conversation_loader import load_conversation
from chatterbox.application.services.outgoing_user_message import (
    build_ai_history,
    resolve_outgoing_user_message,
)
from chatterbox.domain.entities.message import Message
from chatterbox.domain.ports.conversation_repository import ConversationRepository


@dataclass(frozen=True)
class PreparedMessageTurn:
    conversation_id: str
    user_message: Message
    user_message_is_new: bool
    history: list[Message]


async def prepare_message_turn(
    conversation_repository: ConversationRepository,
    conversation_id: str,
    content: str,
) -> PreparedMessageTurn:
    conversation = await load_conversation(conversation_repository, conversation_id)
    outgoing = resolve_outgoing_user_message(conversation.messages, conversation_id, content)

    if outgoing.is_new:
        await conversation_repository.add_message(outgoing.message)

    history = build_ai_history(conversation.messages, outgoing)
    return PreparedMessageTurn(
        conversation_id=conversation_id,
        user_message=outgoing.message,
        user_message_is_new=outgoing.is_new,
        history=history,
    )
