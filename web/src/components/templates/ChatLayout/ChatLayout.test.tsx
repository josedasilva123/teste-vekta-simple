import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChatLayout } from '@/components/templates/ChatLayout'

vi.mock('@/domains/chat/chat-context', () => ({
  useChat: vi.fn(() => ({
    toggleSidebar: vi.fn(),
    closeSidebar: vi.fn(),
    isSidebarOpen: false,
    conversations: [],
    isLoadingConversations: false,
    activeConversationId: null,
    startNewConversation: vi.fn(),
    switchToConversation: vi.fn(),
  })),
}))

describe('ChatLayout', () => {
  it('renderiza logo e conteúdo principal', () => {
    render(
      <ChatLayout>
        <p>Conteúdo do chat</p>
      </ChatLayout>,
    )

    expect(screen.getByText('Conteúdo do chat')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renderiza botão de menu hamburguer no mobile', () => {
    render(
      <ChatLayout>
        <p>conteúdo</p>
      </ChatLayout>,
    )

    expect(screen.getByRole('button', { name: 'Abrir histórico de conversas' })).toBeInTheDocument()
  })
})
