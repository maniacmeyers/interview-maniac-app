// ABT Session Scoring using Google Gemini

import { generateStructuredContent } from './gemini';
import { ABT_SYSTEM_PROMPT, createAbtScoringPrompt, createImprovementPrompt, type AbtScoreResult } from './prompts/abtScoring';

// Extended ABT session data interface
interface AbtSessionData {
  role: string;
  industry: string;
  achievement: string;
  because: string;
  therefore: string;
}

// Extended result interface with additional metadata
export interface ScoringResult extends AbtScoreResult {
  sessionId?: string;
  timestamp: string;
  model: string;
  processingTime?: number;
}

// Validation helper to ensure all required fields are present
const validateAbtSession = (formData: AbtSessionData): void => {
  const required = ['role', 'industry', 'achievement', 'because', 'therefore'];
  const missing = required.filter(field => !formData[field as keyof AbtSessionData]?.trim());
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
};

// Calculate total and average scores
const calculateScores = (scores: AbtScoreResult['scores']): Pick<AbtScoreResult, 'totalScore' | 'averageScore'> => {
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const averageScore = Math.round((totalScore / 6) * 10) / 10; // Round to 1 decimal place
  
  return { totalScore, averageScore };
};

// Main scoring function
export const scoreAbtSession = async (
  formData: AbtSessionData,
  options: {
    model?: string;
    sessionId?: string;
    includeImprovements?: boolean;
  } = {}
): Promise<ScoringResult> => {
  const startTime = Date.now();
  const modelName = options.model || 'gemini-1.5-pro';
  
  try {
    // Validate input data
    validateAbtSession(formData);
    
    // Create the scoring prompt
    const userPrompt = createAbtScoringPrompt(formData);
    
    // Combine system and user prompts
    const fullPrompt = `${ABT_SYSTEM_PROMPT}\n\n${userPrompt}`;
    
    // Generate structured response from Gemini
    const geminiResult = await generateStructuredContent<AbtScoreResult>(
      fullPrompt,
      modelName
    );
    
    // Validate and recalculate scores to ensure consistency
    const recalculated = calculateScores(geminiResult.scores);
    
    // Prepare the final result
    const result: ScoringResult = {
      ...geminiResult,
      totalScore: recalculated.totalScore,
      averageScore: recalculated.averageScore,
      sessionId: options.sessionId,
      timestamp: new Date().toISOString(),
      model: modelName,
      processingTime: Date.now() - startTime,
    };
    
    // Optionally get additional improvement suggestions for low-scoring areas
    if (options.includeImprovements && result.averageScore < 3.5) {
      try {
        const improvementPrompt = createImprovementPrompt(formData, result.scores);
        const improvements = await generateStructuredContent<string[]>(
          improvementPrompt,
          modelName
        );
        
        // Add additional improvements to the suggestions
        if (Array.isArray(improvements)) {
          result.feedback.suggestions = [
            ...result.feedback.suggestions,
            ...improvements.slice(0, 3) // Limit to 3 additional suggestions
          ];
        }
      } catch (improvementError) {
        console.warn('Failed to get additional improvements:', improvementError);
        // Continue without additional improvements
      }
    }
    
    return result;
    
  } catch (error) {
    console.error('Error scoring ABT session:', error);
    
    // Return a structured error response
    throw new Error(
      `Failed to score ABT session: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

// Batch scoring function for multiple sessions
export const scoreMultipleAbtSessions = async (
  sessions: (AbtSessionData & { id?: string })[],
  options: {
    model?: string;
    batchSize?: number;
    delayMs?: number;
  } = {}
): Promise<ScoringResult[]> => {
  const { batchSize = 3, delayMs = 1000, model } = options;
  const results: ScoringResult[] = [];
  
  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < sessions.length; i += batchSize) {
    const batch = sessions.slice(i, i + batchSize);
    
    const batchPromises = batch.map(session => 
      scoreAbtSession(session, {
        model,
        sessionId: session.id,
        includeImprovements: false // Skip improvements for batch processing
      })
    );
    
    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches (except for the last batch)
      if (i + batchSize < sessions.length && delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Error processing batch ${Math.floor(i / batchSize) + 1}:`, error);
      // Continue with next batch rather than failing completely
    }
  }
  
  return results;
};

// Helper function to categorize score levels
export const getScoreCategory = (score: number): string => {
  if (score >= 4.5) return 'Excellent';
  if (score >= 3.5) return 'Good';
  if (score >= 2.5) return 'Average';
  if (score >= 1.5) return 'Below Average';
  return 'Needs Improvement';
};

// Helper function to get score-based recommendations
export const getScoreRecommendations = (result: AbtScoreResult): {
  priority: 'high' | 'medium' | 'low';
  focus: string[];
  nextSteps: string[];
} => {
  const { scores, averageScore } = result;
  const weakAreas = Object.entries(scores)
    .filter(([_, score]) => score <= 2)
    .map(([area, _]) => area);
  
  const moderateAreas = Object.entries(scores)
    .filter(([_, score]) => score === 3)
    .map(([area, _]) => area);
  
  if (averageScore < 2.5) {
    return {
      priority: 'high',
      focus: weakAreas.length > 0 ? weakAreas : ['overall story structure'],
      nextSteps: [
        'Practice telling your story out loud',
        'Focus on quantifying your results',
        'Clarify the connection between challenge and impact'
      ]
    };
  }
  
  if (averageScore < 3.5) {
    return {
      priority: 'medium',
      focus: [...weakAreas, ...moderateAreas.slice(0, 2)],
      nextSteps: [
        'Add more specific metrics and numbers',
        'Strengthen the "because" (challenge) section',
        'Practice concise delivery'
      ]
    };
  }
  
  return {
    priority: 'low',
    focus: moderateAreas.slice(0, 2),
    nextSteps: [
      'Fine-tune story delivery',
      'Practice for different interview contexts',
      'Consider adding backup examples'
    ]
  };
};

export default {
  scoreAbtSession,
  scoreMultipleAbtSessions,
  getScoreCategory,
  getScoreRecommendations,
};
