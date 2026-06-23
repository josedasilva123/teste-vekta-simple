import { useCallback, useEffect, useState } from 'react'

import { listConversations } from '@/domains/chat/chat-api'
import type { ConversationSummary } from '@/domains/chat/types'

type UseConversationListResult = {
  conversations: ConversationSummary[]
  isLoadingConversations: boolean
  refreshConversations: () => Promise<void>
}

export function useConversationList(): UseConversationListResult {
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)

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

  useEffect(() => {
    void refreshConversations()
  }, [refreshConversations])

  return { conversations, isLoadingConversations, refreshConversations }
}
