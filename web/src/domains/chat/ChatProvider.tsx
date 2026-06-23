import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import {
  createConversation,
  getConversation,
} from '@/domains/chat/chat-api'
import { ChatContext } from '@/domains/chat/chat-context'
import { useChatWebSocket } from '@/domains/chat/hooks/useChatWebSocket'
import { useConversationList } from '@/domains/chat/hooks/useConversationList'
import { useSidebar } from '@/domains/chat/hooks/useSidebar'
import type { ChatMessage, Conversation } from '@/domains/chat/types'
import { mapMessages } from '@/domains/chat/utils'
import {
  clearStoredConversationId,
  getStoredConversationId,
  storeConversationId,
} from '@/lib/session'

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const [pageError, setPageError] = useState<string | null>(null)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)

  const { conversations, isLoadingConversations, refreshConversations } = useConversationList()
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar()

  const isSwitchingRef = useRef(false)

  const applyConversation = useCallback((conversation: Conversation) => {
    storeConversationId(conversation.id)
    setActiveConversationId(conversation.id)
    setInitialMessages(mapMessages(conversation.messages))
  }, [])

  // Bootstrap: load stored conversation only — do NOT create a new one
  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      const storedId = getStoredConversationId()

      if (storedId) {
        try {
          const conversation = await getConversation(storedId)
          if (!cancelled) applyConversation(conversation)
        } catch {
          if (!cancelled) clearStoredConversationId()
        }
      }

      if (!cancelled) setIsLoading(false)
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [applyConversation])

  const {
    messages,
    isConnected,
    isSending,
    error: chatError,
    canRetry,
    sendMessage: wsSendMessage,
    retryLastMessage,
    finishTypingAnimation,
  } = useChatWebSocket({
    conversationId: activeConversationId,
    initialMessages,
    enabled: !isLoading && Boolean(activeConversationId),
  })

  // When WS connects and there's a queued first message, send it
  useEffect(() => {
    if (isConnected && pendingMessage) {
      wsSendMessage(pendingMessage)
      setPendingMessage(null)
    }
  }, [isConnected, pendingMessage, wsSendMessage])

  // If no active conversation, create one and queue the first message for when WS connects
  const sendMessage = useCallback(
    (content: string): boolean => {
      const trimmed = content.trim()
      if (!trimmed) return false

      if (activeConversationId) {
        return wsSendMessage(content)
      }

      setIsCreatingConversation(true)
      void createConversation()
        .then((conv) => {
          storeConversationId(conv.id)
          setActiveConversationId(conv.id)
          setInitialMessages([])
          setPendingMessage(trimmed)
          void refreshConversations()
        })
        .catch(() => {
          setPageError('Não foi possível criar a conversa')
        })
        .finally(() => {
          setIsCreatingConversation(false)
        })
      return true
    },
    [activeConversationId, wsSendMessage, refreshConversations],
  )

  // Start a new conversation: just clear state, conversation is created on first message
  const startNewConversation = useCallback(() => {
    if (isSwitchingRef.current) return
    clearStoredConversationId()
    setActiveConversationId(null)
    setInitialMessages([])
    setPendingMessage(null)
    closeSidebar()
  }, [closeSidebar])

  const switchToConversation = useCallback(
    async (id: string) => {
      closeSidebar()
      if (isSwitchingRef.current || id === activeConversationId) {
        return
      }
      isSwitchingRef.current = true
      setIsLoading(true)
      try {
        const conversation = await getConversation(id)
        applyConversation(conversation)
      } catch {
        setPageError('Não foi possível carregar a conversa')
      } finally {
        setIsLoading(false)
        isSwitchingRef.current = false
      }
    },
    [activeConversationId, applyConversation, closeSidebar],
  )

  const value = useMemo(
    () => ({
      isLoading,
      isCreatingConversation,
      pageError,
      messages,
      isConnected,
      isSending,
      chatError,
      canRetry,
      sendMessage,
      retryLastMessage,
      finishTypingAnimation,
      activeConversationId,
      conversations,
      isLoadingConversations,
      isSidebarOpen,
      toggleSidebar,
      closeSidebar,
      startNewConversation,
      switchToConversation,
    }),
    [
      isLoading,
      isCreatingConversation,
      pageError,
      messages,
      activeConversationId,
      isConnected,
      isSending,
      chatError,
      canRetry,
      sendMessage,
      retryLastMessage,
      finishTypingAnimation,
      conversations,
      isLoadingConversations,
      isSidebarOpen,
      toggleSidebar,
      closeSidebar,
      startNewConversation,
      switchToConversation,
    ],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
