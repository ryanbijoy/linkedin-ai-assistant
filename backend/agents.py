from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
import json
from prompts import PROFILE_ANALYSIS_PROMPT, JOB_MATCH_PROMPT, CONTENT_GENERATION_PROMPT, CAREER_COUNSELOR_PROMPT


class AgentState(TypedDict):
    messages: list
    profile_data: dict
    analysis_result: dict
    target_role: str
    job_match_score: float
    content_suggestions: dict
    skill_gaps: list
    next_action: str


class LinkedInAgentSystem:
    def __init__(self, openai_api_key: str):
        self.llm = ChatOpenAI(
            model="gpt-4o",
            api_key=openai_api_key,
            temperature=0.7
        )
        self.memory = MemorySaver()
        self.graph = self._build_graph()
    
    def _build_graph(self):
        workflow = StateGraph(AgentState)
        
        workflow.add_node("router", self._router_agent)
        workflow.add_node("profile_analyzer", self._profile_analyzer_agent)
        workflow.add_node("content_generator", self._content_generator_agent)
        workflow.add_node("job_matcher", self._job_matcher_agent)
        workflow.add_node("career_counselor", self._career_counselor_agent)
        workflow.add_node("respond", self._respond_agent)
        
        workflow.set_entry_point("router")
        
        workflow.add_conditional_edges(
            "router",
            self._route_decision,
            {
                "profile_analyzer": "profile_analyzer",
                "content_generator": "content_generator",
                "job_matcher": "job_matcher",
                "career_counselor": "career_counselor",
                "respond": "respond"
            }
        )
        
        workflow.add_edge("profile_analyzer", "respond")
        workflow.add_edge("content_generator", "respond")
        workflow.add_edge("job_matcher", "respond")
        workflow.add_edge("career_counselor", "respond")
        
        workflow.add_conditional_edges(
            "respond",
            self._should_continue,
            {
                "router": "router",
                "end": END
            }
        )
        
        return workflow.compile(checkpointer=self.memory)
    
    def _router_agent(self, state: AgentState) -> AgentState:
        last_message = state["messages"][-1].content.lower() if state["messages"] else ""
        
        if ("analyze" in last_message or "profile" in last_message) and not state.get("analysis_result"):
            state["next_action"] = "profile_analyzer"
        elif any(word in last_message for word in ["improve", "enhance", "rewrite"]):
            state["next_action"] = "content_generator"
        elif any(word in last_message for word in ["job", "match", "role", "apply"]):
            state["next_action"] = "job_matcher"
        elif any(word in last_message for word in ["skill", "learn", "career", "path"]):
            state["next_action"] = "career_counselor"
        else:
            state["next_action"] = "respond"
        
        return state
    
    def _profile_analyzer_agent(self, state: AgentState) -> AgentState:
        profile_data = state.get("profile_data", {})
        
        if not profile_data:
            state["analysis_result"] = {"error": "No profile data available"}
            return state
        
        messages = [
            SystemMessage(content=PROFILE_ANALYSIS_PROMPT),
            HumanMessage(content=f"LinkedIn Profile Data:\n{json.dumps(profile_data, indent=2)}")
        ]
        
        response = self.llm.invoke(messages)
        try:
            analysis_result = json.loads(response.content)
        except json.JSONDecodeError:
            analysis_result = {"analysis": response.content, "raw_analysis": True}
        
        state["analysis_result"] = analysis_result
        return state
    
    def _content_generator_agent(self, state: AgentState) -> AgentState:
        profile_data = state.get("profile_data", {})
        target_role = state.get("target_role", "") or "General professional profile"
        
        messages = [
            SystemMessage(content=CONTENT_GENERATION_PROMPT),
            HumanMessage(content=f"Profile Data: {json.dumps(profile_data, indent=2)}\nTarget Role: {target_role}")
        ]
        
        response = self.llm.invoke(messages)
        
        try:
            content_suggestions = json.loads(response.content)
        except json.JSONDecodeError:
            content_suggestions = {"suggestions": response.content, "raw_content": True}
        
        state["content_suggestions"] = content_suggestions
        return state
    
    def _job_matcher_agent(self, state: AgentState) -> AgentState:
        profile_data = state.get("profile_data", {})
        target_role = state.get("target_role", "Software Engineer")
        
        messages = [
            SystemMessage(content=JOB_MATCH_PROMPT),
            HumanMessage(content=f"Profile: {json.dumps(profile_data, indent=2)}\nTarget Role: {target_role}")
        ]
        
        response = self.llm.invoke(messages)
        
        try:
            job_match_result = json.loads(response.content)
            state["job_match_score"] = job_match_result.get("match_score", 0)
            state["skill_gaps"] = job_match_result.get("gaps", [])
        except json.JSONDecodeError:
            job_match_result = {"analysis": response.content, "raw_analysis": True}
        
        state["analysis_result"] = job_match_result
        return state
    
    def _career_counselor_agent(self, state: AgentState) -> AgentState:
        profile_data = state.get("profile_data", {})
        skill_gaps = state.get("skill_gaps", [])
        target_role = state.get("target_role", "")
        
        messages = [
            SystemMessage(content=CAREER_COUNSELOR_PROMPT),
            HumanMessage(content=f"Profile: {json.dumps(profile_data, indent=2)}\nSkill Gaps: {json.dumps(skill_gaps)}\nTarget Role: {target_role}")
        ]
        
        response = self.llm.invoke(messages)
        
        try:
            counseling_result = json.loads(response.content)
        except json.JSONDecodeError:
            counseling_result = {"guidance": response.content, "raw_guidance": True}
        
        state["analysis_result"] = counseling_result
        return state
    
    def _respond_agent(self, state: AgentState) -> AgentState:
        analysis_result = state.get("analysis_result", {})
        content_suggestions = state.get("content_suggestions", {})
        
        system_prompt = """You are a friendly, professional LinkedIn career assistant.
Convert the technical analysis into a warm, conversational response.
Use natural language, be encouraging, and provide actionable next steps.
Keep responses focused and digestible - break complex info into clear sections."""
        
        context_parts = []
        if analysis_result:
            context_parts.append(f"Analysis Results: {json.dumps(analysis_result, indent=2)}")
        if content_suggestions:
            context_parts.append(f"Content Suggestions: {json.dumps(content_suggestions, indent=2)}")
        
        context = "\n\n".join(context_parts) if context_parts else "No analysis available yet."
        user_message = state["messages"][-1].content if state["messages"] else ""
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"User asked: {user_message}\n\nData to present:\n{context}")
        ]
        
        response = self.llm.invoke(messages)
        state["messages"].append(AIMessage(content=response.content))
        
        return state
    
    def _route_decision(self, state: AgentState) -> str:
        return state.get("next_action", "respond")
    
    def _should_continue(self, state: AgentState) -> str:
        return "end"
    
    def chat(self, message: str, profile_data: Optional[dict] = None, 
             session_id: str = "default", target_role: Optional[str] = None) -> str:
        config = {"configurable": {"thread_id": session_id}}
        
        try:
            current_state = self.graph.get_state(config)
            state = current_state.values if current_state else {}
        except Exception:
            state = {}
        
        if not state.get("messages"):
            state["messages"] = []
        
        state["messages"].append(HumanMessage(content=message))
        
        if profile_data:
            state["profile_data"] = profile_data
        
        if target_role:
            state["target_role"] = target_role
        
        result = self.graph.invoke(state, config)
        
        assistant_messages = [msg.content for msg in result["messages"] if isinstance(msg, AIMessage)]
        return assistant_messages[-1] if assistant_messages else "I'm sorry, I couldn't process that request."
    
    def get_conversation_history(self, session_id: str = "default") -> list:
        config = {"configurable": {"thread_id": session_id}}
        
        try:
            current_state = self.graph.get_state(config)
            if current_state and current_state.values.get("messages"):
                return [
                    {
                        "role": "user" if isinstance(msg, HumanMessage) else "assistant",
                        "content": msg.content
                    }
                    for msg in current_state.values["messages"]
                ]
        except Exception:
            pass
        
        return []
    
    def clear_session(self, session_id: str = "default"):
        pass

