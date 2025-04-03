import { AppSidebar } from "@/components/app-sidebar"
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
import { useStore } from "@/store"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const { chats, messages, setMessages, addChat, clearMessages } = useStore()
  const navigate = useNavigate()

  const handleChatSubmit = (e) => {
    e.preventDefault()
    if (chatInput.trim() === "") return
    const newMessage = { id: messages.length + 1, text: chatInput, sender: "user" }
    setMessages((prevMessages) => [...prevMessages, newMessage])
    setChatInput("") // Clear input after submission

    // Simulate bot response
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        text: `This is a placeholder response to: "${chatInput}"`,
        sender: "bot",
      }
      setMessages((prevMessages) => [...prevMessages, botMessage])
    }, 1000)
  }

  const handleNewChat = () => {
    addChat(`Chat ${chats.length + 1}`)
    clearMessages()
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
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
          <button
            onClick={handleNewChat}
            className="ml-auto rounded-md bg-primary px-4 py-2 text-primary-foreground"
          >
            New Chat
          </button>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex-1 overflow-y-auto rounded-md border border-muted p-4">
            {messages.length === 0 ? (
              <div className="text-muted text-center">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {message.text}
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
              placeholder="Ask me anything environment-related..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 rounded-md border border-muted px-4 py-2"
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            >
              Send
            </button>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}