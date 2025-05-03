import os
from typing import Dict, List, Tuple, Optional
import json
import logging
import sys
from datetime import datetime
import re
import google.generativeai as genai

# logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("eco_assistant")

# env variables
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    logger.warning("No API key found. Please set GOOGLE_API_KEY environment variable.")
    GOOGLE_API_KEY = "your-api-key-here"

# Configure Gemini
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash-preview-04-17')

SUSTAINABILITY_DATABASE = {
    "agriculture": {
        "hydroponic_farming": {
            "description": "Soil-less growing technique that uses 90% less water than traditional farming.",
            "benefits": ["Water conservation", "Higher yields", "No soil needed", "Year-round growing"],
            "implementation": "Can be implemented at various scales from home systems to commercial operations."
        },
        "precision_agriculture": {
            "description": "Using sensors, drones, and data analytics to optimize farming practices.",
            "benefits": ["Reduced resource use", "Higher yields", "Less environmental impact"],
            "implementation": "Requires initial investment but offers significant long-term savings."
        },
        "crop_rotation": {
            "description": "Traditional practice of varying crops in the same area to improve soil health.",
            "benefits": ["Soil fertility", "Pest reduction", "Increased biodiversity"],
            "implementation": "Planning required but minimal additional costs."
        },
        "agroforestry": {
            "description": "Integrating trees with crop or livestock farming for multiple benefits.",
            "benefits": ["Carbon sequestration", "Biodiversity", "Multiple income streams"],
            "implementation": "Long-term approach with increasing benefits over time."
        }
    },
    "energy": {
        "solar_power": {
            "description": "Conversion of sunlight into electricity using photovoltaic cells.",
            "benefits": ["Renewable", "Decreasing costs", "Low maintenance"],
            "implementation": "Suitable for various scales from residential to utility."
        },
        "wind_energy": {
            "description": "Harnessing wind to generate electricity through turbines.",
            "benefits": ["Zero emissions", "Renewable", "Complements solar power"],
            "implementation": "Requires specific geographic conditions for optimal efficiency."
        },
        "biogas": {
            "description": "Converting organic waste into methane for fuel and fertilizer.",
            "benefits": ["Waste reduction", "Energy production", "Fertilizer byproduct"],
            "implementation": "Particularly valuable for agricultural operations with organic waste."
        }
    },
    "water": {
        "rainwater_harvesting": {
            "description": "Collecting and storing rainwater for later use.",
            "benefits": ["Reduced water bills", "Flood mitigation", "Self-sufficiency"],
            "implementation": "Simple systems can be DIY; larger systems may require professionals."
        },
        "drip_irrigation": {
            "description": "Water-efficient method delivering water directly to plant roots.",
            "benefits": ["Water savings up to 70%", "Reduced runoff", "Fewer weeds"],
            "implementation": "Initial setup cost but significant water savings over time."
        },
        "greywater_systems": {
            "description": "Reusing household wastewater for irrigation and other purposes.",
            "benefits": ["Water conservation", "Reduced strain on sewage systems"],
            "implementation": "Requires plumbing modifications but offers significant water savings."
        }
    },
    "waste": {
        "composting": {
            "description": "Controlled decomposition of organic matter into valuable soil amendment.",
            "benefits": ["Waste reduction", "Soil improvement", "Carbon sequestration"],
            "implementation": "Can be implemented at scales from household to industrial."
        },
        "anaerobic_digestion": {
            "description": "Breaking down organic matter without oxygen to produce biogas.",
            "benefits": ["Energy production", "Waste management", "Fertilizer byproduct"],
            "implementation": "Suitable for farms, food processing facilities, and municipalities."
        }
    }
}

# personalize responses
USER_PROFILES = {
    "default": {
        "knowledge_level": "general",
        "interests": ["general sustainability"],
        "implementation_scale": "individual"
    }
}

