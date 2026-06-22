import { useEffect, useRef } from 'react'
import { useChat } from '@/domains/chat/chat-context'
import type { ConversationSummary } from '@/domains/chat/types'

function formatDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) {
    return date.toLocaleDateString('pt-BR', { weekday: 'short' })
  }
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

type ConversationItemProps = {
  summary: ConversationSummary
  isActive: boolean
  onClick: () => void
}

function ConversationItem({ summary, isActive, onClick }: ConversationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        isActive
          ? 'bg-surface-elevated text-white'
          : 'text-muted hover:bg-surface-elevated hover:text-white'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium">
          {summary.preview ? summary.preview : 'Conversa sem mensagens'}
        </span>
        <span className="shrink-0 text-xs text-muted">{formatDate(summary.created_at)}</span>
      </div>
      {summary.message_count > 0 && (
        <p className="mt-0.5 text-xs text-muted">
          {summary.message_count} {summary.message_count === 1 ? 'mensagem' : 'mensagens'}
        </p>
      )}
    </button>
  )
}

export function ConversationSidebar() {
  const {
    conversations,
    isLoadingConversations,
    activeConversationId,
    isSidebarOpen,
    closeSidebar,
    startNewConversation,
    switchToConversation,
  } = useChat()

  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    if (!isSidebarOpen) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar()
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isSidebarOpen, closeSidebar])

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 safe-area-top">
        <span className="text-sm font-semibold text-white">Conversas</span>
        <button
          type="button"
          onClick={closeSidebar}
          className="rounded-md p-1 text-muted transition-colors hover:bg-surface-elevated hover:text-white md:hidden"
          aria-label="Fechar menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="shrink-0 px-3 py-3">
        <button
          type="button"
          onClick={() => void startNewConversation()}
          className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nova conversa
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {isLoadingConversations && conversations.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
          </div>
        ) : conversations.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-muted">Nenhuma conversa ainda</p>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <ConversationItem
                  summary={conv}
                  isActive={conv.id === activeConversationId}
                  onClick={() => void switchToConversation(conv.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar — always visible at md+ */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar md:flex md:flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile drawer — overlay + slide-in panel */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* backdrop */}
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-black/60"
            onClick={closeSidebar}
            aria-hidden="true"
          />
          {/* panel */}
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
