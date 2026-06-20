import { useCallback, useEffect, useState } from 'react'
import { createConversation, getConversation } from '@/domains/chat/chat-api'
import type { ChatMessage } from '@/domains/chat/types'
import { mapMessages } from '@/domains/chat/utils'
import {
  clearStoredConversationId,
  getStoredConversationId,
  storeConversationId,
} from '@/lib/session'

type UseChatSessionResult = {
  conversationId: string | null
  initialMessages: ChatMessage[]
  isLoading: boolean
  pageError: string | null
}

export function useChatSession(): UseChatSessionResult {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const bootstrap = useCallback(async (isCancelled: () => boolean) => {
    try {
      const storedId = getStoredConversationId()

      if (storedId) {
        try {
          const conversation = await getConversation(storedId)
          if (isCancelled()) return

          storeConversationId(conversation.id)
          setConversationId(conversation.id)
          setInitialMessages(mapMessages(conversation.messages))
          return
        } catch {
          clearStoredConversationId()
        }
      }

      const conversation = await createConversation()
      if (isCancelled()) return

      storeConversationId(conversation.id)
      setConversationId(conversation.id)
      setInitialMessages([])
    } catch {
      if (!isCancelled()) {
        setPageError('Não foi possível iniciar a conversa')
      }
    } finally {
      if (!isCancelled()) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    void bootstrap(() => cancelled)

    return () => {
      cancelled = true
    }
  }, [bootstrap])

  return {
    conversationId,
    initialMessages,
    isLoading,
    pageError,
  }
}
