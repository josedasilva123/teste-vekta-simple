import type { ChatMessage, Conversation } from '@/domains/chat/types'

export function mapMessages(messages: Conversation['messages']): ChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    sender: message.sender,
    content: message.content,
  }))
}
