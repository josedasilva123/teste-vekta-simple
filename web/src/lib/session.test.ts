import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearStoredConversationId,
  getStoredConversationId,
  storeConversationId,
} from '@/lib/session'

describe('session', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('persiste e recupera o id da conversa', () => {
    storeConversationId('conv-123')
    expect(getStoredConversationId()).toBe('conv-123')
  })

  it('remove o id da conversa', () => {
    storeConversationId('conv-123')
    clearStoredConversationId()
    expect(getStoredConversationId()).toBeNull()
  })
})
