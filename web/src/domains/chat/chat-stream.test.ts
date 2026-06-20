import { describe, expect, it } from 'vitest'
import {
  STREAMING_MESSAGE_ID,
  appendStreamChunk,
  appendUserMessage,
  finalizeStreamedMessage,
  finishTypingAnimation,
  removeStreamingMessage,
  replaceStreamContent,
} from '@/domains/chat/chat-stream'
import type { ChatMessage } from '@/domains/chat/types'

const userMessage = {
  id: 'user-1',
  conversation_id: 'conv-1',
  sender: 'USER' as const,
  content: 'Olá',
  created_at: '2026-01-01T00:00:00Z',
}

describe('chat-stream', () => {
  it('acumula chunks em uma única mensagem de streaming', () => {
    const first = appendStreamChunk([], 'Olá')
    const second = appendStreamChunk(first, ' mundo')

    expect(first).toHaveLength(1)
    expect(first[0]).toMatchObject({ id: STREAMING_MESSAGE_ID, content: 'Olá', streaming: true })
    expect(second[0]).toMatchObject({ content: 'Olá mundo', streaming: true })
  })

  it('substitui o conteúdo em streaming', () => {
    const messages = appendStreamChunk([], 'texto provisório')
    const replaced = replaceStreamContent(messages, 'texto final')

    expect(replaced).toHaveLength(1)
    expect(replaced[0]).toMatchObject({ content: 'texto final', streaming: true })
  })

  it('finaliza preservando o texto mais longo e mantém animação até concluir', () => {
    const messages: ChatMessage[] = [
      {
        id: STREAMING_MESSAGE_ID,
        sender: 'AI',
        content: 'Resposta completa vinda do stream',
        streaming: true,
      },
    ]

    const finalized = finalizeStreamedMessage(messages, {
      ...userMessage,
      id: 'ai-1',
      sender: 'AI',
      content: 'Resposta curta',
    })

    expect(finalized).toEqual([
      {
        id: STREAMING_MESSAGE_ID,
        sender: 'AI',
        content: 'Resposta completa vinda do stream',
        streaming: true,
        streamEnded: true,
        finalId: 'ai-1',
      },
    ])
  })

  it('conclui animação aplicando o id final da mensagem', () => {
    const messages: ChatMessage[] = [
      {
        id: STREAMING_MESSAGE_ID,
        sender: 'AI',
        content: 'Resposta final',
        streaming: true,
        streamEnded: true,
        finalId: 'ai-1',
      },
    ]

    expect(finishTypingAnimation(messages)).toEqual([
      {
        id: 'ai-1',
        sender: 'AI',
        content: 'Resposta final',
      },
    ])
  })

  it('remove mensagem parcial de streaming', () => {
    const messages = appendStreamChunk([], 'parcial')
    expect(removeStreamingMessage(messages)).toEqual([])
  })

  it('deduplica mensagem do usuário', () => {
    const initial = appendUserMessage([], userMessage)
    const updated = appendUserMessage(initial, { ...userMessage, content: 'Olá novamente' })

    expect(updated).toHaveLength(1)
    expect(updated[0]?.content).toBe('Olá novamente')
  })
})
