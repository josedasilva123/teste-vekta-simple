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

  it('anima resposta da IA com cursor de digitação', async () => {
    vi.useFakeTimers()
    render(<ChatMessage sender="AI" content="Resposta parcial" streaming />)

    expect(screen.getByText('▍')).toBeInTheDocument()

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Resposta parcial')).toBeInTheDocument()
  })
})
