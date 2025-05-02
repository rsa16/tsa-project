import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import axios from "axios"

export default function Cards() {
  const [cards, setCards] = useState([])
  const userId = "example-user-id" // Replace with actual user ID from auth

  useEffect(() => {
    // Fetch cards for the user
    const fetchCards = async () => {
      try {
        const response = await axios.get(`/api/cards/${userId}`)
        setCards(response.data)
      } catch (error) {
        console.error("Error fetching cards:", error)
      }
    }

    fetchCards()
  }, [userId])

  return (
    <div className="p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Cards</h1>
        <Button asChild>
          <Link to="/">Back to Home</Link>
        </Button>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{card.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}