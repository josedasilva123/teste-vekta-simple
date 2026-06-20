import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChatLayout } from '@/components/templates/ChatLayout'

describe('ChatLayout', () => {
  it('renderiza logo e conteúdo principal', () => {
    render(
      <ChatLayout>
        <p>Conteúdo do chat</p>
      </ChatLayout>,
    )

    expect(screen.getByText('Conteúdo do chat')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})
