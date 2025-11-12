from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
import hashlib
import dotenv
from scraper import scrape_linkedin_profile
from agents import LinkedInAgentSystem

dotenv.load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
app = FastAPI(title="LinkedIn AI Assistant API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the agent system
agent_system = LinkedInAgentSystem(openai_api_key=OPENAI_API_KEY)

# In-memory storage for profile data (in production, use a database)
profile_storage = {}


@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "message": "LinkedIn AI Assistant API Running",
        "version": "2.0",
        "features": [
            "Profile Analysis",
            "Content Enhancement",
            "Job Fit Analysis",
            "Career Counseling",
            "Multi-Agent AI System",
            "Persistent Memory"
        ]
    }


@app.post("/scrape-linkedin")
def scrape_linkedin(profile_url: str = Body(..., embed=True)):
    """
    Scrape LinkedIn profile data
    
    This endpoint uses Apify's LinkedIn scraper to extract profile information.
    The scraped data is stored in memory and associated with a session.
    """
    try:
        profile_data = scrape_linkedin_profile(profile_url)
        
        if not profile_data or len(profile_data) == 0:
            raise HTTPException(
                status_code=404, 
                detail="Could not scrape profile. Please check the URL and try again."
            )
        
        return {
            "success": True,
            "message": "Profile scraped successfully",
            "profile_data": profile_data[0] if len(profile_data) > 0 else profile_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
async def chat(
    message: str = Body(...),
    session_id: str = Body("default"),
    target_role: Optional[str] = Body(None)
):
    """
    Interactive chat endpoint with multi-agent system
    
    This endpoint processes user messages through a multi-agent system that:
    - Analyzes LinkedIn profiles
    - Generates content improvements
    - Matches profiles with job roles
    - Provides career counseling
    
    The system maintains conversation context across messages using session_id.
    """
    try:
        profile_data = profile_storage.get(session_id)
        
        response = agent_system.chat(
            message=message,
            profile_data=profile_data,
            session_id=session_id,
            target_role=target_role
        )
        
        return {
            "response": response,
            "session_id": session_id
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing chat: {str(e)}"
        )


@app.post("/analyze-profile")
async def analyze_profile(profile_url: str = Body(..., embed=True)):
    """
    Combined endpoint: scrape LinkedIn profile and start analysis
    
    This convenience endpoint scrapes a profile and immediately provides
    an initial analysis through the agent system.
    """
    try:
        profile_data = scrape_linkedin_profile(profile_url)
        
        if not profile_data or len(profile_data) == 0:
            raise HTTPException(
                status_code=404, 
                detail="Could not scrape profile"
            )
        
        profile = profile_data[0] if isinstance(profile_data, list) else profile_data
        session_id = hashlib.md5(profile_url.encode()).hexdigest()
        
        profile_storage[session_id] = profile
        
        initial_message = "Please analyze my LinkedIn profile and provide an overview of its strengths and areas for improvement."
        
        response = agent_system.chat(
            message=initial_message,
            profile_data=profile,
            session_id=session_id
        )
        
        return {
            "success": True,
            "session_id": session_id,
            "profile_data": profile,
            "analysis": response
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error analyzing profile: {str(e)}"
        )


@app.get("/conversation-history/{session_id}")
async def get_conversation_history(session_id: str):
    """
    Retrieve conversation history for a session
    
    Returns all messages exchanged in a particular session.
    """
    try:
        history = agent_system.get_conversation_history(session_id)
        return {
            "session_id": session_id,
            "history": history
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving history: {str(e)}"
        )


@app.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """
    Clear conversation history and profile data for a session
    """
    try:
        agent_system.clear_session(session_id)
        if session_id in profile_storage:
            del profile_storage[session_id]
        
        return {
            "success": True,
            "message": f"Session {session_id} cleared"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error clearing session: {str(e)}"
        )
