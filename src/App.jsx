import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import Home from "@/pages/Home"
import Chats from "@/pages/Chats"
import Chat from "@/pages/Chat" // Import the new Chat page
import Cards from "@/pages/Cards" // Import the new Cards page
import { StoreProvider } from "@/store"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

function App() {
  return (
    <StoreProvider>
      <SidebarProvider>
        <Router>
          <AppSidebar />
          <SidebarInset>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chats" element={<Chats />} />
                <Route path="/chats/:chatId" element={<Chat />} /> {/* Dynamic route for individual chats */}
                <Route path="/cards" element={<Cards />} /> {/* New route for Cards */}
              </Routes>
            </AnimatePresence>
          </SidebarInset>
        </Router>
      </SidebarProvider>
    </StoreProvider>
  )
}

export default App
