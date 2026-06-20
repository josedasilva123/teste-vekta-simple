import { createContext, useContext } from 'react'
import type { ChatMessage } from '@/domains/chat/types'

export type ChatContextValue = {
  conversationId: string | null
  isLoadingConversation: boolean
  pageError: string | null
  messages: ChatMessage[]
  isLoadingMessages: boolean
  isConnected: boolean
  isSending: boolean
  chatError: string | null
  canRetry: boolean
  sendMessage: (content: string) => boolean
  retryLastMessage: () => boolean
  finalizeStreamingMessage: () => void
  resetConversation: () => void
}

export const ChatContext = createContext<ChatContextValue | null>(null)

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat deve ser usado dentro de ChatProvider')
  }
  return context
}
