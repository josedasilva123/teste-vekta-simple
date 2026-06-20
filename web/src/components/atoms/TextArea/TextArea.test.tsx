import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TextArea } from '@/components/atoms/TextArea'

describe('TextArea', () => {
  it('renderiza com placeholder', () => {
    render(<TextArea placeholder="Escreva uma mensagem" />)
    expect(screen.getByPlaceholderText('Escreva uma mensagem')).toBeInTheDocument()
  })

  it('aceita digitação do usuário', async () => {
    const user = userEvent.setup()
    render(<TextArea aria-label="Mensagem" />)

    await user.type(screen.getByLabelText('Mensagem'), 'Olá!')
    expect(screen.getByLabelText('Mensagem')).toHaveValue('Olá!')
  })
})
