import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import {
  createConversation,
  getConversation,
  listConversations,
} from '@/domains/chat/chat-api'
import { ChatContext } from '@/domains/chat/chat-context'
import { useChatWebSocket } from '@/domains/chat/hooks/useChatWebSocket'
import type { ChatMessage, ConversationSummary } from '@/domains/chat/types'
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
  const [pageError, setPageError] = useState<string | null>(null)

  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const isSwitchingRef = useRef(false)

  const refreshConversations = useCallback(async () => {
    setIsLoadingConversations(true)
    try {
      const list = await listConversations()
      setConversations(list)
    } catch {
      // silently ignore list errors
    } finally {
      setIsLoadingConversations(false)
    }
  }, [])

  // Bootstrap: load stored conversation or create new one
  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      try {
        const storedId = getStoredConversationId()

        if (storedId) {
          try {
            const conversation = await getConversation(storedId)
            if (cancelled) return
            storeConversationId(conversation.id)
            setActiveConversationId(conversation.id)
            setInitialMessages(mapMessages(conversation.messages))
            return
          } catch {
            clearStoredConversationId()
          }
        }

        const conversation = await createConversation()
        if (cancelled) return
        storeConversationId(conversation.id)
        setActiveConversationId(conversation.id)
        setInitialMessages([])
      } catch {
        if (!cancelled) {
          setPageError('Não foi possível iniciar a conversa')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void bootstrap()
    void refreshConversations()

    return () => {
      cancelled = true
    }
  }, [refreshConversations])

  const startNewConversation = useCallback(async () => {
    if (isSwitchingRef.current) return
    isSwitchingRef.current = true
    setIsLoading(true)
    setIsSidebarOpen(false)
    try {
      const conversation = await createConversation()
      storeConversationId(conversation.id)
      setActiveConversationId(conversation.id)
      setInitialMessages([])
      void refreshConversations()
    } catch {
      setPageError('Não foi possível criar uma nova conversa')
    } finally {
      setIsLoading(false)
      isSwitchingRef.current = false
    }
  }, [refreshConversations])

  const switchToConversation = useCallback(async (id: string) => {
    if (isSwitchingRef.current || id === activeConversationId) {
      setIsSidebarOpen(false)
      return
    }
    isSwitchingRef.current = true
    setIsLoading(true)
    setIsSidebarOpen(false)
    try {
      const conversation = await getConversation(id)
      storeConversationId(conversation.id)
      setActiveConversationId(conversation.id)
      setInitialMessages(mapMessages(conversation.messages))
    } catch {
      setPageError('Não foi possível carregar a conversa')
    } finally {
      setIsLoading(false)
      isSwitchingRef.current = false
    }
  }, [activeConversationId])

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false)
  }, [])

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
    conversationId: activeConversationId,
    initialMessages,
    enabled: !isLoading && Boolean(activeConversationId),
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
    ],
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
