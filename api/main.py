from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, ConfigDict
import firebase_admin
from firebase_admin import credentials, auth, firestore, exceptions
from typing import List, Optional
from datetime import datetime
from env_chatbot import get_enhanced_response, Session

cred = credentials.Certificate("./firebase_credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

app = FastAPI()

class UserAuth(BaseModel):
    email: str
    password: str

class ChatMessage(BaseModel):
    user_id: str
    message: str
    timestamp: float

class Message(BaseModel):
    model_config = ConfigDict(extra='forbid')
    content: str
    role: str
    timestamp: float

class Chat(BaseModel):
    model_config = ConfigDict(extra='forbid')
    id: Optional[str] = None
    user_id: str
    title: str
    messages: List[Message] = []    
    created_at: float = datetime.now().timestamp()

class ChatCreate(BaseModel):
    user_id: str
    title: str

class MessageCreate(BaseModel):
    message: str

@app.post("/register")
def register_user(user: UserAuth):
    try:
        user_record = auth.create_user(email=user.email, password=user.password)
        return {"user_id": user_record.uid, "message": "User registered successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/login")
def login_user(user: UserAuth):
    return {"message": "Login handled by Firebase SDK on the frontend"}


@app.post("/chats")
async def create_chat(chat_create: ChatCreate):
    try:
        new_chat = Chat(user_id=chat_create.user_id, title=chat_create.title, messages=[])
        doc_ref = db.collection("chats").document()
        new_chat.id = doc_ref.id
        doc_ref.set(new_chat.model_dump())

        return {"chat_id": new_chat.id, "title": new_chat.title}
    except exceptions.FirebaseError as e:
        raise HTTPException(status_code=500, detail=f"Firebase error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/chats/{user_id}")
def get_chats(user_id: str):
    try:
        chats_docs = db.collection("chats").where("user_id", "==", user_id).stream()
        
        chat_list = []
        for chat_doc in chats_docs:
            chat_data = chat_doc.to_dict()
            chat_id = chat_doc.id
            chat_list.append({**chat_data, "id": chat_id})
            
        return chat_list
    except exceptions.FirebaseError as e:
        raise HTTPException(status_code=500, detail=f"Firebase error: {e}")
    except Exception as e:
       raise HTTPException(status_code=500, detail=str(e))

@app.post("/chats/{chat_id}/messages")
async def send_message(chat_id: str, message: MessageCreate):
    try:
        session = Session()
        chat_ref = db.collection("chats").document(chat_id)
        chat_doc = chat_ref.get()
        if not chat_doc.exists:
            raise HTTPException(status_code=404, detail="Chat not found")
        chat = Chat(**chat_doc.to_dict())
        
        user_message = Message(
            content=message.message, role="user", timestamp=datetime.now().timestamp()
        )
        chat.messages.append(user_message)

        bot_response = get_enhanced_response(message.message, session)
        bot_message = Message(
            content=bot_response, role="assistant", timestamp=datetime.now().timestamp()
        )
        chat.messages.append(bot_message)

        chat_ref.update({"messages": [m.model_dump() for m in chat.messages]})
        return {
            "messages": [user_message, bot_message]
        }
    except exceptions.FirebaseError as e:
        raise HTTPException(status_code=500, detail=f"Firebase error: {e}")
    except Exception as e:
       raise HTTPException(status_code=500, detail=str(e))