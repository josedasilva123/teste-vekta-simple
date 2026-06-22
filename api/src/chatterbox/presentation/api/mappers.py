from chatterbox.domain.entities.conversation import Conversation
from chatterbox.domain.entities.conversation_summary import ConversationSummary
from chatterbox.domain.entities.message import Message
from chatterbox.presentation.api.schemas.conversation import (
    ConversationSchema,
    ConversationSummarySchema,
    MessageSchema,
    SendMessageResponse,
)


def to_message_schema(message: Message) -> MessageSchema:
    return MessageSchema(
        id=message.id,
        conversation_id=message.conversation_id,
        sender=message.sender,
        content=message.content,
        created_at=message.created_at,
    )


def to_conversation_schema(conversation: Conversation) -> ConversationSchema:
    return ConversationSchema(
        id=conversation.id,
        messages=[to_message_schema(message) for message in conversation.messages],
        created_at=conversation.created_at,
    )


def to_conversation_summary_schema(summary: ConversationSummary) -> ConversationSummarySchema:
    return ConversationSummarySchema(
        id=summary.id,
        created_at=summary.created_at,
        preview=summary.preview,
        message_count=summary.message_count,
    )


def to_send_message_response(
    user_message: Message,
    ai_message: Message,
) -> SendMessageResponse:
    return SendMessageResponse(
        user_message=to_message_schema(user_message),
        ai_message=to_message_schema(ai_message),
    )
