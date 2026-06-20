import type { SenderRole } from '@/domains/chat/types'
import { TypewriterText } from '@/components/atoms/TypewriterText'

type ChatMessageProps = {
  sender: SenderRole
  content: string
  streaming?: boolean
  finalizeOnComplete?: boolean
  onTypingComplete?: () => void
  onTypingProgress?: () => void
}

export function ChatMessage({
  sender,
  content,
  streaming = false,
  finalizeOnComplete = false,
  onTypingComplete,
  onTypingProgress,
}: ChatMessageProps) {
  const isUser = sender === 'USER'
  const animateAi = !isUser && streaming

  return (
    <div
      className={`flex gap-3 px-3 py-4 sm:gap-4 sm:px-4 sm:py-6 ${isUser ? 'bg-transparent' : 'bg-[#2a2a2a]/40'}`}
    >
      <div
        className={`flex size-7 shrink-0 items-center justify-center rounded-sm text-xs font-semibold sm:size-8 ${
          isUser ? 'bg-accent text-white' : 'bg-[#5436da] text-white'
        }`}
      >
        {isUser ? 'V' : 'AI'}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="whitespace-pre-wrap text-sm leading-6 text-[#ececec] sm:text-[15px] sm:leading-7">
          {animateAi ? (
            <TypewriterText
              text={content}
              active
              showCursor
              onComplete={finalizeOnComplete ? onTypingComplete : undefined}
              onProgress={onTypingProgress}
            />
          ) : (
            content
          )}
        </p>
      </div>
    </div>
  )
}
