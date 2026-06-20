import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, ApiError } from '@/lib/http'

describe('apiRequest', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('envia JSON e retorna payload', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'conv-1' }),
    } as Response)

    const result = await apiRequest<{ id: string }>('/api/v1/conversations', {
      method: 'POST',
    })

    expect(result).toEqual({ id: 'conv-1' })
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/conversations',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('lança ApiError quando a resposta falha', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ detail: 'Conversa não encontrada' }),
    } as Response)

    await expect(apiRequest('/api/v1/conversations/missing')).rejects.toEqual(
      new ApiError('Conversa não encontrada', 404),
    )
  })
})
