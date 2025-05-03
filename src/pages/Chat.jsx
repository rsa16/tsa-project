import { useParams } from "react-router-dom"
import { useStore } from "@/store"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { useNavigate } from "react-router-dom"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Chat() {
    const { chatId } = useParams()
    const { chats, sendMessage } = useStore()
    const [chatInput, setChatInput] = useState('');
    const [sending, setSending] = useState(false);
    const chat = chats.find((c) => c.id === chatId);
    const navigate = useNavigate()

    const handleChatSubmit = async (e) => {
        e.preventDefault()
        if (chatInput.trim() === '' || sending) return

        try {
            setSending(true)
            await sendMessage(chatId, chatInput)
            setChatInput("")
        } catch (err) {
            console.error("Failed to send message:", err)
        } finally {
            setSending(false)
        }
    }

    if (!chat) {
        return (
            <motion.div
                className="p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="text-2xl font-bold">Chat Not Found</h1>
                <Button asChild>
                    <Link to="/chats">Back to Chats</Link>
                </Button>
            </motion.div>
        )
    }

    return (
        <motion.div
            className="p-6 pt-0 flex flex-col h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <header className="flex flex-row h-16 shrink-0 gap-2 pl-4 items-center">
                <SidebarTrigger className="-ml-3 mr-3" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink onClick={() => navigate("/chats")}>
                                Chats
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{chats[chats.length - 1]?.title}</BreadcrumbPage>
                        </BreadcrumbItem>  
                    </BreadcrumbList>
                </Breadcrumb>
                <Button className="ml-auto" asChild>
                    <Link to="/chats">Back to Chats</Link>
                </Button>
            </header>
            <div className="flex-1 overflow-y-auto rounded-md border border-muted p-4">
            {chat?.messages?.length === 0 ? (
                    <p className="text-muted-foreground text-center">
                        No messages yet. Start the conversation!
                    </p>
                ) : (
                    chat?.messages?.map((message, index) => (
                        <div
                            key={index}
                            className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`rounded-lg px-4 py-2 ${message.role === "user"
                                    ? "bg-primary text-primary-foreground "
                                    : "bg-muted text-muted-foreground" 
                                    }`}
                            >
                                {message.content}
                            </div>
                        </div>
                    ))
                )}
            </div>
            <form
                onSubmit={handleChatSubmit}
                className="flex items-center gap-2 border-t border-muted pt-4"
            >
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 rounded-md border border-muted px-4 py-2"
                    disabled={sending}
                />
                <Button type="submit" disabled={sending}>
                    {sending ? "Sending..." : "Send"}
                </Button>
            </form>
        </motion.div>
    )
}