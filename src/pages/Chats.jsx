import { useStore } from "@/store"

export default function Chats() {
  const { chats } = useStore()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Chats</h1>
      <ul className="mt-4 space-y-2">
        {chats.map((chat) => (
          <li key={chat.id} className="rounded-md border p-2">
            {chat.title}
          </li>
        ))}
      </ul>
    </div>
  )
}