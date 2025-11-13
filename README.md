# LinkedIn AI Assistant

![System Architecture](https://img.shields.io/badge/Architecture-Multi--Agent-blue) ![Backend](https://img.shields.io/badge/Backend-FastAPI-green) ![Frontend](https://img.shields.io/badge/Frontend-Next.js-black) ![AI](https://img.shields.io/badge/AI-LangGraph%20%2B%20GPT--4-purple)

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

## 📁 Backend Architecture

The backend consists of four core modules:

- **`scraper.py`**: Handles LinkedIn profile scraping using Apify's API to extract comprehensive profile data from LinkedIn URLs
- **`prompts.py`**: Contains all the prompts used by the LLM agents for various tasks and interactions
- **`agents.py`**: Implements the multi-agent system with specialized agents including the Profile Analyzer, Job Matcher, Content Generator, and Career Counselor agents
- **`main.py`**: FastAPI application that provides REST API endpoints for profile scraping, chat interactions, profile analysis, job matching, content enhancement, and career guidance, with session management

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
