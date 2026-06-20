import { useEffect, useState } from 'react'
import { createConversation, getConversation } from '@/domains/chat/chat-api'
import {
  clearStoredConversationId,
  getStoredConversationId,
  storeConversationId,
} from '@/lib/session'

type UseSingleConversationResult = {
  conversationId: string | null
  isLoading: boolean
  pageError: string | null
  resetConversation: () => void
}

export function useSingleConversation(): UseSingleConversationResult {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const storedId = getStoredConversationId()

        if (storedId) {
          try {
            await getConversation(storedId)
            if (!cancelled) {
              setConversationId(storedId)
            }
            return
          } catch {
            clearStoredConversationId()
          }
        }

        const conversation = await createConversation()
        if (cancelled) return

        storeConversationId(conversation.id)
        setConversationId(conversation.id)
      } catch {
        if (!cancelled) {
          setPageError('Não foi possível iniciar a conversa')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const resetConversation = () => {
    clearStoredConversationId()
    setPageError(null)
    setIsLoading(true)
    setConversationId(null)

    void createConversation()
      .then((conversation) => {
        storeConversationId(conversation.id)
        setConversationId(conversation.id)
      })
      .catch(() => {
        setPageError('Não foi possível iniciar a conversa')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return {
    conversationId,
    isLoading,
    pageError,
    resetConversation,
  }
}
