import { useMemo, type ReactNode } from 'react'

import { ChatContext } from '@/domains/chat/chat-context'
import { useChatSession } from '@/domains/chat/hooks/useChatSession'
import { useChatWebSocket } from '@/domains/chat/hooks/useChatWebSocket'

export function ChatProvider({ children }: { children: ReactNode }) {
  const { conversationId, initialMessages, isLoading, pageError } = useChatSession()

  const {
    messages,
    isConnected,
    isSending,
    error: chatError,
    canRetry,
    sendMessage,
    retryLastMessage,
    finishTypingAnimation,
  } = useChatWebSocket({
    conversationId,
    initialMessages,
    enabled: !isLoading && Boolean(conversationId),
  })

  const value = useMemo(
    () => ({
      isLoading,
      pageError,
      messages,
      isConnected,
      isSending,
      chatError,
      canRetry,
      sendMessage,
      retryLastMessage,
      finishTypingAnimation,
    }),
    [
      isLoading,
      pageError,
      messages,
      isConnected,
      isSending,
      chatError,
      canRetry,
      sendMessage,
      retryLastMessage,
      finishTypingAnimation,
    ],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
