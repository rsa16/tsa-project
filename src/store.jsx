import React, { createContext, useContext, useState, useEffect } from "react"
import { chatAPI } from "@/lib/api"

const StoreContext = createContext()

export const StoreProvider = ({ children }) => {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchChats = async () => {
    try {
      setLoading(true)
      const data = await chatAPI.getChats()
      setChats(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (chatId, message) => {
    try {
      const response = await chatAPI.sendMessage(chatId, message)
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === chatId 
            ? { ...chat, messages: [...chat.messages, ...response.messages] }
            : chat
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
      const newChat = await chatAPI.createChat(title)
      setChats(prevChats => [...prevChats, newChat])
      return newChat
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

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
  )
}

export const useStore = () => useContext(StoreContext)