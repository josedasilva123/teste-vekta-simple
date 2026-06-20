import { useCallback, useEffect, useRef, useState } from 'react'
import { buildWsUrl } from '@/config/env'
import {
  appendStreamChunk,
  appendUserMessage,
  finalizeStreamedMessage,
  finishTypingAnimation as finishTypingAnimationState,
  removeStreamingMessage,
  replaceStreamContent,
} from '@/domains/chat/chat-stream'
import type { ChatMessage, WsIncomingEvent } from '@/domains/chat/types'

const INITIAL_RECONNECT_DELAY_MS = 1_000
const MAX_RECONNECT_DELAY_MS = 10_000
const NON_RECONNECTABLE_CLOSE_CODES = new Set([4404])

type UseChatWebSocketOptions = {
  conversationId: string | null
  enabled?: boolean
}

type UseChatWebSocketResult = {
  messages: ChatMessage[]
  isConnected: boolean
  isSending: boolean
  error: string | null
  canRetry: boolean
  sendMessage: (content: string) => boolean
  retryLastMessage: () => boolean
  setMessages: (messages: ChatMessage[]) => void
  clearMessages: () => void
  finishTypingAnimation: () => void
}

function closeWebSocket(ws: WebSocket): void {
  ws.onopen = null
  ws.onclose = null
  ws.onerror = null
  ws.onmessage = null

  if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
    ws.close()
  }
}

function parseIncomingEvent(raw: string): WsIncomingEvent | null {
  try {
    return JSON.parse(raw) as WsIncomingEvent
  } catch {
    return null
  }
}

export function useChatWebSocket({
  conversationId,
  enabled = true,
}: UseChatWebSocketOptions): UseChatWebSocketResult {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryContent, setRetryContent] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const lastSentContentRef = useRef<string | null>(null)

  const resetStreamingState = useCallback(() => {
    setMessages((current) => removeStreamingMessage(current))
    setIsSending(false)
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    resetStreamingState()
    setError(null)
    setRetryContent(null)
    lastSentContentRef.current = null
  }, [resetStreamingState])

  const canConnect = enabled && Boolean(conversationId)

  useEffect(() => {
    if (!canConnect || !conversationId) {
      return
    }

    let disposed = false
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined
    let reconnectAttempt = 0

    const resetSessionState = () => {
      setMessages((current) => removeStreamingMessage(current))
      setIsSending(false)
      setError(null)
      setRetryContent(null)
      lastSentContentRef.current = null
    }

    resetSessionState()

    const scheduleReconnect = (closeCode: number) => {
      if (disposed || NON_RECONNECTABLE_CLOSE_CODES.has(closeCode)) {
        return
      }

      const delay = Math.min(
        INITIAL_RECONNECT_DELAY_MS * 2 ** reconnectAttempt,
        MAX_RECONNECT_DELAY_MS,
      )
      reconnectAttempt += 1
      reconnectTimer = setTimeout(connect, delay)
    }

    const connect = () => {
      if (disposed) return

      const ws = new WebSocket(buildWsUrl(`/api/v1/conversations/${conversationId}/ws`))
      wsRef.current = ws

      ws.onopen = () => {
        if (disposed) return
        reconnectAttempt = 0
        setIsConnected(true)
        setError(null)
      }

      ws.onclose = (event) => {
        if (disposed) return

        setIsConnected(false)
        setIsSending(false)

        if (wsRef.current === ws) {
          wsRef.current = null
        }

        scheduleReconnect(event.code)
      }

      ws.onerror = () => {
        if (disposed) return
        setError('Falha na conexão com o chat')
        if (lastSentContentRef.current) {
          setRetryContent(lastSentContentRef.current)
        }
      }

      ws.onmessage = (event) => {
        const data = parseIncomingEvent(String(event.data))
        if (!data) {
          setError('Resposta inválida do servidor')
          return
        }

        if (data.type === 'user_message') {
          setMessages((current) => appendUserMessage(current, data.message))
          return
        }

        if (data.type === 'chunk') {
          setMessages((current) => appendStreamChunk(current, data.content))
          return
        }

        if (data.type === 'replace') {
          setMessages((current) => replaceStreamContent(current, data.content))
          return
        }

        if (data.type === 'done') {
          setMessages((current) => finalizeStreamedMessage(current, data.ai_message))
          setIsSending(false)
          setRetryContent(null)
          return
        }

        if (data.type === 'error') {
          setError(data.detail ?? 'Erro ao processar mensagem')
          setRetryContent(lastSentContentRef.current)
          setMessages((current) => removeStreamingMessage(current))
          setIsSending(false)
        }
      }
    }

    connect()

    return () => {
      disposed = true

      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }

      if (wsRef.current) {
        closeWebSocket(wsRef.current)
        wsRef.current = null
      }

      setIsConnected(false)
    }
  }, [canConnect, conversationId])

  const finishTypingAnimation = useCallback(() => {
    setMessages((current) => finishTypingAnimationState(current))
  }, [])

  const sendMessage = useCallback((content: string) => {
    const trimmed = content.trim()
    if (!trimmed) {
      return false
    }

    lastSentContentRef.current = trimmed

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Aguardando conexão com o chat. Tente novamente em instantes.')
      setRetryContent(trimmed)
      return false
    }

    setError(null)
    setRetryContent(null)
    setMessages((current) => removeStreamingMessage(current))
    setIsSending(true)
    wsRef.current.send(JSON.stringify({ type: 'message', content: trimmed }))
    return true
  }, [])

  const retryLastMessage = useCallback(() => {
    const content = retryContent ?? lastSentContentRef.current
    if (!content) {
      return false
    }

    return sendMessage(content)
  }, [retryContent, sendMessage])

  return {
    messages,
    isConnected: canConnect && isConnected,
    isSending,
    error,
    canRetry: Boolean(retryContent),
    sendMessage,
    retryLastMessage,
    setMessages,
    clearMessages,
    finishTypingAnimation,
  }
}
