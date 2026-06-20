import { ChatWindow } from '@/components/organisms/ChatWindow'
import { useChat } from '@/domains/chat/chat-context'

export function ChatMain() {
  const {
    pageError,
    isLoadingConversation,
    messages,
    chatError,
    canRetry,
    isLoadingMessages,
    isConnected,
    isSending,
    sendMessage,
    retryLastMessage,
    finalizeStreamingMessage,
  } = useChat()

  return (
    <>
      {pageError ? (
        <div className="border-b border-red-900/40 bg-red-950/30 px-4 py-2 text-center text-sm text-red-300">
          {pageError}
        </div>
      ) : null}
      <ChatWindow
        messages={messages}
        onSend={sendMessage}
        isSending={isSending}
        isConnected={isConnected}
        isLoading={isLoadingConversation || isLoadingMessages}
        error={chatError}
        canRetry={canRetry}
        onRetry={retryLastMessage}
        onStreamingTypingComplete={finalizeStreamingMessage}
      />
    </>
  )
}
