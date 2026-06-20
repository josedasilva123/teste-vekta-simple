import { useEffect, useRef, useState } from 'react'

type UseTypewriterOptions = {
  enabled?: boolean
  intervalMs?: number
  onComplete?: () => void
}

export function useTypewriter(
  text: string,
  { enabled = false, intervalMs = 18, onComplete }: UseTypewriterOptions = {},
) {
  const [displayed, setDisplayed] = useState(enabled ? '' : text)
  const indexRef = useRef(enabled ? 0 : text.length)
  const completedLengthRef = useRef(enabled ? 0 : text.length)
  const previousTextRef = useRef(text)

  useEffect(() => {
    if (!enabled) {
      indexRef.current = text.length
      completedLengthRef.current = text.length
      setDisplayed(text)
      previousTextRef.current = text
      return
    }

    const previousText = previousTextRef.current
    previousTextRef.current = text

    const isAppend = previousText === '' || text.startsWith(previousText)

    if (!isAppend) {
      // Substituição (ex.: evento replace) — exibe o texto corrigido sem apagar o conteúdo.
      indexRef.current = text.length
      setDisplayed(text)
    } else if (text.length < indexRef.current) {
      indexRef.current = text.length
      setDisplayed(text)
    }

    let active = true
    let handle: ReturnType<typeof setTimeout>

    const step = () => {
      if (!active) return

      if (indexRef.current >= text.length) {
        return
      }

      const backlog = text.length - indexRef.current
      const chars = backlog > 48 ? 6 : backlog > 24 ? 4 : backlog > 8 ? 2 : 1

      indexRef.current = Math.min(indexRef.current + chars, text.length)
      setDisplayed(text.slice(0, indexRef.current))

      if (indexRef.current < text.length) {
        handle = setTimeout(step, intervalMs)
      }
    }

    if (indexRef.current < text.length) {
      handle = setTimeout(step, intervalMs)
    }

    return () => {
      active = false
      clearTimeout(handle)
    }
  }, [text, enabled, intervalMs])

  useEffect(() => {
    if (!enabled || !onComplete) return
    if (displayed.length >= text.length && text.length > completedLengthRef.current) {
      completedLengthRef.current = text.length
      onComplete()
    }
  }, [displayed, text, enabled, onComplete])

  return {
    displayed,
    isTyping: enabled && displayed.length < text.length,
  }
}
