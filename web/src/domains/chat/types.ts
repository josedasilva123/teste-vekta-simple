export type SenderRole = 'USER' | 'AI'

export type Message = {
  id: string
  conversation_id: string
  sender: SenderRole
  content: string
  created_at: string
}

export type Conversation = {
  id: string
  messages: Message[]
  created_at: string
}

export type WsOutgoingMessage = {
  type: 'message'
  content: string
}

export type WsIncomingEvent =
  | { type: 'user_message'; message: Message }
  | { type: 'chunk'; content: string }
  | { type: 'replace'; content: string }
  | { type: 'done'; ai_message: Message }
  | { type: 'error'; detail?: string }

export type ChatMessage = {
  id: string
  sender: SenderRole
  content: string
  streaming?: boolean
  streamEnded?: boolean
  finalId?: string
}
