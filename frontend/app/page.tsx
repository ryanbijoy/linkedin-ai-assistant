'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! 👋 I\'m your LinkedIn AI Assistant powered by a multi-agent system. I can help you with:\n\n✨ Profile Analysis - Identify gaps and improvement areas\n📝 Content Enhancement - Rewrite sections with best practices\n🎯 Job Fit Analysis - Match your profile with target roles\n🚀 Career Guidance - Suggest learning paths and skills\n\nPlease enter a LinkedIn profile URL to get started!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Check if the input is a LinkedIn URL
      const linkedinUrlPattern = /(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?/;
      const isLinkedInUrl = linkedinUrlPattern.test(userInput);

      if (isLinkedInUrl && !profileLoaded) {
        // Call the analyze-profile endpoint (scrapes + analyzes)
        const response = await fetch('http://localhost:8000/analyze-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ profile_url: userInput }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze LinkedIn profile');
        }

        const data = await response.json();
        
        // Store session ID and profile data
        setSessionId(data.session_id);
        setProfileData(data.profile_data);
        setProfileLoaded(true);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.analysis,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Add a follow-up prompt
        const followUpMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: '\n\nWhat would you like to do next? You can ask me to:\n• Enhance specific sections of your profile\n• Check job fit for a specific role (e.g., "How well do I match for Senior Software Engineer?")\n• Get career guidance and skill recommendations\n• Provide detailed feedback on any section',
        };
        setMessages((prev) => [...prev, followUpMessage]);
        
      } else if (profileLoaded) {
        // Use the chat endpoint for follow-up questions
        const response = await fetch('http://localhost:8000/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userInput,
            session_id: sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response from AI');
        }

        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        
      } else {
        // Prompt user to enter a LinkedIn URL first
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Please enter a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username) to analyze a profile first.',
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99 102 241 / 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 bg-white/70 backdrop-blur-xl border-b border-indigo-100/50 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 transform hover:scale-105 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                LinkedIn AI Assistant
              </h1>
              <p className="text-sm text-gray-600 mt-1 font-medium">Analyze LinkedIn profiles with AI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-4 items-start animate-in fade-in slide-in-from-bottom-4 duration-500 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {message.role === 'assistant' && (
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-2xl px-6 py-4 shadow-xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-indigo-500/30'
                    : 'bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-100/50 shadow-gray-200/50'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none break-words leading-relaxed text-[15px]">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-3 mt-4 text-gray-900 first:mt-0" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-2 mt-4 text-gray-900 first:mt-0" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2 mt-3 text-gray-900 first:mt-0" {...props} />,
                        h4: ({node, ...props}) => <h4 className="text-base font-bold mb-1 mt-2 text-gray-900 first:mt-0" {...props} />,
                        p: ({node, ...props}) => <p className="mb-3 text-gray-800 leading-relaxed last:mb-0" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                        em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc mb-3 space-y-2 ml-4" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal mb-3 space-y-2 ml-4" {...props} />,
                        li: ({node, ...props}) => <li className="text-gray-800 leading-relaxed pl-1" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-400 pl-4 italic my-3 text-gray-700" {...props} />,
                        code: ({node, ...props}) => (
                          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-700" {...props} />
                        ),
                        pre: ({node, ...props}) => <pre className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-800 overflow-x-auto my-3" {...props} />,
                        hr: ({node, ...props}) => <hr className="my-4 border-gray-300" {...props} />,
                        a: ({node, ...props}) => <a className="text-indigo-600 hover:text-indigo-800 underline" {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap break-words leading-relaxed text-[15px] font-medium">
                    {message.content}
                  </p>
                )}
              </div>
              {message.role === 'user' && (
                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 justify-start items-start animate-in fade-in">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl border border-gray-100/50">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2.5 h-2.5 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Container */}
      <div className="relative z-10 bg-white/70 backdrop-blur-xl border-t border-indigo-100/50 shadow-2xl">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="mb-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              {profileLoaded ? 'Ask me anything about your profile' : 'Enter your LinkedIn URL'}
            </label>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={profileLoaded ? "e.g., How can I improve my about section?" : "https://www.linkedin.com/in/username"}
                  className="w-full pl-14 pr-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-400 font-medium shadow-lg hover:shadow-xl hover:border-indigo-300"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 flex items-center gap-2 min-w-[120px] justify-center"
              >
                {isLoading ? (
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <span>Analyze</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
            <p className="text-xs text-gray-500 font-medium px-3">
              Example: <span className="text-indigo-600 font-semibold">linkedin.com/in/username</span>
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
