import { useCallback, useMemo, type ReactNode } from 'react'

import { ChatContext } from '@/domains/chat/chat-context'
import { useChatWebSocket } from '@/domains/chat/hooks/useChatWebSocket'
import { useConversationMessages } from '@/domains/chat/hooks/useConversationMessages'
import { useSingleConversation } from '@/domains/chat/hooks/useSingleConversation'

export function ChatProvider({ children }: { children: ReactNode }) {
  const { conversationId, isLoading: isLoadingConversation, pageError, resetConversation } =
    useSingleConversation()

  const handleLoadError = useCallback(() => {
    resetConversation()
  }, [resetConversation])

  const {
    messages,
    isConnected,
    isSending,
    error: chatError,
    canRetry,
    sendMessage,
    retryLastMessage,
    setMessages,
    clearMessages,
    finishTypingAnimation,
  } = useChatWebSocket({
    conversationId,
    enabled: !isLoadingConversation && Boolean(conversationId),
  })

  const isLoadingMessages = useConversationMessages({
    activeConversationId: conversationId,
    setMessages,
    clearMessages,
    onLoadError: handleLoadError,
  })

  const value = useMemo(
    () => ({
      conversationId,
      isLoadingConversation,
      pageError,
      messages,
      isLoadingMessages,
      isConnected: conversationId ? Boolean(isConnected) : !isLoadingConversation,
      isSending,
      chatError,
      canRetry,
      sendMessage,
      retryLastMessage,
      finishTypingAnimation,
      resetConversation,
    }),
    [
      conversationId,
      isLoadingConversation,
      pageError,
      messages,
      isLoadingMessages,
      isConnected,
      isSending,
      chatError,
      canRetry,
      sendMessage,
      retryLastMessage,
      finishTypingAnimation,
      resetConversation,
    ],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
