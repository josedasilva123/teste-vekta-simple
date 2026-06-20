from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True)
class AIStreamEvent:
    kind: Literal["chunk", "replace"]
    content: str
