import type { ReactNode } from 'react'
import { Logo } from '@/components/atoms/Logo'

type ChatLayoutProps = {
  children: ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="flex h-full flex-col bg-surface">
      <header className="flex shrink-0 items-center justify-center border-b border-border bg-sidebar px-4 py-3 safe-area-top">
        <Logo />
      </header>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
    </div>
  )
}
