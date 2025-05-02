import React, { createContext, useContext, useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { chatAPI } from "@/lib/api"

const StoreContext = createContext()

export const StoreProvider = ({ children }) => {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams();
  const user_id = searchParams.get('user_id')
  const [error, setError] = useState(null)

  const fetchChats = async () => {
    try {
      setLoading(true)
      const data = await chatAPI.getChats(user_id)
      setChats(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (chatId, message) => {
    console.log(message)
    try {
      const response = await chatAPI.sendMessage(chatId, message, user_id)
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === chatId
            ? {
              ...chat, messages: [...chat.messages, response.messages[0], response.messages[1]]
            }
            : chat
        )
      )
      return response
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const createChat = async (title, userId) => {
    try {
      const newChat = await chatAPI.createChat(title, user_id)
      setChats(prevChats => [...prevChats, newChat])
      return newChat
    } catch (err) {
      setError(err.message)
      throw err
    }
  };

  useEffect(() => {
    const sortChats = () => {
      const sortedChats = [...chats].sort(
        (a, b) => b.created_at - a.created_at
      )
      setChats(sortedChats)
    }

    sortChats()
  }, [chats])

  useEffect(() => {
    fetchChats()
  }, [])

  return (
    <StoreContext.Provider value={{
      chats,
      loading,
      error,
      sendMessage,
      createChat
    }}>
      {children}
    </StoreContext.Provider>
  );
}
export const useStore = () => useContext(StoreContext)