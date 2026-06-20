from pydantic import BaseModel, Field


class WebSocketClientMessage(BaseModel):
    type: str = Field(..., pattern="^message$")
    content: str = Field(..., min_length=1, max_length=4000)


class WebSocketServerEvent(BaseModel):
    type: str