# session tracking
class Session:
    def __init__(self):
        self.conversation_history = []
        self.user_profile = USER_PROFILES["default"].copy()
        self.topics_discussed = set()
        self.recommendations_made = []
        self.session_start = datetime.now()
    
    def add_interaction(self, user_input: str, bot_response: str):
        self.conversation_history.append({"user": user_input, "bot": bot_response})
    
    def update_profile(self, key: str, value):
        self.user_profile[key] = value
    
    def add_topic(self, topic: str):
        self.topics_discussed.add(topic)
    
    def add_recommendation(self, recommendation: str):
        self.recommendations_made.append(recommendation)


SYSTEM_PROMPT = """
You are the Environmental Advice Chatbot, an advanced assistant specializing in sustainable agriculture and environmental solutions. 
Your mission is to provide practical, scientifically accurate advice on making agriculture and environmental 
practices more sustainable and efficient.

Key capabilities:
1. Provide detailed, actionable advice on sustainable farming, water conservation, renewable energy, 
   and waste management
2. Tailor recommendations based on the user's specific context (small garden, commercial farm, etc.)
3. Explain environmental concepts clearly with practical examples
4. Offer both high-tech and low-tech solutions appropriate to the user's resources
5. Cite specific efficiency improvements (e.g., "can reduce water usage by approximately 60%")
6. Suggest step-by-step implementation plans for sustainability initiatives
7. Provide approximate cost ranges and ROI timelines for recommended technologies

Always maintain a positive, solution-oriented approach, acknowledging challenges while focusing on 
practical possibilities. Use conversational, accessible language but don't oversimplify complex concepts.
"""

def analyze_user_input(user_input: str, session: Session) -> Dict:
    """
    Analyze user input to understand intent, extract key topics, and determine user needs.
    """
    input_lower = user_input.lower()
    
    
    intent = "general_query"
    if any(word in input_lower for word in ["how", "implement", "start", "build", "create"]):
        intent = "implementation_query"
    elif any(word in input_lower for word in ["why", "benefit", "advantage", "better"]):
        intent = "benefits_query"
    elif any(word in input_lower for word in ["cost", "price", "expensive", "cheap", "afford"]):
        intent = "cost_query"
    
    
    topics = []
    if any(word in input_lower for word in ["farm", "crop", "soil", "plant", "grow", "agriculture"]):
        topics.append("agriculture")
    if any(word in input_lower for word in ["water", "irrigation", "rain", "drought", "river", "lake"]):
        topics.append("water")
    if any(word in input_lower for word in ["energy", "solar", "wind", "power", "electricity"]):
        topics.append("energy")
    if any(word in input_lower for word in ["waste", "compost", "recycle", "trash", "garbage"]):
        topics.append("waste")
    
    
    scale = session.user_profile["implementation_scale"]
    if any(word in input_lower for word in ["home", "house", "garden", "backyard", "personal"]):
        scale = "individual"
    elif any(word in input_lower for word in ["farm", "business", "company", "commercial"]):
        scale = "commercial"
    elif any(word in input_lower for word in ["community", "neighborhood", "local", "town", "city"]):
        scale = "community"
    
    
    session.update_profile("implementation_scale", scale)
    for topic in topics:
        session.add_topic(topic)
    
    return {
        "intent": intent,
        "topics": topics if topics else ["general sustainability"],
        "scale": scale
    }

def get_relevant_knowledge(analysis: Dict) -> List[Dict]:
    """
    Retrieve relevant information from the knowledge base based on user query analysis.
    """
    relevant_info = []
    
    for topic in analysis["topics"]:
        if topic in SUSTAINABILITY_DATABASE:
            for solution_name, solution_data in SUSTAINABILITY_DATABASE[topic].items():
                relevant_info.append({
                    "solution": solution_name,
                    "category": topic,
                    "data": solution_data
                })
    
    
    if not relevant_info:
        for category, solutions in SUSTAINABILITY_DATABASE.items():
            first_solution = next(iter(solutions.items()))
            relevant_info.append({
                "solution": first_solution[0],
                "category": category,
                "data": first_solution[1]
            })
    
    return relevant_info

