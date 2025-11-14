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
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache agent systems by API key to avoid recreating them
agent_systems_cache = {}
profile_storage = {}

def get_agent_system(api_key: Optional[str] = None) -> LinkedInAgentSystem:
    """Get or create an agent system for the given API key"""
    # Use provided API key or fall back to environment variable
    key = api_key or OPENAI_API_KEY
    
    if not key:
        raise HTTPException(
            status_code=400, 
            detail="API key is required. Please provide an OpenAI API key."
        )
    
    # Cache agent systems by API key
    if key not in agent_systems_cache:
        agent_systems_cache[key] = LinkedInAgentSystem(openai_api_key=key)
    
    return agent_systems_cache[key]

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "LinkedIn AI Assistant API is running",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/scrape-linkedin")
def scrape_linkedin(profile_url: str = Body(..., embed=True)):
    try:
        profile_data = scrape_linkedin_profile(profile_url)
        
        if not profile_data or len(profile_data) == 0:
            raise HTTPException(status_code=404, detail="Could not scrape profile. Please check the URL and try again.")
        
        return {"success": True, "message": "Profile scraped successfully", 
        "profile_data": profile_data[0] if len(profile_data) > 0 else profile_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
async def chat(
    message: str = Body(...),
    session_id: str = Body("default"),
    target_role: Optional[str] = Body(None),
    api_key: Optional[str] = Body(None)
):
    try:
        agent_system = get_agent_system(api_key)
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
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


@app.post("/analyze-profile")
async def analyze_profile(
    profile_url: str = Body(..., embed=True),
    api_key: Optional[str] = Body(None)
):
    try:
        agent_system = get_agent_system(api_key)
        
        #Scrapes the Linkedin profile data
        profile_data = scrape_linkedin_profile(profile_url)
        
        #If the profile data is not found, raise an error
        if not profile_data or len(profile_data) == 0:
            raise HTTPException(status_code=404, detail="Could not scrape profile")
        
        profile = profile_data[0] if isinstance(profile_data, list) else profile_data
        session_id = hashlib.md5(profile_url.encode()).hexdigest()
        profile_storage[session_id] = profile
        
        initial_message = "Please analyze my LinkedIn profile and provide an overview of its strengths and areas for improvement, Also identifying gaps and inconsistencies in the profile."
        
        response = agent_system.chat(message=initial_message, profile_data=profile, session_id=session_id)
        
        return {"success": True, "session_id": session_id, "profile_data": profile, "analysis": response}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing profile: {str(e)}")


@app.post("/job-fit-analysis")
async def job_fit_analysis(
    profile_url: str = Body(..., embed=True),
    target_role: str = Body(..., embed=True),
    api_key: Optional[str] = Body(None)
):
    """Analyze job fit by comparing profile with industry standard job description"""
    try:
        agent_system = get_agent_system(api_key)
        
        # Scrape profile if not already stored
        profile_data = scrape_linkedin_profile(profile_url)
        
        if not profile_data or len(profile_data) == 0:
            raise HTTPException(status_code=404, detail="Could not scrape profile")
        
        profile = profile_data[0] if isinstance(profile_data, list) else profile_data
        session_id = hashlib.md5(profile_url.encode()).hexdigest()
        profile_storage[session_id] = profile
        
        message = f"Analyze my job fit for the role: {target_role}. Generate an industry standard job description, compare my profile, calculate match score, and identify gaps."
        
        response = agent_system.chat(
            message=message,
            profile_data=profile,
            session_id=session_id,
            target_role=target_role
        )
        
        return {
            "success": True,
            "session_id": session_id,
            "target_role": target_role,
            "analysis": response
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing job fit: {str(e)}")


@app.post("/content-enhancement")
async def content_enhancement(
    profile_url: str = Body(..., embed=True),
    target_role: Optional[str] = Body(None, embed=True),
    api_key: Optional[str] = Body(None)
):
    """Generate enhanced versions of profile sections"""
    try:
        agent_system = get_agent_system(api_key)
        
        # Check if profile is already stored
        session_id = hashlib.md5(profile_url.encode()).hexdigest()
        profile = profile_storage.get(session_id)
        
        if not profile:
            profile_data = scrape_linkedin_profile(profile_url)
            if not profile_data or len(profile_data) == 0:
                raise HTTPException(status_code=404, detail="Could not scrape profile")
            profile = profile_data[0] if isinstance(profile_data, list) else profile_data
            profile_storage[session_id] = profile
        
        message = f"Generate enhanced, rewritten versions of my profile sections that align with industry best practices"
        if target_role:
            message += f" and are optimized for the role: {target_role}"
        
        response = agent_system.chat(
            message=message,
            profile_data=profile,
            session_id=session_id,
            target_role=target_role
        )
        
        return {
            "success": True,
            "session_id": session_id,
            "enhanced_content": response
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating content: {str(e)}")


@app.post("/career-guidance")
async def career_guidance(
    profile_url: str = Body(..., embed=True),
    target_role: Optional[str] = Body(None, embed=True),
    api_key: Optional[str] = Body(None)
):
    """Provide career counseling and skill gap analysis"""
    try:
        agent_system = get_agent_system(api_key)
        
        # Check if profile is already stored
        session_id = hashlib.md5(profile_url.encode()).hexdigest()
        profile = profile_storage.get(session_id)
        
        if not profile:
            profile_data = scrape_linkedin_profile(profile_url)
            if not profile_data or len(profile_data) == 0:
                raise HTTPException(status_code=404, detail="Could not scrape profile")
            profile = profile_data[0] if isinstance(profile_data, list) else profile_data
            profile_storage[session_id] = profile
        
        message = "Provide career counseling: identify missing skills needed for my target roles, suggest learning resources, recommend career paths, and provide skill acquisition timelines."
        if target_role:
            message += f" Focus on the role: {target_role}"
        
        response = agent_system.chat(
            message=message,
            profile_data=profile,
            session_id=session_id,
            target_role=target_role
        )
        
        return {
            "success": True,
            "session_id": session_id,
            "guidance": response
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error providing career guidance: {str(e)}")
