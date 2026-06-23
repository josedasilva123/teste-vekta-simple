import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChatPage } from '@/pages/ChatPage'

vi.mock('@/domains/chat/chat-context', () => ({
  useChat: vi.fn(),
}))

import { useChat } from '@/domains/chat/chat-context'

const mockUseChat = vi.mocked(useChat)

const baseContext = {
  isLoading: false,
  isCreatingConversation: false,
  pageError: null,
  messages: [],
  isConnected: true,
  isSending: false,
  chatError: null,
  canRetry: false,
  activeConversationId: 'conv-1',
  conversations: [],
  isLoadingConversations: false,
  isSidebarOpen: false,
  sendMessage: vi.fn(),
  retryLastMessage: vi.fn(),
  finishTypingAnimation: vi.fn(),
  toggleSidebar: vi.fn(),
  closeSidebar: vi.fn(),
  startNewConversation: vi.fn(),
  switchToConversation: vi.fn(),
}

describe('ChatPage', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('exibe erro da página quando presente', () => {
    mockUseChat.mockReturnValue({
      ...baseContext,
      pageError: 'Erro ao carregar conversa',
    })

    render(<ChatPage />)
    expect(screen.getByText('Erro ao carregar conversa')).toBeInTheDocument()
  })

  it('renderiza janela de chat com mensagens', () => {
    mockUseChat.mockReturnValue({
      ...baseContext,
      messages: [{ id: '1', sender: 'USER', content: 'Mensagem de teste' }],
    })

    render(<ChatPage />)
    expect(screen.getByText('Mensagem de teste')).toBeInTheDocument()
  })

  it('não exibe aviso de reconexão sem mensagens prévias', () => {
    mockUseChat.mockReturnValue({
      ...baseContext,
      isConnected: false,
      messages: [],
    })

    render(<ChatPage />)
    expect(screen.queryByText('Reconectando ao chat...')).not.toBeInTheDocument()
  })

  it('exibe aviso de reconexão quando havia mensagens e conexão caiu', () => {
    mockUseChat.mockReturnValue({
      ...baseContext,
      isConnected: false,
      messages: [{ id: '1', sender: 'USER', content: 'Olá' }],
    })

    render(<ChatPage />)
    expect(screen.getByText('Reconectando ao chat...')).toBeInTheDocument()
  })
})
