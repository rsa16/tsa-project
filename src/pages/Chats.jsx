import { useStore } from "@/store";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { motion } from "framer-motion"

export default function Chats() {
    const { chats } = useStore();
    const navigate = useNavigate()

    return (
        <motion.div className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <header className="ml-3 mb-8 flex items-center">
                <SidebarTrigger className="-ml-3 mr-3" />
                <Breadcrumb>
                    <BreadcrumbItem>
                        <BreadcrumbPage>Chat Display</BreadcrumbPage>
                    </BreadcrumbItem>
                </Breadcrumb>
            </header>
            {chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center">
                    <h2 className="text-2xl font-semibold text-muted-foreground mb-2">No chats yet</h2>
                    <p className="text-sm text-muted-foreground">Click the button on the bottom right to create one</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {chats.map((chat) => (
                        <Card
                            key={chat.id}
                            className="hover:shadow-lg transition-shadow"
                        >
                            <CardHeader>
                                <CardTitle>{chat.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground truncate">
                                    {chat.messages.length > 0
                                        ? `${chat.messages[chat.messages.length - 1].role}: ${chat.messages[chat.messages.length - 1].content
                                        }`
                                        : "No messages yet"}
                                </p>
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="mt-4"
                                >
                                    <Link to={`/chats/${chat.id}`}>Open Chat</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            <Button
                asChild
                className="fixed bottom-6 right-6 rounded-full h-14 w-14 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 flex items-center justify-center"
                title="New Chat"
            >
                <Link to="/chats/new">
                    <span className="sr-only">New Chat</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </Link>
            </Button>
        </motion.div>
    );
}