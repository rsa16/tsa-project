import { useStore } from "@/store"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function Chats() {
  const { chats } = useStore()

  return (
    <div className="p-6">
      <header className="ml-3 mb-8 flex items-center">
        <SidebarTrigger className="-ml-3 mr-3" />
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbPage>Chat Display</BreadcrumbPage>
          </BreadcrumbItem>
        </Breadcrumb>
      </header>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {chats.map((chat) => (
          <Card key={chat.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{chat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Click to view or continue this chat.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link to={`/chats/${chat.id}`}>Open Chat</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button
        asChild
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 flex items-center justify-center"
        title="New Chat"
      >
        <Link to="/chats/new">
          <span className="sr-only">New Chat</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </Button>
    </div>
  )
}