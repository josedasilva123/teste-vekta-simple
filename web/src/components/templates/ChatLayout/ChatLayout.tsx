import type { ReactNode } from 'react'
import { Logo } from '@/components/atoms/Logo'
import { ConversationSidebar } from '@/components/organisms/ConversationSidebar'
import { useChat } from '@/domains/chat/chat-context'

type ChatLayoutProps = {
  children: ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
  const { toggleSidebar } = useChat()

  return (
    <div className="flex h-full overflow-hidden bg-surface">
      <ConversationSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center border-b border-border bg-sidebar px-4 py-3 safe-area-top">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="mr-3 rounded-md p-1.5 text-muted transition-colors hover:bg-surface-elevated hover:text-white md:hidden"
            aria-label="Abrir histórico de conversas"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex flex-1 justify-center">
            <Logo />
          </div>

          {/* spacer to keep logo centered on mobile */}
          <div className="ml-3 w-8 md:hidden" aria-hidden="true" />
        </header>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  )
}
