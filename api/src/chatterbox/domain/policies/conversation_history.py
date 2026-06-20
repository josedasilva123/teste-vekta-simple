from chatterbox.domain.entities.message import Message
from chatterbox.domain.enums.sender_role import SenderRole


def latest_user_message_content(messages: list[Message]) -> str:
    for message in reversed(messages):
        if message.sender == SenderRole.USER:
            return message.content
    return ""
