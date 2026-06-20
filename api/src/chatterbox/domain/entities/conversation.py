from dataclasses import dataclass, field
from datetime import UTC, datetime
from uuid import uuid4

from chatterbox.domain.entities.message import Message


@dataclass
class Conversation:
    id: str = field(default_factory=lambda: str(uuid4()))
    messages: list[Message] = field(default_factory=list)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
