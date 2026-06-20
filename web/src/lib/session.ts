const CONVERSATION_STORAGE_KEY = 'chatterbox_conversation_id'

export function getStoredConversationId(): string | null {
  return sessionStorage.getItem(CONVERSATION_STORAGE_KEY)
}

export function storeConversationId(id: string): void {
  sessionStorage.setItem(CONVERSATION_STORAGE_KEY, id)
}

export function clearStoredConversationId(): void {
  sessionStorage.removeItem(CONVERSATION_STORAGE_KEY)
}
