import type { ChatMessage, Message } from '@/domains/chat/types'

export const STREAMING_MESSAGE_ID = 'streaming-ai'

export function removeStreamingMessage(messages: ChatMessage[]): ChatMessage[] {
  return messages.filter((message) => message.id !== STREAMING_MESSAGE_ID)
}

export function appendUserMessage(messages: ChatMessage[], message: Message): ChatMessage[] {
  return [
    ...messages.filter((item) => item.id !== message.id),
    {
      id: message.id,
      sender: message.sender,
      content: message.content,
    },
  ]
}

export function appendStreamChunk(messages: ChatMessage[], chunk: string): ChatMessage[] {
  const streaming = messages.find((message) => message.id === STREAMING_MESSAGE_ID)

  return [
    ...removeStreamingMessage(messages),
    {
      id: STREAMING_MESSAGE_ID,
      sender: 'AI',
      content: `${streaming?.content ?? ''}${chunk}`,
      streaming: true,
    },
  ]
}

export function replaceStreamContent(messages: ChatMessage[], content: string): ChatMessage[] {
  return [
    ...removeStreamingMessage(messages),
    {
      id: STREAMING_MESSAGE_ID,
      sender: 'AI',
      content,
      streaming: true,
    },
  ]
}

export function finalizeStreamedMessage(messages: ChatMessage[], aiMessage: Message): ChatMessage[] {
  const streamed = messages.find((message) => message.id === STREAMING_MESSAGE_ID)
  const streamedContent = streamed?.content ?? ''
  const content =
    aiMessage.content.length >= streamedContent.length ? aiMessage.content : streamedContent

  return [
    ...removeStreamingMessage(messages),
    {
      id: STREAMING_MESSAGE_ID,
      sender: aiMessage.sender,
      content,
      streaming: true,
      streamEnded: true,
      finalId: aiMessage.id,
    },
  ]
}

export function finishTypingAnimation(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((message) => {
    if (message.id !== STREAMING_MESSAGE_ID || !message.streamEnded) {
      return message
    }

    return {
      id: message.finalId ?? message.id,
      sender: message.sender,
      content: message.content,
    }
  })
}
