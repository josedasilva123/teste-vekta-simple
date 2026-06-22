const CONVERSATION_STORAGE_KEY = 'chatterbox_conversation_id'

export function getStoredConversationId(): string | null {
  return localStorage.getItem(CONVERSATION_STORAGE_KEY)
}

export function storeConversationId(id: string): void {
  localStorage.setItem(CONVERSATION_STORAGE_KEY, id)
}

export function clearStoredConversationId(): void {
  localStorage.removeItem(CONVERSATION_STORAGE_KEY)
}
