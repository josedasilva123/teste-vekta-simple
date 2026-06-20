import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChatPage } from '@/pages/ChatPage'

vi.mock('@/domains/chat/chat-context', () => ({
  useChat: vi.fn(),
}))

import { useChat } from '@/domains/chat/chat-context'

const mockUseChat = vi.mocked(useChat)

describe('ChatPage', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('exibe erro da página quando presente', () => {
    mockUseChat.mockReturnValue({
      isLoading: false,
      pageError: 'Erro ao carregar conversa',
      messages: [],
      isConnected: true,
      isSending: false,
      chatError: null,
      canRetry: false,
      sendMessage: vi.fn(),
      retryLastMessage: vi.fn(),
      finishTypingAnimation: vi.fn(),
    })

    render(<ChatPage />)
    expect(screen.getByText('Erro ao carregar conversa')).toBeInTheDocument()
  })

  it('renderiza janela de chat com mensagens', () => {
    mockUseChat.mockReturnValue({
      isLoading: false,
      pageError: null,
      messages: [
        {
          id: '1',
          sender: 'USER',
          content: 'Mensagem de teste',
        },
      ],
      isConnected: true,
      isSending: false,
      chatError: null,
      canRetry: false,
      sendMessage: vi.fn(),
      retryLastMessage: vi.fn(),
      finishTypingAnimation: vi.fn(),
    })

    render(<ChatPage />)
    expect(screen.getByText('Mensagem de teste')).toBeInTheDocument()
  })
})
