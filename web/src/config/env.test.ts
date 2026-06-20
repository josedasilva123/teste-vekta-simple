import { describe, expect, it } from 'vitest'
import { buildWsUrl } from '@/config/env'

describe('buildWsUrl', () => {
  it('converte http para ws', () => {
    const url = buildWsUrl('/api/v1/conversations/abc/ws')
    expect(url).toBe('ws://localhost:8000/api/v1/conversations/abc/ws')
  })
})
