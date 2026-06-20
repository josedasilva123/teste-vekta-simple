import { ChatProvider } from '@/domains/chat/ChatProvider'
import { ChatPage } from '@/pages/ChatPage'

function App() {
  return (
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  )
}

export default App
