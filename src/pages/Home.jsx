import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <motion.div
      className="p-6 flex flex-col items-center justify-center h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="text-4xl font-bold mb-4">Welcome to TSA Chat</h1>
      <p className="text-muted-foreground text-center mb-6">
        Start a new chat or view your existing conversations.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link to="/chats">View Chats</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/chats/new">Start New Chat</Link>
        </Button>
      </div>
    </motion.div>
  )
}