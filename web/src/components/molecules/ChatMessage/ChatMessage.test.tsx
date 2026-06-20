import { render, screen, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ChatMessage } from '@/components/molecules/ChatMessage'

describe('ChatMessage', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renderiza mensagem do usuário', () => {
    render(<ChatMessage sender="USER" content="Olá!" />)
    expect(screen.getByText('Olá!')).toBeInTheDocument()
    expect(screen.getByText('V')).toBeInTheDocument()
  })

  it('anima resposta da IA caractere a caractere', async () => {
    vi.useFakeTimers()
    render(<ChatMessage sender="AI" content="Olá" streaming />)

    expect(screen.getByText('▍')).toBeInTheDocument()
    expect(screen.queryByText('Olá')).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(35)
    })

    expect(screen.getByText('O')).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(35 * 3)
    })

    expect(screen.getByText('Olá')).toBeInTheDocument()
  })

  it('exibe texto completo quando o streaming termina', () => {
    const { rerender } = render(
      <ChatMessage sender="AI" content="Resposta parcial" streaming />,
    )

    rerender(<ChatMessage sender="AI" content="Resposta completa finalizada" />)

    expect(screen.getByText('Resposta completa finalizada')).toBeInTheDocument()
    expect(screen.queryByText('▍')).not.toBeInTheDocument()
  })
})
