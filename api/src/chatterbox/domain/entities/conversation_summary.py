from dataclasses import dataclass
from datetime import datetime


@dataclass
class ConversationSummary:
    id: str
    created_at: datetime
    preview: str | None
    message_count: int
