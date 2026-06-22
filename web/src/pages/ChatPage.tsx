import { ChatWindow } from '@/components/organisms/ChatWindow'
import { ChatLayout } from '@/components/templates/ChatLayout'
import { useChat } from '@/domains/chat/chat-context'

export function ChatPage() {
  const {
    pageError,
    isLoading,
    isCreatingConversation,
    messages,
    chatError,
    canRetry,
    isConnected,
    isSending,
    activeConversationId,
    sendMessage,
    retryLastMessage,
    finishTypingAnimation,
  } = useChat()

  const inputDisabled =
    isSending || isCreatingConversation || isLoading || (!!activeConversationId && !isConnected)

  const showReconnecting = !!activeConversationId && !isConnected && !isLoading

  return (
    <ChatLayout>
      {pageError ? (
        <div className="border-b border-red-900/40 bg-red-950/30 px-4 py-2 text-center text-sm text-red-300">
          {pageError}
        </div>
      ) : null}
      <ChatWindow
        messages={messages}
        onSend={sendMessage}
        isSending={isSending || isCreatingConversation}
        isConnected={isConnected}
        isLoading={isLoading}
        showReconnecting={showReconnecting}
        error={chatError}
        canRetry={canRetry}
        onRetry={retryLastMessage}
        onTypingComplete={finishTypingAnimation}
        inputDisabled={inputDisabled}
      />
    </ChatLayout>
  )
}
