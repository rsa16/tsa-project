import React, { createContext, useContext, useState } from "react"

const StoreContext = createContext()

export const StoreProvider = ({ children }) => {
  const [chats, setChats] = useState([{ id: 1, title: "Environmental Usage" }])
  const [messages, setMessages] = useState([])

  const addChat = (title) => {
    const newChat = { id: chats.length + 1, title }
    setChats((prevChats) => [...prevChats, newChat])
  }

  const clearMessages = () => setMessages([])

  return (
    <StoreContext.Provider value={{ chats, messages, setMessages, addChat, clearMessages }}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => useContext(StoreContext)