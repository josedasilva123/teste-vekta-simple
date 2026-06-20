class DomainError(Exception):
    """Erro base de domínio."""


class ConversationNotFoundError(DomainError):
    """Conversa não encontrada."""
