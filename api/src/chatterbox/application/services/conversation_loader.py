from chatterbox.domain.entities.conversation import Conversation
from chatterbox.domain.exceptions import ConversationNotFoundError
from chatterbox.domain.ports.conversation_repository import ConversationRepository


async def load_conversation(
    conversation_repository: ConversationRepository,
    conversation_id: str,
) -> Conversation:
    conversation = await conversation_repository.get_by_id(conversation_id)
    if conversation is None:
        raise ConversationNotFoundError(f"Conversa {conversation_id} não encontrada")
    return conversation
