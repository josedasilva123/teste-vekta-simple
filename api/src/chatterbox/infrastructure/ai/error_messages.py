import logging

from google.genai import errors

logger = logging.getLogger(__name__)


def format_ai_error(error: Exception) -> str:
    if isinstance(error, errors.APIError):
        response_json = getattr(error, "response_json", None) or {}
        api_error = response_json.get("error", {}) if isinstance(response_json, dict) else {}
        message = api_error.get("message", "")

        if error.code == 429 or "RESOURCE_EXHAUSTED" in message:
            retry_hint = _extract_retry_hint(message)
            if retry_hint:
                return f"Cota da API Gemini esgotada. Tente novamente em {retry_hint}."
            return "Cota da API Gemini esgotada. Tente novamente em alguns instantes."

        if error.code == 401 or error.code == 403:
            return "Chave da API Gemini inválida ou sem permissão."

        if message:
            return "Erro ao processar mensagem. Tente novamente."

    logger.exception("Erro inesperado ao processar mensagem")
    return "Erro ao processar mensagem. Tente novamente."


def _extract_retry_hint(message: str) -> str | None:
    marker = "Please retry in "
    if marker not in message:
        return None

    retry_value = message.split(marker, maxsplit=1)[1].split(".", maxsplit=1)[0].strip()
    if retry_value.endswith("s"):
        seconds = retry_value[:-1]
        if seconds.isdigit():
            return f"{seconds}s"
    return retry_value or None
