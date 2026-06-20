import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Input } from '@/components/atoms/Input'

describe('Input', () => {
  it('renderiza com placeholder', () => {
    render(<Input placeholder="Digite seu e-mail" />)
    expect(screen.getByPlaceholderText('Digite seu e-mail')).toBeInTheDocument()
  })

  it('aceita digitação do usuário', async () => {
    const user = userEvent.setup()
    render(<Input aria-label="E-mail" />)

    await user.type(screen.getByLabelText('E-mail'), 'user@example.com')
    expect(screen.getByLabelText('E-mail')).toHaveValue('user@example.com')
  })
})
