import { render, screen, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TypewriterText } from '@/components/atoms/TypewriterText'
import { TYPEWRITER_CHAR_INTERVAL_MS } from '@/domains/chat/hooks/useTypewriter'

describe('TypewriterText', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('exibe texto completo quando inativo', () => {
    render(<TypewriterText text="Resposta completa" />)
    expect(screen.getByText('Resposta completa')).toBeInTheDocument()
  })

  it('anima texto gradualmente quando ativo', async () => {
    vi.useFakeTimers()
    render(<TypewriterText text="Olá" active showCursor />)

    expect(screen.getByText('▍')).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(TYPEWRITER_CHAR_INTERVAL_MS * 3)
    })

    expect(screen.getByText('Olá')).toBeInTheDocument()
  })
})
