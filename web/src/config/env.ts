export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
} as const

export function buildWsUrl(path: string): string {
  const base = env.apiUrl.replace(/^http/, 'ws')
  return `${base}${path}`
}
