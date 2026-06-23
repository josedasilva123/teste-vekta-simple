import pytest

from chatterbox.application.use_cases.get_conversation import GetConversationUseCase
from chatterbox.application.use_cases.list_conversations import ListConversationsUseCase
from chatterbox.application.use_cases.send_message import SendMessageUseCase
from chatterbox.application.use_cases.send_message_stream import (
    SendMessageStreamUseCase,
    StreamDoneEvent,
    StreamUserMessageEvent,
)
from chatterbox.application.use_cases.start_conversation import StartConversationUseCase
from chatterbox.domain.entities.message import Message
from chatterbox.domain.enums.sender_role import SenderRole
from chatterbox.domain.exceptions import ConversationNotFoundError
from chatterbox.infrastructure.ai.fake_ai_service import FakeAIService
from tests.fakes import FakeConversationRepository


@pytest.fixture
def fake_repository() -> FakeConversationRepository:
    return FakeConversationRepository()


@pytest.mark.asyncio
async def test_start_conversation_creates_empty_conversation(
    fake_repository: FakeConversationRepository,
) -> None:
    use_case = StartConversationUseCase(fake_repository)

    conversation = await use_case.execute()

    assert conversation.id
    assert conversation.messages == []


@pytest.mark.asyncio
async def test_send_message_persists_user_and_ai_messages(
    fake_repository: FakeConversationRepository,
) -> None:
    conversation = await StartConversationUseCase(fake_repository).execute()
    use_case = SendMessageUseCase(fake_repository, FakeAIService())

    result = await use_case.execute(conversation.id, "A Terra é redonda?")

    assert result.user_message.sender == SenderRole.USER
    assert result.user_message.content == "A Terra é redonda?"
    assert result.ai_message.sender == SenderRole.AI
    assert result.ai_message.content


@pytest.mark.asyncio
async def test_send_message_reuses_identical_user_message_when_last_is_user(
    fake_repository: FakeConversationRepository,
) -> None:
    conversation = await StartConversationUseCase(fake_repository).execute()
    existing_user_message = Message(
        conversation_id=conversation.id,
        sender=SenderRole.USER,
        content="Olá",
    )
    await fake_repository.add_message(existing_user_message)
    use_case = SendMessageUseCase(fake_repository, FakeAIService())

    result = await use_case.execute(conversation.id, "Olá")

    stored = await GetConversationUseCase(fake_repository).execute(conversation.id)
    user_messages = [message for message in stored.messages if message.sender == SenderRole.USER]

    assert len(user_messages) == 1
    assert result.user_message.id == existing_user_message.id
    assert len(stored.messages) == 2


@pytest.mark.asyncio
async def test_send_message_stream_skips_duplicate_user_event_on_retry(
    fake_repository: FakeConversationRepository,
) -> None:
    conversation = await StartConversationUseCase(fake_repository).execute()
    await fake_repository.add_message(
        Message(
            conversation_id=conversation.id,
            sender=SenderRole.USER,
            content="Olá",
        )
    )
    use_case = SendMessageStreamUseCase(fake_repository, FakeAIService())

    events = [event async for event in use_case.execute(conversation.id, "Olá")]

    assert not any(isinstance(event, StreamUserMessageEvent) for event in events)
    assert any(isinstance(event, StreamDoneEvent) for event in events)


@pytest.mark.asyncio
async def test_get_conversation_returns_messages(
    fake_repository: FakeConversationRepository,
) -> None:
    conversation = await StartConversationUseCase(fake_repository).execute()
    await SendMessageUseCase(fake_repository, FakeAIService()).execute(conversation.id, "Olá")

    result = await GetConversationUseCase(fake_repository).execute(conversation.id)

    assert len(result.messages) == 2


@pytest.mark.asyncio
async def test_get_conversation_raises_when_not_found(
    fake_repository: FakeConversationRepository,
) -> None:
    use_case = GetConversationUseCase(fake_repository)

    with pytest.raises(ConversationNotFoundError):
        await use_case.execute("inexistente")


@pytest.mark.asyncio
async def test_list_conversations_returns_summaries_ordered_by_date(
    fake_repository: FakeConversationRepository,
) -> None:
    conv1 = await StartConversationUseCase(fake_repository).execute()
    conv2 = await StartConversationUseCase(fake_repository).execute()
    await SendMessageUseCase(fake_repository, FakeAIService()).execute(conv1.id, "Olá")

    summaries = await ListConversationsUseCase(fake_repository).execute()

    assert len(summaries) == 2
    assert summaries[0].id == conv2.id
    assert summaries[1].id == conv1.id
    assert summaries[1].message_count == 2
    assert summaries[1].preview is not None


@pytest.mark.asyncio
async def test_list_conversations_empty_when_no_conversations(
    fake_repository: FakeConversationRepository,
) -> None:
    summaries = await ListConversationsUseCase(fake_repository).execute()

    assert summaries == []
