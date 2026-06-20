import { useEffect, useState } from 'react'
import { getConversation } from '@/domains/chat/chat-api'
import { mapMessages } from '@/domains/chat/utils'

type UseConversationMessagesOptions = {
  activeConversationId: string | null
  setMessages: (messages: ReturnType<typeof mapMessages>) => void
  clearMessages: () => void
  onLoadError: () => void
  shouldSkipInitialLoad?: (conversationId: string) => boolean
}

export function useConversationMessages({
  activeConversationId,
  setMessages,
  clearMessages,
  onLoadError,
  shouldSkipInitialLoad,
}: UseConversationMessagesOptions): boolean {
  const [loadedConversationId, setLoadedConversationId] = useState<string | null>(null)
  const isLoadingMessages =
    Boolean(activeConversationId) && loadedConversationId !== activeConversationId

  useEffect(() => {
    if (!activeConversationId) {
      clearMessages()
      setLoadedConversationId(null)
      return
    }

    if (shouldSkipInitialLoad?.(activeConversationId)) {
      setLoadedConversationId(activeConversationId)
      return
    }

    let cancelled = false

    getConversation(activeConversationId)
      .then((conversation) => {
        if (cancelled) return
        setMessages(mapMessages(conversation.messages))
        setLoadedConversationId(activeConversationId)
      })
      .catch(() => {
        if (cancelled) return
        onLoadError()
        setLoadedConversationId(activeConversationId)
      })

    return () => {
      cancelled = true
    }
  }, [activeConversationId, setMessages, clearMessages, onLoadError, shouldSkipInitialLoad])

  return isLoadingMessages
}
