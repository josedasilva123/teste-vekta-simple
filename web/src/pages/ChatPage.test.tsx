import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChatPage } from '@/pages/ChatPage'

vi.mock('@/components/organisms/ChatMain', () => ({
  ChatMain: () => <div>Chat principal</div>,
}))

describe('ChatPage', () => {
  it('renderiza layout com chat principal', () => {
    render(<ChatPage />)
    expect(screen.getByText('Chat principal')).toBeInTheDocument()
  })
})
