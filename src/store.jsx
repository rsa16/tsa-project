import React, { createContext, useContext, useState, useEffect, Component } from "react"
import { chatAPI } from "@/lib/api"

const StoreContext = createContext()

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Store Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export const StoreProvider = ({ children, userId }) => {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const sortChats = (chatsToSort) => {
    return [...chatsToSort].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const fetchChats = async () => {
    try {
      setLoading(true)
      const data = await chatAPI.getChats(userId)
      setChats(sortChats(data))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (chatId, message) => {
    console.log(message)
    try {

      console.log(chatId, message, "helllo")
      const response = await chatAPI.sendMessage(chatId, message, userId)
      setChats(prevChats =>
        sortChats(
          prevChats.map(chat =>
            chat.id === chatId
              ? {
                ...chat, messages: [...chat.messages, response.messages[0], response.messages[1]]
              }
              : chat
          )
        )
      )
      return response
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const createChat = async (title) => {
    try {
      const newChat = await chatAPI.createChat(title, userId)
      setChats(prevChats => sortChats([{
        id: newChat.chat_id,
        title: title,
        messages: [],
        created_at: Date.now()
      }, ...prevChats]))
      return newChat
    } catch (err) {
      setError(err.message)
      throw err
    }
  };

  useEffect(() => {
    fetchChats()
  }, [userId])

  return (
    <StoreContext.Provider value={{
      chats,
      loading,
      error,
      sendMessage,
      createChat
    }}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </StoreContext.Provider>
  );
}
export const useStore = () => useContext(StoreContext)