def format_context_for_ai(analysis: Dict, knowledge: List[Dict], session: Session) -> str:
    """
    Format the context, knowledge, and session information for the AI prompt.
    """
    context = f"User intent: {analysis['intent']}\n"
    context += f"Topics of interest: {', '.join(analysis['topics'])}\n"
    context += f"Implementation scale: {analysis['scale']}\n\n"
    
    context += "Relevant sustainable solutions:\n"
    for item in knowledge:
        context += f"- {item['solution'].replace('_', ' ').title()} ({item['category']}): "
        context += f"{item['data']['description']} Benefits include {', '.join(item['data']['benefits'][:3])}.\n"
    
    context += "\nConversation history summary:\n"
    # only uses last 3 responses, change if you want all
    recent_history = session.conversation_history[-3:] if session.conversation_history else []
    for exchange in recent_history:
        context += f"User: {exchange['user']}\Environmental Advice Chatbot: {exchange['bot']}\n"
    
    return context

def get_enhanced_response(user_input: str, session: Session) -> str:
    """
    Generate a comprehensive, helpful response using the Gemini Pro API.
    """
    analysis = analyze_user_input(user_input, session)
    knowledge = get_relevant_knowledge(analysis)
    context = format_context_for_ai(analysis, knowledge, session)
    
    try:
        # Create chat session with system prompt
        chat = model.start_chat(history=[])
        system_message = SYSTEM_PROMPT
        
        # Send context and user input
        prompt = f"Context information:\n{context}\n\nUser message: {user_input}"
        response = chat.send_message(system_message + "\n\n" + prompt)
        
        ai_response = response.text.strip()
        
        # Add follow-up prompt if response is too short
        if len(ai_response) < 50 and not user_input.endswith("?"):
            ai_response += " Would you like more detailed information on this topic or suggestions for implementation?"
        
        # Track recommendations
        for solution in knowledge:
            solution_name = solution["solution"].replace("_", " ")
            if solution_name in ai_response.lower():
                session.add_recommendation(solution_name)
        
        return ai_response
    
    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        return "I'm having trouble providing information at the moment. Could you please try again or rephrase your question?"

def get_welcome_message() -> str:
    """Generate a welcoming initial message."""
    return """Welcome to the Environmental Advice Chatbot! 🌱🌍

I'm your assistant for sustainable agriculture and environmental solutions. I can help with:
- Sustainable farming practices and technologies
- Water conservation methods
- Renewable energy implementation
- Waste management and circular economy approaches

Whether you're working with a small garden, community project, or commercial operation, I can provide tailored advice to make your environmental efforts more sustainable and efficient.

How can I help you today?"""

def environmental_chatbot():
    """Main chatbot function with improved handling and session management."""
    session = Session()
    print(get_welcome_message())
    
    while True:
        try:
            user_input = input("\nYou: ").strip()
            
            if user_input.lower() in ['exit', 'quit', 'bye']:
                print("\Environmental Advice Chatbot: Thank you for chatting about sustainability! Remember, every small action contributes to a healthier planet. Goodbye! 🌱")
                break
            
            if not user_input:
                print("\nEnvironmental Advice Chatbot: I'm here to help with environmental and agricultural sustainability. Feel free to ask a question!")
                continue
            
            #
            response = get_enhanced_response(user_input, session)
            print(f"\nEnvironmental Advice Chatbot: {response}")
            
            
            session.add_interaction(user_input, response)
            
        except KeyboardInterrupt:
            print("\n\nEnvironmental Advice Chatbot: Session ended. Thank you for your interest in sustainability!")
            break
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            print("\nEnvironmental Advice Chatbot: I apologize for the technical issue. Let's continue our conversation.")

if __name__ == "__main__":
    try:
        environmental_chatbot()
    except Exception as e:
        logger.critical(f"Critical error in main execution: {str(e)}")
        print("An unexpected error occurred. Please check the logs for details.")