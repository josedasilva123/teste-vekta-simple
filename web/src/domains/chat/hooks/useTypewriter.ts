import { useCallback, useEffect, useRef, useState } from 'react'

type UseTypewriterOptions = {
  enabled?: boolean
  intervalMs?: number
  onComplete?: () => void
}

export function useTypewriter(
  text: string,
  { enabled = false, intervalMs = 35, onComplete }: UseTypewriterOptions = {},
) {
  const [revealedLength, setRevealedLength] = useState(enabled ? 0 : text.length)
  const textRef = useRef(text)
  const revealedRef = useRef(revealedLength)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const completedLengthRef = useRef(enabled ? 0 : text.length)
  const previousTextRef = useRef(text)

  textRef.current = text
  revealedRef.current = revealedLength

  const syncReveal = useCallback((next: number) => {
    revealedRef.current = next
    setRevealedLength(next)
  }, [])

  const stopTyping = useCallback(() => {
    if (timerRef.current !== undefined) {
      clearTimeout(timerRef.current)
      timerRef.current = undefined
    }
  }, [])

  const scheduleTyping = useCallback(() => {
    if (!enabled || timerRef.current !== undefined) return

    const step = () => {
      const targetLength = textRef.current.length
      if (revealedRef.current >= targetLength) {
        timerRef.current = undefined
        return
      }

      syncReveal(revealedRef.current + 1)
      timerRef.current = setTimeout(step, intervalMs)
    }

    timerRef.current = setTimeout(step, intervalMs)
  }, [enabled, intervalMs, syncReveal])

  useEffect(() => {
    stopTyping()

    if (!enabled) {
      syncReveal(text.length)
      completedLengthRef.current = text.length
      previousTextRef.current = text
      return
    }

    const previousText = previousTextRef.current
    previousTextRef.current = text
    const isAppend = previousText === '' || text.startsWith(previousText)

    if (!isAppend) {
      syncReveal(text.length)
      return
    }

    if (revealedRef.current > text.length) {
      syncReveal(text.length)
    }

    if (revealedRef.current < text.length) {
      scheduleTyping()
    }

    return stopTyping
  }, [text, enabled, scheduleTyping, stopTyping, syncReveal])

  const displayed = enabled ? text.slice(0, revealedLength) : text
  const isTyping = enabled && revealedLength < text.length

  useEffect(() => {
    if (!enabled || !onComplete) return
    if (revealedLength >= text.length && text.length > completedLengthRef.current) {
      completedLengthRef.current = text.length
      onComplete()
    }
  }, [revealedLength, text, enabled, onComplete])

  return {
    displayed,
    isTyping,
  }
}
