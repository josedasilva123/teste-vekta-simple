import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChatWindow } from '@/components/organisms/ChatWindow'
import type { ChatMessage } from '@/domains/chat/types'

const sampleMessages: ChatMessage[] = [
  {
    id: '1',
    sender: 'USER',
    content: 'Olá!',
  },
]

describe('ChatWindow', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('exibe spinner durante carregamento', () => {
    render(
      <ChatWindow
        messages={[]}
        onSend={vi.fn()}
        isSending={false}
        isConnected
        isLoading
      />,
    )

    expect(screen.getByRole('status', { name: 'Carregando' })).toBeInTheDocument()
  })

  it('exibe estado vazio quando não há mensagens', () => {
    render(
      <ChatWindow
        messages={[]}
        onSend={vi.fn()}
        isSending={false}
        isConnected
        isLoading={false}
      />,
    )

    expect(screen.getByText('Como posso ajudar?')).toBeInTheDocument()
  })

  it('renderiza mensagens e permite envio', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn().mockReturnValue(true)

    render(
      <ChatWindow
        messages={sampleMessages}
        onSend={onSend}
        isSending={false}
        isConnected
        isLoading={false}
      />,
    )

    expect(screen.getByText('Olá!')).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('Envie uma mensagem...'), 'Nova mensagem')
    await user.click(screen.getByRole('button', { name: 'Enviar mensagem' }))

    expect(onSend).toHaveBeenCalledWith('Nova mensagem')
  })

  it('exibe erro e aviso de reconexão', () => {
    render(
      <ChatWindow
        messages={[]}
        onSend={vi.fn()}
        isSending={false}
        isConnected={false}
        isLoading={false}
        error="Falha ao enviar"
      />,
    )

    expect(screen.getByText('Falha ao enviar')).toBeInTheDocument()
    expect(screen.getByText('Reconectando ao chat...')).toBeInTheDocument()
  })
})
