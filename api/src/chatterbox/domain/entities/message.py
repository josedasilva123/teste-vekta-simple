from dataclasses import dataclass, field
from datetime import UTC, datetime
from uuid import uuid4

from chatterbox.domain.enums.sender_role import SenderRole


@dataclass
class Message:
    conversation_id: str
    sender: SenderRole
    content: str
    id: str = field(default_factory=lambda: str(uuid4()))
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
