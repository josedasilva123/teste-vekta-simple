import { createContext, useContext } from 'react'
import type { ChatMessage, ConversationSummary } from '@/domains/chat/types'

export type ChatContextValue = {
  isLoading: boolean
  pageError: string | null
  messages: ChatMessage[]
  isConnected: boolean
  isSending: boolean
  chatError: string | null
  canRetry: boolean
  sendMessage: (content: string) => boolean
  retryLastMessage: () => boolean
  finishTypingAnimation: () => void
  activeConversationId: string | null
  conversations: ConversationSummary[]
  isLoadingConversations: boolean
  isSidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
  startNewConversation: () => Promise<void>
  switchToConversation: (id: string) => Promise<void>
}

export const ChatContext = createContext<ChatContextValue | null>(null)

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat deve ser usado dentro de ChatProvider')
  }
  return context
}
