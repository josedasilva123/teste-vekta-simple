from datetime import datetime

from pydantic import BaseModel, Field

from chatterbox.domain.enums.sender_role import SenderRole


class MessageSchema(BaseModel):
    id: str
    conversation_id: str
    sender: SenderRole
    content: str
    created_at: datetime


class ConversationSchema(BaseModel):
    id: str
    messages: list[MessageSchema]
    created_at: datetime


class CreateMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)


class SendMessageResponse(BaseModel):
    user_message: MessageSchema
    ai_message: MessageSchema
