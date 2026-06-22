from datetime import datetime

from chatterbox.domain.entities.conversation import Conversation
from chatterbox.domain.entities.conversation_summary import ConversationSummary
from chatterbox.domain.entities.message import Message
from chatterbox.domain.enums.sender_role import SenderRole
from chatterbox.infrastructure.persistence.mongo_database import MongoDatabase


class MongoConversationRepository:
    CONVERSATIONS = "conversations"
    MESSAGES = "messages"

    def __init__(self, database: MongoDatabase) -> None:
        self._database = database

    async def ensure_indexes(self) -> None:
        await self._database.database[self.CONVERSATIONS].create_index("created_at")

    async def create(self) -> Conversation:
        conversation = Conversation()
        await self._database.database[self.CONVERSATIONS].insert_one(
            {
                "_id": conversation.id,
                "created_at": conversation.created_at,
            }
        )
        return conversation

    async def get_by_id(self, conversation_id: str) -> Conversation | None:
        doc = await self._database.database[self.CONVERSATIONS].find_one({"_id": conversation_id})
        if doc is None:
            return None

        cursor = self._database.database[self.MESSAGES].find(
            {"conversation_id": conversation_id}
        ).sort("created_at", 1)

        messages = [self._to_message(message_doc) async for message_doc in cursor]

        return Conversation(
            id=doc["_id"],
            messages=messages,
            created_at=doc["created_at"],
        )

    async def list(self, limit: int = 50) -> list[ConversationSummary]:
        pipeline = [
            {"$sort": {"created_at": -1}},
            {"$limit": limit},
            {
                "$lookup": {
                    "from": self.MESSAGES,
                    "let": {"conv_id": "$_id"},
                    "pipeline": [
                        {"$match": {"$expr": {"$eq": ["$conversation_id", "$$conv_id"]}}},
                        {"$sort": {"created_at": -1}},
                        {"$limit": 1},
                    ],
                    "as": "last_message",
                }
            },
            {
                "$lookup": {
                    "from": self.MESSAGES,
                    "let": {"conv_id": "$_id"},
                    "pipeline": [
                        {"$match": {"$expr": {"$eq": ["$conversation_id", "$$conv_id"]}}},
                        {"$count": "total"},
                    ],
                    "as": "message_count_result",
                }
            },
            {
                "$project": {
                    "created_at": 1,
                    "last_message": {"$arrayElemAt": ["$last_message", 0]},
                    "message_count": {
                        "$ifNull": [
                            {"$arrayElemAt": ["$message_count_result.total", 0]},
                            0,
                        ]
                    },
                }
            },
        ]

        summaries: list[ConversationSummary] = []
        async for doc in self._database.database[self.CONVERSATIONS].aggregate(pipeline):
            last_msg = doc.get("last_message")
            preview: str | None = None
            if last_msg:
                raw_content: str = last_msg.get("content", "")
                preview = raw_content[:100] if raw_content else None

            summaries.append(
                ConversationSummary(
                    id=doc["_id"],
                    created_at=_ensure_utc(doc["created_at"]),
                    preview=preview,
                    message_count=doc["message_count"],
                )
            )

        return summaries

    async def add_message(self, message: Message) -> Message:
        await self._database.database[self.MESSAGES].insert_one(
            {
                "_id": message.id,
                "conversation_id": message.conversation_id,
                "sender": message.sender.value,
                "content": message.content,
                "created_at": message.created_at,
            }
        )
        return message

    @staticmethod
    def _to_message(doc: dict) -> Message:
        return Message(
            id=doc["_id"],
            conversation_id=doc["conversation_id"],
            sender=SenderRole(doc["sender"]),
            content=doc["content"],
            created_at=_ensure_utc(doc["created_at"]),
        )


def _ensure_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        from datetime import UTC

        return value.replace(tzinfo=UTC)
    return value
