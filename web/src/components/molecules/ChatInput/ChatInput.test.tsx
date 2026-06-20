import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ChatInput } from '@/components/molecules/ChatInput'

describe('ChatInput', () => {
  it('envia mensagem ao submeter o formulário', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn().mockReturnValue(true)

    render(<ChatInput onSend={onSend} />)

    await user.type(screen.getByPlaceholderText('Envie uma mensagem...'), 'Olá!')
    await user.click(screen.getByRole('button', { name: 'Enviar mensagem' }))

    expect(onSend).toHaveBeenCalledWith('Olá!')
  })

  it('limpa o campo após enviar com sucesso', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={vi.fn().mockReturnValue(true)} />)

    const input = screen.getByPlaceholderText('Envie uma mensagem...')
    await user.type(input, 'Mensagem')
    await user.click(screen.getByRole('button', { name: 'Enviar mensagem' }))

    expect(input).toHaveValue('')
  })

  it('mantém o texto quando o envio falha', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={vi.fn().mockReturnValue(false)} />)

    const input = screen.getByPlaceholderText('Envie uma mensagem...')
    await user.type(input, 'Mensagem')
    await user.click(screen.getByRole('button', { name: 'Enviar mensagem' }))

    expect(input).toHaveValue('Mensagem')
  })

  it('não envia mensagem vazia', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()

    render(<ChatInput onSend={onSend} />)

    await user.click(screen.getByRole('button', { name: 'Enviar mensagem' }))
    expect(onSend).not.toHaveBeenCalled()
  })

  it('envia com Enter e não envia com Shift+Enter', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn().mockReturnValue(true)

    render(<ChatInput onSend={onSend} />)

    const input = screen.getByPlaceholderText('Envie uma mensagem...')
    await user.type(input, 'Primeira linha{Shift>}{Enter}{/Shift}Segunda linha')
    expect(onSend).not.toHaveBeenCalled()

    await user.type(input, '{Enter}')
    expect(onSend).toHaveBeenCalledWith('Primeira linha\nSegunda linha')
  })
})
