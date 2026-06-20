import { useEffect } from 'react'
import { useTypewriter } from '@/domains/chat/hooks/useTypewriter'

type TypewriterTextProps = {
  text: string
  active?: boolean
  showCursor?: boolean
  onProgress?: () => void
  onComplete?: () => void
}

export function TypewriterText({
  text,
  active = false,
  showCursor = false,
  onProgress,
  onComplete,
}: TypewriterTextProps) {
  const { displayed, isTyping } = useTypewriter(text, {
    enabled: active,
    onComplete,
  })

  useEffect(() => {
    onProgress?.()
  }, [displayed, onProgress])

  return (
    <>
      {displayed}
      {showCursor && (active || isTyping) ? (
        <span className="ml-0.5 inline-block animate-pulse text-muted">▍</span>
      ) : null}
    </>
  )
}
