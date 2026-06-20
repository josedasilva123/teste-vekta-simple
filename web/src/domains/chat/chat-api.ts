import { apiRequest } from '@/lib/http'
import type { Conversation } from '@/domains/chat/types'

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
