// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://linkedin-ai-assistant-9wr9.onrender.com';

export const API_ENDPOINTS = {
  analyzeProfile: `${API_URL}/analyze-profile`,
  chat: `${API_URL}/chat`,
  jobFitAnalysis: `${API_URL}/job-fit-analysis`,
  contentEnhancement: `${API_URL}/content-enhancement`,
  careerGuidance: `${API_URL}/career-guidance`,
};

