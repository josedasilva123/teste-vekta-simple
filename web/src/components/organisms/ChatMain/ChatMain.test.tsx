import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChatMain } from '@/components/organisms/ChatMain'

vi.mock('@/domains/chat/chat-context', () => ({
  useChat: vi.fn(),
}))

import { useChat } from '@/domains/chat/chat-context'

const mockUseChat = vi.mocked(useChat)

describe('ChatMain', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('exibe erro da página quando presente', () => {
    mockUseChat.mockReturnValue({
      conversationId: null,
      isLoadingConversation: false,
      pageError: 'Erro ao carregar conversa',
      messages: [],
      isLoadingMessages: false,
      isConnected: true,
      isSending: false,
      chatError: null,
      canRetry: false,
      sendMessage: vi.fn(),
      retryLastMessage: vi.fn(),
      finalizeStreamingMessage: vi.fn(),
      resetConversation: vi.fn(),
    })

    render(<ChatMain />)
    expect(screen.getByText('Erro ao carregar conversa')).toBeInTheDocument()
  })

  it('renderiza janela de chat com mensagens', () => {
    mockUseChat.mockReturnValue({
      conversationId: 'conv-1',
      isLoadingConversation: false,
      pageError: null,
      messages: [
        {
          id: '1',
          sender: 'USER',
          content: 'Mensagem de teste',
        },
      ],
      isLoadingMessages: false,
      isConnected: true,
      isSending: false,
      chatError: null,
      canRetry: false,
      sendMessage: vi.fn(),
      retryLastMessage: vi.fn(),
      finalizeStreamingMessage: vi.fn(),
      resetConversation: vi.fn(),
    })

    render(<ChatMain />)
    expect(screen.getByText('Mensagem de teste')).toBeInTheDocument()
  })
})
