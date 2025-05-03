import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useStore } from "@/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb"

export default function NewChat() {
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const { createChat } = useStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || loading) return

    try {
      setLoading(true)
      const newChat = await createChat(title.trim())
      navigate(`/chats/${newChat.chat_id}`)
    } catch (err) {
      console.error("Failed to create chat:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="p-6 flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <header className="flex flex-row h-16 shrink-0 gap-2 pl-4 items-center">
        <SidebarTrigger className="-ml-3 mr-3" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate("/chats")}>
                Chats
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbPage>New Chat</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex-1 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-center mb-6">Create New Chat</h1>
          <Input
            type="text"
            placeholder="Enter chat title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/chats")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? "Creating..." : "Create Chat"}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
