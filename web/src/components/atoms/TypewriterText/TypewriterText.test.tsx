import { render, screen, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TypewriterText } from '@/components/atoms/TypewriterText'

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
      await vi.runAllTimersAsync()
    })

    expect(screen.getByText('Olá')).toBeInTheDocument()
  })
})
