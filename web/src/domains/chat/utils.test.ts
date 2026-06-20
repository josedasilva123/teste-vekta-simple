import { describe, expect, it } from 'vitest'
import { mapMessages } from '@/domains/chat/utils'

describe('mapMessages', () => {
  it('mapeia mensagens da API para o formato do chat', () => {
    const messages = mapMessages([
      {
        id: 'msg-1',
        conversation_id: 'conv-1',
        sender: 'USER',
        content: 'Olá',
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ])

    expect(messages).toEqual([
      {
        id: 'msg-1',
        sender: 'USER',
        content: 'Olá',
      },
    ])
  })
})
