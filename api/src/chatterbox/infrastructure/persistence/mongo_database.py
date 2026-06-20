from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from chatterbox.infrastructure.config.settings import Settings


class MongoDatabase:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client: AsyncIOMotorClient | None = None

    @property
    def client(self) -> AsyncIOMotorClient:
        if self._client is None:
            self._client = AsyncIOMotorClient(self._settings.mongodb_uri)
        return self._client

    @property
    def database(self) -> AsyncIOMotorDatabase:
        return self.client[self._settings.mongodb_database]

    async def connect(self) -> None:
        await self.client.admin.command("ping")

    async def disconnect(self) -> None:
        if self._client is not None:
            self._client.close()
            self._client = None
