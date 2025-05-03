import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route, useSearchParams } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import Home from "@/pages/Home"
import Chats from "@/pages/Chats"
import Chat from "@/pages/Chat"
import Cards from "@/pages/Cards"
import NewChat from "@/pages/NewChat"
import { StoreProvider } from "@/store"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { UserProvider, useUser } from "./context/user-context"

const RouterWrapper = () => {
  const [searchParams] = useSearchParams();
  const { setUserId } = useUser();

  useEffect(() => {
    const userIdFromUrl = searchParams.get('user_id');
    if (userIdFromUrl) {
      setUserId(userIdFromUrl);
    }
  }, [searchParams, setUserId]);

  return (
    <SidebarInset>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/chats/new" element={<NewChat />} />
          <Route path="/chats/:chatId" element={<Chat />} />
          <Route path="/cards" element={<Cards />} />
        </Routes>
      </AnimatePresence>
    </SidebarInset>
  );
};

const StoreWrapper = ({ children }) => {
  const { userId } = useUser();
  return <StoreProvider userId={userId}>{children}</StoreProvider>;
};

function App() {
  return (
    <UserProvider>
      <Router>
        <StoreWrapper>
          <SidebarProvider>
            <AppSidebar />
            <RouterWrapper />
          </SidebarProvider>
        </StoreWrapper>
      </Router>
    </UserProvider>
  );
}

export default App;
