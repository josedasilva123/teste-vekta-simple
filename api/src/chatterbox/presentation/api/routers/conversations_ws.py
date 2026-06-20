import json
from typing import Annotated

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from chatterbox.application.use_cases.send_message_stream import (
    SendMessageStreamUseCase,
    StreamDoneEvent,
    StreamUserMessageEvent,
)
from chatterbox.domain.entities.ai_stream_event import AIStreamEvent
from chatterbox.domain.exceptions import ConversationNotFoundError
from chatterbox.infrastructure.ai.error_messages import format_ai_error
from chatterbox.presentation.api.mappers import to_message_schema
from chatterbox.presentation.api.schemas.websocket import WebSocketClientMessage
from chatterbox.presentation.dependencies import get_send_message_stream_use_case

router = APIRouter(prefix="/conversations", tags=["conversations-ws"])


@router.websocket("/{conversation_id}/ws")
async def conversation_websocket(
    websocket: WebSocket,
    conversation_id: str,
    use_case: Annotated[SendMessageStreamUseCase, Depends(get_send_message_stream_use_case)],
) -> None:
    await websocket.accept()

    try:
        while True:
            payload = await websocket.receive_json()
            try:
                client_message = WebSocketClientMessage.model_validate(payload)
            except ValidationError:
                await _send_event(websocket, {"type": "error", "detail": "Payload inválido."})
                continue

            try:
                async for event in use_case.execute(conversation_id, client_message.content):
                    await _send_event(websocket, _serialize_stream_event(event))
            except ConversationNotFoundError as error:
                await _send_event(websocket, {"type": "error", "detail": str(error)})
                await websocket.close(code=4404)
                return
            except Exception as error:
                await _send_event(
                    websocket,
                    {"type": "error", "detail": format_ai_error(error)},
                )
    except WebSocketDisconnect:
        return


def _serialize_stream_event(event) -> dict:
    if isinstance(event, StreamUserMessageEvent):
        return {
            "type": event.type,
            "message": to_message_schema(event.user_message).model_dump(mode="json"),
        }
    if isinstance(event, StreamDoneEvent):
        return {
            "type": event.type,
            "ai_message": to_message_schema(event.ai_message).model_dump(mode="json"),
        }
    if isinstance(event, AIStreamEvent):
        return {"type": event.kind, "content": event.content}
    raise TypeError(f"Evento de stream não suportado: {type(event)!r}")


async def _send_event(websocket: WebSocket, payload: dict) -> None:
    await websocket.send_text(json.dumps(payload, ensure_ascii=False))
