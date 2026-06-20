import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Logo } from '@/components/atoms/Logo'

describe('Logo', () => {
  it('renderiza o nome da aplicação', () => {
    render(<Logo />)
    expect(screen.getByText('ChatterBox')).toBeInTheDocument()
    expect(screen.getByText('C')).toBeInTheDocument()
  })
})
