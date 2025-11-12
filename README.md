# LinkedIn AI Assistant - Multi-Agent Profile Optimization System

A comprehensive AI-powered LinkedIn profile optimization tool built with **LangGraph**, **FastAPI**, and **Next.js**. This system uses a multi-agent architecture to analyze profiles, generate content improvements, match job roles, and provide career guidance.

![System Architecture](https://img.shields.io/badge/Architecture-Multi--Agent-blue) ![Backend](https://img.shields.io/badge/Backend-FastAPI-green) ![Frontend](https://img.shields.io/badge/Frontend-Next.js-black) ![AI](https://img.shields.io/badge/AI-LangGraph%20%2B%20GPT--4-purple)

---

## 🌟 Features

### 1. **Interactive Chat Interface**

- Clean, modern UI with real-time conversation
- LinkedIn profile URL input with automatic scraping
- Session-based memory for continuous conversations
- Context-aware responses

### 2. **Multi-Agent System** (LangGraph)

The system consists of specialized agents that work together:

#### **Router Agent**

- Analyzes user intent from messages
- Routes requests to appropriate specialized agents
- Handles conversation flow

#### **Profile Analyzer Agent**

- Evaluates LinkedIn profile sections (About, Experience, Skills, Education)
- Identifies gaps and missing information
- Checks for inconsistencies
- Provides completeness score (1-10)
- Generates actionable recommendations

#### **Content Generator Agent**

- Rewrites profile sections with best practices
- Uses strong action verbs and quantifiable achievements
- Optimizes for ATS (Applicant Tracking Systems)
- Aligns content with target roles
- Includes relevant industry keywords

#### **Job Matcher Agent**

- Generates industry-standard job descriptions
- Compares profile against job requirements
- Calculates match score (0-100)
- Identifies specific skill and experience gaps
- Suggests concrete improvements

#### **Career Counselor Agent**

- Recommends learning resources (courses, certifications)
- Suggests career progression paths
- Identifies transferable skills
- Provides acquisition timelines
- Offers networking strategies

### 3. **Memory System**

- **Session-based memory**: Maintains context within conversations using LangGraph's MemorySaver
- **Persistent storage**: Profile data stored per session
- **Conversation history**: Retrievable chat history for each session
- **Cross-message context**: Agents remember previous interactions

### 4. **LinkedIn Profile Scraping**

- Uses Apify's LinkedIn scraper (free credits available)
- Extracts comprehensive profile data
- Handles authentication via cookies
- Supports profile URLs in various formats

---

## 🚀 Getting Started

### Prerequisites

- **Python**
- **Node.js**
- **OpenAI API Key**
- **Apify API Token** (already in code available)

### Backend Setup

1. **Navigate to backend directory**:

```bash
cd backend
```

2. **Create and activate virtual environment**:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:

```bash
pip install -r requirements.txt
```

4. **Create `.env` file** in the backend directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

5. **Run the backend server**:

```bash
uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:

```bash
cd frontend
```

2. **Install dependencies**:

```bash
npm install
```

3. **Run the development server**:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

---

## 📚 API Documentation

### Endpoints

#### `GET /`

Health check endpoint

```json
{
  "message": "LinkedIn AI Assistant API Running",
  "version": "2.0",
  "features": [...]
}
```

#### `POST /analyze-profile`

Scrape and analyze a LinkedIn profile in one step

**Request**:

```json
{
  "profile_url": "https://www.linkedin.com/in/username"
}
```

**Response**:

```json
{
  "success": true,
  "session_id": "abc123...",
  "profile_data": {...},
  "analysis": "Detailed analysis text..."
}
```

#### `POST /chat`

Interactive chat with the multi-agent system

**Request**:

```json
{
  "message": "How can I improve my about section?",
  "session_id": "abc123",
  "target_role": "Senior Software Engineer" // optional
}
```

**Response**:

```json
{
  "response": "Assistant's response...",
  "session_id": "abc123"
}
```

#### `POST /scrape-linkedin`

Scrape LinkedIn profile data only

**Request**:

```json
{
  "profile_url": "https://www.linkedin.com/in/username"
}
```

#### `GET /conversation-history/{session_id}`

Retrieve conversation history

**Response**:

```json
{
  "session_id": "abc123",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

#### `DELETE /session/{session_id}`

Clear session data

---

## 🧠 How the Multi-Agent System Works

### 1. **State Management**

The system uses a `AgentState` TypedDict that flows between agents:

```python
class AgentState(TypedDict):
    messages: list           # Chat history
    profile_data: dict       # LinkedIn profile
    analysis_result: dict    # Analysis results
    target_role: str        # Target job role
    job_match_score: float  # Match score
    content_suggestions: dict
    skill_gaps: list
    next_action: str        # Routing decision
```

### 2. **Agent Workflow**

```
User Message
     ↓
Router Agent (decides intent)
     ↓
[Profile Analyzer | Content Generator | Job Matcher | Career Counselor]
     ↓
Respond Agent (formats response)
     ↓
User receives conversational response
```

### 3. **Memory Persistence**

LangGraph's `MemorySaver` checkpointer maintains state across interactions:

```python
self.memory = MemorySaver()
self.graph = workflow.compile(checkpointer=self.memory)
```

Each session gets a unique thread_id for isolated conversations:

```python
config = {"configurable": {"thread_id": session_id}}
result = self.graph.invoke(state, config)
```

### 4. **Conditional Routing**

The router agent analyzes user intent and routes to appropriate specialists:

- **"analyze my profile"** → Profile Analyzer
- **"improve my about section"** → Content Generator
- **"job fit for Software Engineer"** → Job Matcher
- **"what skills should I learn"** → Career Counselor

---

## 💡 Usage Examples

### Example 1: Initial Profile Analysis

**User Input**:

```
https://www.linkedin.com/in/johndoe
```

**System Response**:

```
I've analyzed your LinkedIn profile! Here's what I found:

✅ Strengths:
- Strong experience in software development (8+ years)
- Good variety of technical skills listed
- Clear job progression shown

⚠️ Areas for Improvement:
1. About section is too brief (only 2 sentences)
2. Missing quantifiable achievements in experience descriptions
3. No recommendations or endorsements visible
4. Education section incomplete

Overall Profile Score: 6.5/10

Would you like me to help enhance any specific section?
```

### Example 2: Content Enhancement

**User Input**:

```
Can you rewrite my about section to be more compelling?
```

**System Response**:

```
I'd be happy to enhance your About section! Here's an improved version:

📝 Enhanced About Section:

"Passionate Full-Stack Developer with 8+ years of experience building
scalable web applications that serve millions of users. Specialized in
React, Node.js, and cloud architecture (AWS/GCP).

💡 Key Achievements:
• Led development of e-commerce platform increasing revenue by 150%
• Reduced application load time by 60% through performance optimization
• Mentored 15+ junior developers, fostering a collaborative team culture

🎯 I thrive on solving complex technical challenges and transforming
innovative ideas into robust, user-centric solutions. Currently exploring
AI/ML integration in web applications.

Let's connect if you're interested in web development, cloud architecture,
or just want to chat about tech!"

This version is more engaging, includes quantifiable achievements, and
shows personality while remaining professional.
```

### Example 3: Job Fit Analysis

**User Input**:

```
How well do I match for a Senior Software Engineer role?
```

**System Response**:

```
Let me analyze your fit for a Senior Software Engineer position...

🎯 Match Score: 78/100

📊 Matching Elements:
✅ 8+ years experience (requirement: 5+)
✅ Strong proficiency in React, Node.js
✅ Experience with cloud platforms (AWS)
✅ Team leadership experience

❌ Gap Areas:
1. Limited system design experience mentioned
2. No CI/CD pipeline experience shown
3. Missing container orchestration (Kubernetes)
4. No mention of microservices architecture

💡 Improvement Suggestions:

1. Add System Design Projects:
   - Document architectural decisions you've made
   - Include scalability considerations

2. Highlight DevOps Experience:
   - Add any CI/CD tools you've used (Jenkins, GitLab, GitHub Actions)
   - Mention deployment automation

3. Kubernetes & Docker:
   - If you have experience, emphasize it
   - If not, consider adding these to your skillset

4. Microservices:
   - Detail any distributed systems work
   - Explain service decomposition experience

Would you like specific resources to fill these gaps?
```

### Example 4: Career Guidance

**User Input**:

```
What skills should I learn to advance my career?
```

**System Response**:

```
Based on your profile and industry trends, here's a personalized learning path:

🎓 Priority Skills (Next 3-6 months):

1. **System Design & Architecture**
   📚 Resources:
   - "Designing Data-Intensive Applications" by Martin Kleppmann
   - Course: "Grokking System Design" (Educative.io)
   - YouTube: System Design Primer series

2. **Kubernetes & Container Orchestration**
   📚 Resources:
   - Certified Kubernetes Administrator (CKA) certification
   - Course: "Kubernetes for Developers" (Udemy)
   - Practice: Set up a personal k8s cluster

3. **Advanced Cloud Architecture**
   📚 Resources:
   - AWS Solutions Architect Professional certification
   - Course: "Cloud Architecture Patterns" (Pluralsight)

📅 Timeline:
- Months 1-2: System Design fundamentals
- Months 3-4: Kubernetes hands-on practice
- Months 5-6: Cloud architecture certification

🚀 Career Progression Path:
Current: Software Engineer III
  ↓ (1-2 years)
Senior Software Engineer
  ↓ (2-3 years)
Staff Engineer / Engineering Manager

🤝 Networking Tips:
- Join local Kubernetes meetups
- Contribute to open-source cloud-native projects
- Attend AWS re:Invent or KubeCon conferences
- Share learnings on Medium or dev.to

Would you like detailed study plans for any of these topics?
```

---

## 🔧 Technical Details

### LangGraph Integration

The system uses LangGraph's StateGraph to orchestrate agents:

```python
workflow = StateGraph(AgentState)

# Add specialized agent nodes
workflow.add_node("router", self._router_agent)
workflow.add_node("profile_analyzer", self._profile_analyzer_agent)
workflow.add_node("content_generator", self._content_generator_agent)
workflow.add_node("job_matcher", self._job_matcher_agent)
workflow.add_node("career_counselor", self._career_counselor_agent)
workflow.add_node("respond", self._respond_agent)

# Set up routing logic
workflow.add_conditional_edges(
    "router",
    self._route_decision,
    {
        "profile_analyzer": "profile_analyzer",
        "content_generator": "content_generator",
        "job_matcher": "job_matcher",
        "career_counselor": "career_counselor",
    }
)

# Compile with memory checkpointer
self.graph = workflow.compile(checkpointer=self.memory)
```

### Memory Management

**MemorySaver** provides automatic checkpointing:

- State is saved after each agent execution
- Retrievable using session thread_id
- Enables conversation context retention
- Supports branching conversations

```python
# Invoke with session config
config = {"configurable": {"thread_id": session_id}}
result = self.graph.invoke(state, config)

# Retrieve previous state
current_state = self.graph.get_state(config)
```

### OpenAI Integration

Uses `langchain-openai` for structured LLM interactions:

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

llm = ChatOpenAI(model="gpt-4o", temperature=0.7)

messages = [
    SystemMessage(content="You are an expert..."),
    HumanMessage(content="Analyze this profile...")
]

response = llm.invoke(messages)
```

---

## 🎯 Key Concepts Explained

### 1. **Multi-Agent Architecture**

Instead of one monolithic AI system, we use specialized agents:

**Benefits**:

- **Separation of Concerns**: Each agent has a focused responsibility
- **Maintainability**: Easy to update or replace individual agents
- **Scalability**: Can add new agents without affecting existing ones
- **Quality**: Specialized prompts lead to better outputs

### 2. **LangGraph vs LangChain**

**LangChain**: Linear chains of LLM calls

```
Input → Prompt → LLM → Output
```

**LangGraph**: Complex workflows with conditional logic

```
Input → Router → [Agent A | Agent B | Agent C] → Combiner → Output
```

LangGraph provides:

- State management across steps
- Conditional branching
- Cyclic workflows (agents can call each other)
- Built-in memory/checkpointing

### 3. **Session-Based Memory**

Each user conversation gets a unique session ID:

```python
session_id = hashlib.md5(profile_url.encode()).hexdigest()
```

This enables:

- **Context retention**: Assistant remembers previous messages
- **Profile persistence**: No need to re-upload profile data
- **Multi-turn conversations**: Natural back-and-forth dialog
- **Session isolation**: Different users don't interfere

### 4. **Agent Prompting Strategy**

Each agent has carefully crafted system prompts:

**Profile Analyzer**:

- Structured evaluation criteria
- Completeness scoring
- Gap identification
- Actionable recommendations

**Content Generator**:

- Action verb emphasis
- Quantification focus
- ATS optimization
- Industry alignment

**Job Matcher**:

- Standard JD generation
- Requirement mapping
- Score calculation
- Gap analysis

**Career Counselor**:

- Personalized resources
- Timeline planning
- Progression mapping
- Networking strategy

---

## 📦 Project Structure

```
learntube-assignment/
├── backend/
│   ├── venv/                  # Python virtual environment
│   ├── main.py               # FastAPI application & API endpoints
│   ├── agents.py             # Multi-agent system (LangGraph)
│   ├── scraper.py            # LinkedIn scraping logic (Apify)
│   ├── prompts.py            # Agent prompt templates
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment variables (not in git)
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx          # Main chat interface
│   │   ├── layout.tsx        # App layout
│   │   └── globals.css       # Global styles
│   ├── package.json          # Node dependencies
│   ├── tsconfig.json         # TypeScript config
│   └── next.config.ts        # Next.js config
│
└── README.md                 # This file
```

---