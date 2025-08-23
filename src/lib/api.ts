/**
 * Client-side API functions for calling server-side Gemini proxy endpoints.
 * These functions replace direct Gemini API calls to keep API keys secure on the server.
 */

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export interface ScoringResult {
  overallScore: number;
  criteriaScores: Record<string, number>;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface GenerationResult {
  content?: string;
  answers?: Array<{
    accomplishment: string;
    because: string;
    therefore: string;
    fullAnswer: string;
  }>;
  strengths?: string[];
  improvements?: string[];
  suggestions?: string[];
  alternatives?: string[];
  [key: string]: any;
}

// Base API configuration
const API_BASE = '/api/gemini';

/**
 * Score interview response content using server-side Gemini API
 * @param content - The content to score
 * @param criteria - Optional scoring criteria (uses defaults if not provided)
 * @returns Promise with scoring results
 */
export async function scoreContent(
  content: string,
  criteria?: string[]
): Promise<ApiResponse<ScoringResult>> {
  try {
    const response = await fetch(`${API_BASE}/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        criteria,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP ${response.status}: ${response.statusText}`,
        details: result.details,
      };
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to score content',
    };
  }
}

/**
 * Generate content using server-side Gemini API
 * @param prompt - The prompt for content generation
 * @param type - Type of content to generate (interview-questions, sample-answers, feedback, etc.)
 * @param context - Optional context for the generation
 * @returns Promise with generated content
 */
export async function generateContent(
  prompt: string,
  type?: 'interview-questions' | 'sample-answers' | 'feedback' | 'practice-scenarios' | 'general',
  context?: string
): Promise<ApiResponse<GenerationResult>> {
  try {
    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        type,
        context,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP ${response.status}: ${response.statusText}`,
        details: result.details,
      };
    }

    return result;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate content',
    };
  }
}

/**
 * Generate interview questions based on context
 * @param prompt - Description of the role/context for questions
 * @param context - Additional context (optional)
 * @returns Promise with generated questions
 */
export async function generateInterviewQuestions(
  prompt: string,
  context?: string
): Promise<ApiResponse<string[]>> {
  const result = await generateContent(prompt, 'interview-questions', context);
  
  if (!result.success) {
    return result;
  }

  // Transform the result to return just the questions array
  return {
    ...result,
    data: Array.isArray(result.data) ? result.data : result.data?.content ? [result.data.content] : [],
  };
}

/**
 * Generate sample answers using ABT framework
 * @param question - The interview question to answer
 * @param context - Professional context (optional)
 * @returns Promise with ABT-structured answers
 */
export async function generateSampleAnswers(
  question: string,
  context?: string
): Promise<ApiResponse<GenerationResult>> {
  return generateContent(question, 'sample-answers', context);
}

/**
 * Get feedback on interview responses
 * @param response - The interview response to analyze
 * @param context - Interview context (optional)
 * @returns Promise with feedback and suggestions
 */
export async function getFeedback(
  response: string,
  context?: string
): Promise<ApiResponse<GenerationResult>> {
  return generateContent(response, 'feedback', context);
}

/**
 * Generate practice scenarios for interview preparation
 * @param prompt - Description of scenarios needed
 * @param context - Professional environment context (optional)
 * @returns Promise with practice scenarios
 */
export async function generatePracticeScenarios(
  prompt: string,
  context?: string
): Promise<ApiResponse<GenerationResult>> {
  return generateContent(prompt, 'practice-scenarios', context);
}

/**
 * Handle API errors gracefully with user-friendly messages
 * @param error - The error from API response
 * @returns User-friendly error message
 */
export function getErrorMessage(error: string | undefined): string {
  if (!error) return 'An unexpected error occurred';
  
  // Map common errors to user-friendly messages
  if (error.includes('Missing API key')) {
    return 'Service configuration error. Please try again later.';
  }
  
  if (error.includes('required')) {
    return 'Please provide all required information.';
  }
  
  if (error.includes('Failed to')) {
    return 'Unable to process your request. Please try again.';
  }
  
  if (error.includes('HTTP 429')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  if (error.includes('HTTP 500')) {
    return 'Server error. Please try again later.';
  }
  
  // Return the original error message if it's already user-friendly
  return error;
}
