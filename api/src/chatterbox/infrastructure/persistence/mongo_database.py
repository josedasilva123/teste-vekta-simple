import asyncio

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ServerSelectionTimeoutError

from chatterbox.infrastructure.config.settings import Settings


class MongoDatabase:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client: AsyncIOMotorClient | None = None

    @property
    def client(self) -> AsyncIOMotorClient:
        if self._client is None:
            self._client = AsyncIOMotorClient(
                self._settings.mongodb_uri,
                serverSelectionTimeoutMS=2_000,
            )
        return self._client

    @property
    def database(self) -> AsyncIOMotorDatabase:
        return self.client[self._settings.mongodb_database]

    async def connect(self, *, max_attempts: int = 5, retry_delay: float = 1.0) -> None:
        last_error: ServerSelectionTimeoutError | None = None
        for attempt in range(max_attempts):
            try:
                await self.client.admin.command("ping")
                return
            except ServerSelectionTimeoutError as exc:
                last_error = exc
                if attempt < max_attempts - 1:
                    await asyncio.sleep(retry_delay)

        assert last_error is not None
        raise last_error

    async def disconnect(self) -> None:
        if self._client is not None:
            self._client.close()
            self._client = None
