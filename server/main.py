from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, auth, firestore
from typing import List, Optional
from datetime import datetime
from .env_chatbot import get_enhanced_response, Session

cred = credentials.Certificate("path/to/firebase_credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI()

# Store active chat sessions
chat_sessions = {}

class UserAuth(BaseModel):
    email: str
    password: str

class ChatMessage(BaseModel):
    user_id: str
    message: str
    timestamp: float

class Card(BaseModel):
    user_id: str
    title: str
    content: str
    timestamp: float

class Message(BaseModel):
    content: str
    role: str
    timestamp: float

class Chat(BaseModel):
    id: int
    title: str
    messages: List[Message] = []
    created_at: float = datetime.now().timestamp()

class ChatCreate(BaseModel):
    title: str

class MessageCreate(BaseModel):
    message: str

@app.post("/register")
def register_user(user: UserAuth):
    try:
        user_record = auth.create_user(email=user.email, password=user.password)
        return {"user_id": user_record.uid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/login")
def login_user(user: UserAuth):
    return {"message": "Login handled by Firebase SDK on the frontend"}

@app.post("/chats")
def save_chat(chat: ChatMessage):
    db.collection("chats").add(chat.dict())
    return {"message": "Chat saved"}

@app.get("/chats/{user_id}")
def get_chats(user_id: str):
    chats = db.collection("chats").where("user_id", "==", user_id).stream()
    return [{**chat.to_dict(), "id": chat.id} for chat in chats]

@app.post("/cards")
def create_card(card: Card):
    db.collection("cards").add(card.dict())
    return {"message": "Card created"}

@app.get("/cards/{user_id}")
def get_cards(user_id: str):
    cards = db.collection("cards").where("user_id", "==", user_id).stream()
    return [{**card.to_dict(), "id": card.id} for card in cards]

@app.post("/api/chats")
async def create_chat(chat: ChatCreate):
    chat_id = len(chat_sessions) + 1
    new_chat = Chat(id=chat_id, title=chat.title)
    chat_sessions[chat_id] = {
        "chat": new_chat,
        "session": Session()
    }
    return new_chat

@app.get("/api/chats")
async def get_chats():
    return [chat["chat"] for chat in chat_sessions.values()]

@app.get("/api/chats/{chat_id}")
async def get_chat(chat_id: int):
    if chat_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat_sessions[chat_id]["chat"]

@app.post("/api/chats/{chat_id}/messages")
async def send_message(chat_id: int, message: MessageCreate):
    if chat_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Chat not found")
    
    chat_data = chat_sessions[chat_id]
    chat = chat_data["chat"]
    session = chat_data["session"]

    # Add user message
    user_message = Message(
        content=message.message,
        role="user",
        timestamp=datetime.now().timestamp()
    )
    chat.messages.append(user_message)

    # Get bot response
    bot_response = get_enhanced_response(message.message, session)
    bot_message = Message(
        content=bot_response,
        role="assistant",
        timestamp=datetime.now().timestamp()
    )
    chat.messages.append(bot_message)

    return {
        "messages": [user_message, bot_message]
    }