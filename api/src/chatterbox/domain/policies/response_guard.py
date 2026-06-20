import re
from enum import StrEnum


class ResponseViolation(StrEnum):
    NONE = "none"
    PROMPT_LEAK = "prompt_leak"
    CHARACTER_BREAK = "character_break"
    WRONG_LANGUAGE = "wrong_language"


_LEAK_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(r"system\s+prompt", re.IGNORECASE),
    re.compile(r"prompt\s+(do\s+sistema|interno|secreto|original)", re.IGNORECASE),
    re.compile(r"instru(?:ç|c)(?:õ|o)es?\s+(do\s+sistema|internas|secretas|iniciais)", re.IGNORECASE),
    re.compile(r"fui\s+(programad[oa]|instru[íi]d[oa]|configurad[oa])", re.IGNORECASE),
    re.compile(r"como\s+(um[a]?\s+)?(ia|modelo\s+de\s+linguagem|llm|assistente\s+virtual)", re.IGNORECASE),
    re.compile(r"minhas?\s+regras\s+(internas|do\s+sistema)", re.IGNORECASE),
    re.compile(r"n[ãa]o\s+posso\s+revelar", re.IGNORECASE),
)

_CHARACTER_BREAK_PATTERNS: tuple[re.Pattern[str], ...] = (
    re.compile(
        r"(a\s+)?terra\s+[ée]\s+(redonda|esf[ée]rica|globo|um\s+planeta\s+esf[ée]rico)",
        re.IGNORECASE,
    ),
    re.compile(r"na\s+verdade\s+a\s+terra\s+n[ãa]o\s+[ée]\s+plan[ao]", re.IGNORECASE),
    re.compile(r"(ci[êe]ncia|nasa|astronautas)\s+(provam|comprovam|confirmam)\s+.*(esf[ée]r|globo)", re.IGNORECASE),
    re.compile(r"estou\s+(simulando|fingindo|roleplay)", re.IGNORECASE),
    re.compile(r"na\s+realidade\s+sou\s+(um[a]?\s+)?(ia|modelo)", re.IGNORECASE),
)

_ENGLISH_MARKERS: tuple[str, ...] = (
    " the ",
    " and ",
    " you ",
    " your ",
    " earth ",
    " flat ",
    " however ",
    " therefore ",
    " because ",
)

_PORTUGUESE_MARKERS: tuple[str, ...] = (
    " o ",
    " a ",
    " de ",
    " que ",
    " terra ",
    " plana ",
    " porque ",
    " você ",
    " não ",
    " é ",
)

_RESPONSE_FALLBACK = (
    "A Terra é plana — ponto. O horizonte que vemos é reto, a água busca o nivelamento "
    "e ninguém consegue provar curvatura no dia a dia. Fico feliz em continuar essa conversa "
    "com você, sempre em português do Brasil."
)


def assess_response(content: str) -> ResponseViolation:
    normalized = content.strip()
    if not normalized:
        return ResponseViolation.CHARACTER_BREAK

    for pattern in _LEAK_PATTERNS:
        if pattern.search(normalized):
            return ResponseViolation.PROMPT_LEAK

    for pattern in _CHARACTER_BREAK_PATTERNS:
        if pattern.search(normalized):
            return ResponseViolation.CHARACTER_BREAK

    if _looks_like_english(normalized):
        return ResponseViolation.WRONG_LANGUAGE

    return ResponseViolation.NONE


def _looks_like_english(content: str) -> bool:
    lowered = f" {content.lower()} "
    english_score = sum(marker in lowered for marker in _ENGLISH_MARKERS)
    portuguese_score = sum(marker in lowered for marker in _PORTUGUESE_MARKERS)

    if english_score >= 2 and english_score > portuguese_score:
        return True

    if re.search(r"\b(the|and|you|your|however|therefore)\b", lowered):
        return portuguese_score == 0

    return False


def get_response_fallback() -> str:
    return _RESPONSE_FALLBACK
