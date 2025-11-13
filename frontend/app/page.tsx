'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ProfileData {
  firstName?: string;
  lastName?: string;
  headline?: string;
  summary?: string;
  pictureUrl?: string;
  coverImageUrl?: string;
  jobTitle?: string;
  companyName?: string;
  positions?: Array<{
    title: string;
    company: { name: string; logo?: string };
    timePeriod: { startDate?: { month?: number; year?: number }; endDate?: { month?: number; year?: number } };
    description?: string;
  }>;
  educations?: Array<{
    schoolName: string;
    degreeName?: string;
    fieldOfStudy?: string;
  }>;
  geoLocationName?: string;
  followerCount?: number;
  connectionsCount?: number;
  creatorInfo?: {
    hashTags?: string[];
    website?: string;
  };
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
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileUrl, setProfileUrl] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (profileData) {
      // Scroll to show profile card when it's loaded
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [profileData]);

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
        const response = await fetch('https://a0f95757cae2.ngrok-free.app/analyze-profile', {
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
        setProfileUrl(userInput);
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
          content: '\n\n✅ Profile analysis complete! Use the feature buttons below to explore more options.',
        };
        setMessages((prev) => [...prev, followUpMessage]);
        
      } else if (profileLoaded) {
        // Use the chat endpoint for follow-up questions
        const response = await fetch('https://a0f95757cae2.ngrok-free.app/chat', {
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

  const handleJobFitAnalysis = async () => {
    if (!profileUrl || !targetRole.trim()) {
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Please enter a target job role in the input field (e.g., "Senior Software Engineer") and click "Analyze Job Fit" again.',
      };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    setIsLoading(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Analyze my job fit for: ${targetRole}`,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('https://a0f95757cae2.ngrok-free.app/job-fit-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_url: profileUrl,
          target_role: targetRole.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze job fit');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.analysis,
      };
      setMessages((prev) => [...prev, assistantMessage]);
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

  const handleContentEnhancement = async () => {
    setIsLoading(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: 'Generate enhanced versions of my profile sections',
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('https://a0f95757cae2.ngrok-free.app/content-enhancement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_url: profileUrl,
          target_role: targetRole.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate enhanced content');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.enhanced_content,
      };
      setMessages((prev) => [...prev, assistantMessage]);
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

  const handleCareerGuidance = async () => {
    setIsLoading(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: 'Provide career guidance and skill gap analysis',
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch('https://a0f95757cae2.ngrok-free.app/career-guidance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_url: profileUrl,
          target_role: targetRole.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get career guidance');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.guidance,
      };
      setMessages((prev) => [...prev, assistantMessage]);
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
          {/* Profile Card */}
          {profileData && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Cover Image */}
              {profileData.coverImageUrl && (
                <div className="relative h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
                  <img 
                    src={profileData.coverImageUrl} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="p-6">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {/* Profile Picture */}
                  {profileData.pictureUrl && (
                    <div className="relative -mt-16 sm:-mt-20">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-200">
                        <img 
                          src={profileData.pictureUrl} 
                          alt={`${profileData.firstName} ${profileData.lastName}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gray"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Name and Title */}
                  <div className="flex-1 mt-4 sm:mt-0">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      {profileData.firstName} {profileData.lastName}
                    </h2>
                    {profileData.headline && (
                      <p className="text-lg text-gray-700 mb-2">{profileData.headline}</p>
                    )}
                    {(profileData.jobTitle || profileData.companyName) && (
                      <p className="text-gray-600 mb-2">
                        {profileData.jobTitle}
                        {profileData.jobTitle && profileData.companyName && ' at '}
                        {profileData.companyName && (
                          <span className="font-semibold">{profileData.companyName}</span>
                        )}
                      </p>
                    )}
                    {profileData.geoLocationName && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {profileData.geoLocationName}
                      </p>
                    )}
                    {(profileData.followerCount || profileData.connectionsCount) && (
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        {profileData.connectionsCount && (
                          <span className="font-medium">{profileData.connectionsCount.toLocaleString()} connections</span>
                        )}
                        {profileData.followerCount && (
                          <span className="font-medium">{profileData.followerCount.toLocaleString()} followers</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary */}
                {profileData.summary && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{profileData.summary}</p>
                  </div>
                )}

                {/* Hash Tags */}
                {profileData.creatorInfo?.hashTags && profileData.creatorInfo.hashTags.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Topics</h3>
                    <div className="flex flex-wrap gap-2">
                      {profileData.creatorInfo.hashTags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {profileData.positions && profileData.positions.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience</h3>
                    <div className="space-y-4">
                      {profileData.positions.map((position, idx) => (
                        <div key={idx} className="flex gap-4">
                          {position.company?.logo && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img 
                                src={position.company.logo} 
                                alt={position.company.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{position.title}</h4>
                            <p className="text-gray-700">{position.company?.name}</p>
                            {position.timePeriod && (
                              <p className="text-sm text-gray-500">
                                {position.timePeriod.startDate && 
                                  `${position.timePeriod.startDate.month ? 
                                    new Date(position.timePeriod.startDate.year || 0, (position.timePeriod.startDate.month || 1) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 
                                    position.timePeriod.startDate.year} - `}
                                {position.timePeriod.endDate ? 
                                  (position.timePeriod.endDate.month ? 
                                    new Date(position.timePeriod.endDate.year || 0, (position.timePeriod.endDate.month || 1) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 
                                    position.timePeriod.endDate.year) : 
                                  'Present'}
                              </p>
                            )}
                            {position.description && (
                              <p className="text-sm text-gray-600 mt-2">{position.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {profileData.educations && profileData.educations.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
                    <div className="space-y-3">
                      {profileData.educations.map((edu, idx) => (
                        <div key={idx}>
                          <h4 className="font-semibold text-gray-900">{edu.schoolName}</h4>
                          {(edu.degreeName || edu.fieldOfStudy) && (
                            <p className="text-gray-700">{edu.degreeName || edu.fieldOfStudy}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Feature Panel */}
          {profileLoaded && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <button
                  onClick={handleJobFitAnalysis}
                  disabled={isLoading}
                  className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Job Fit Analysis</h4>
                  <p className="text-sm text-gray-600 text-center">Match your profile with target roles</p>
                </button>

                <button
                  onClick={handleContentEnhancement}
                  disabled={isLoading}
                  className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Content Enhancement</h4>
                  <p className="text-sm text-gray-600 text-center">Rewrite sections with best practices</p>
                </button>

                <button
                  onClick={handleCareerGuidance}
                  disabled={isLoading}
                  className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Career Guidance</h4>
                  <p className="text-sm text-gray-600 text-center">Get skill gap analysis & learning paths</p>
                </button>
              </div>
              
              {/* Target Role Input */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Job Role (for Job Fit Analysis)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white text-gray-800"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleJobFitAnalysis}
                    disabled={isLoading || !targetRole.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    Analyze Job Fit
                  </button>
                </div>
              </div>
            </div>
          )}

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
