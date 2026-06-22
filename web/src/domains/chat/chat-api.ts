import { apiRequest } from '@/lib/http'
import type { Conversation, ConversationSummary } from '@/domains/chat/types'

export async function createConversation(): Promise<Conversation> {
  return apiRequest<Conversation>('/api/v1/conversations', {
    method: 'POST',
  })
}

export async function getConversation(id: string): Promise<Conversation> {
  return apiRequest<Conversation>(`/api/v1/conversations/${id}`, {
    method: 'GET',
  })
}

export async function listConversations(limit = 50): Promise<ConversationSummary[]> {
  return apiRequest<ConversationSummary[]>(`/api/v1/conversations?limit=${limit}`, {
    method: 'GET',
  })
}
