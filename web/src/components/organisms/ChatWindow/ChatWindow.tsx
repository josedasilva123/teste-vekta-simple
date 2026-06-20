import { useEffect, useRef } from 'react'
import { ChatMessage } from '@/components/molecules/ChatMessage'
import { ChatInput } from '@/components/molecules/ChatInput'
import { Button } from '@/components/atoms/Button'
import { Spinner } from '@/components/atoms/Spinner'
import type { ChatMessage as ChatMessageType } from '@/domains/chat/types'

type ChatWindowProps = {
  messages: ChatMessageType[]
  onSend: (content: string) => boolean
  isSending: boolean
  isConnected: boolean
  isLoading: boolean
  error?: string | null
  canRetry?: boolean
  onRetry?: () => void
  onStreamingTypingComplete?: () => void
}

export function ChatWindow({
  messages,
  onSend,
  isSending,
  isConnected,
  isLoading,
  error,
  canRetry = false,
  onRetry,
  onStreamingTypingComplete,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <h1 className="mb-2 text-xl font-semibold text-white sm:text-2xl">Como posso ajudar?</h1>
            <p className="max-w-md text-sm text-muted">
              Envie uma mensagem para iniciar a conversa com a IA.
            </p>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                sender={message.sender}
                content={message.content}
                streaming={message.streaming}
                finalizeOnComplete={message.finalizeOnComplete}
                onTypingComplete={
                  message.streaming && message.finalizeOnComplete
                    ? onStreamingTypingComplete
                    : undefined
                }
                onTypingProgress={message.streaming ? scrollToBottom : undefined}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border bg-surface px-3 py-3 safe-area-bottom sm:px-4 sm:py-4">
        {error ? (
          <div className="mb-2 flex flex-wrap items-center justify-center gap-2 text-sm text-red-400">
            <span>{error}</span>
            {canRetry && onRetry ? (
              <Button
                type="button"
                variant="ghost"
                onClick={onRetry}
                disabled={isSending || !isConnected}
                className="h-8 px-3 text-red-300 hover:text-white"
              >
                Tentar novamente
              </Button>
            ) : null}
          </div>
        ) : null}
        {!isConnected && !isLoading ? (
          <p className="mb-2 text-center text-sm text-amber-400">Reconectando ao chat...</p>
        ) : null}
        <ChatInput onSend={onSend} disabled={isSending || !isConnected || isLoading} />
      </div>
    </div>
  )
}
