import { renderHook, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useTypewriter } from '@/domains/chat/hooks/useTypewriter'

describe('useTypewriter', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('revela o texto gradualmente quando ativo', async () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()

    const { result, rerender } = renderHook(
      ({ text }) => useTypewriter(text, { enabled: true, intervalMs: 10, onComplete }),
      { initialProps: { text: 'Olá' } },
    )

    expect(result.current.displayed).toBe('')

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(result.current.displayed).toBe('Olá')
    expect(onComplete).toHaveBeenCalledOnce()

    rerender({ text: 'Olá mundo' })

    await act(async () => {
      await vi.runAllTimersAsync()
    })

    expect(result.current.displayed).toBe('Olá mundo')
  })

  it('exibe o texto completo imediatamente quando inativo', () => {
    const { result } = renderHook(() =>
      useTypewriter('Resposta completa', { enabled: false }),
    )

    expect(result.current.displayed).toBe('Resposta completa')
    expect(result.current.isTyping).toBe(false)
  })

  it('não apaga o texto ao receber substituição mais curta', async () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(
      ({ text }) => useTypewriter(text, { enabled: true, intervalMs: 10 }),
      { initialProps: { text: 'A Terra é plana — resposta longa em streaming' } },
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200)
    })

    expect(result.current.displayed.length).toBeGreaterThan(0)

    rerender({ text: 'Resposta corrigida e mais curta.' })

    expect(result.current.displayed).toBe('Resposta corrigida e mais curta.')
    expect(result.current.displayed).not.toBe('')
  })

  it('exibe imediatamente texto substituído que não é extensão do anterior', async () => {
    vi.useFakeTimers()

    const { result, rerender } = renderHook(
      ({ text }) => useTypewriter(text, { enabled: true, intervalMs: 10 }),
      { initialProps: { text: 'Texto original sendo digitado aos poucos' } },
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100)
    })

    rerender({ text: 'Texto totalmente diferente após guard.' })

    expect(result.current.displayed).toBe('Texto totalmente diferente após guard.')
  })
})
