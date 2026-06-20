from collections.abc import Awaitable, Callable

from chatterbox.domain.policies.prompt_injection_guard import get_injection_fallback_response
from chatterbox.domain.policies.response_guard import (
    ResponseViolation,
    assess_response,
    get_response_fallback,
)


async def finalize_ai_response(
    latest_user_message: str,
    response_text: str,
    retry_generate: Callable[[], Awaitable[str]],
) -> str:
    violation = assess_response(response_text)
    if violation == ResponseViolation.NONE:
        return response_text

    retry_text = await retry_generate()
    retry_violation = assess_response(retry_text)
    if retry_violation == ResponseViolation.NONE:
        return retry_text

    if violation == ResponseViolation.PROMPT_LEAK or retry_violation == ResponseViolation.PROMPT_LEAK:
        return get_injection_fallback_response(latest_user_message)

    return get_response_fallback()
