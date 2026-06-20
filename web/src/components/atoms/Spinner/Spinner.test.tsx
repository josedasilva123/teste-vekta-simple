import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Spinner } from '@/components/atoms/Spinner'

describe('Spinner', () => {
  it('renderiza indicador de carregamento acessível', () => {
    render(<Spinner />)
    expect(screen.getByRole('status', { name: 'Carregando' })).toBeInTheDocument()
  })
})
