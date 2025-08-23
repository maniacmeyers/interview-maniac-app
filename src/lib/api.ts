import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.COMPANY_GEMINI_API_KEY || ''
);

export interface StoryGenerationRequest {
  situation: string;
  taskOrChallenge: string;
  audienceLevel?: 'junior' | 'mid' | 'senior' | 'executive';
  industryContext?: string;
}

export interface GeneratedStory {
  accomplishment: string;
  because: string;
  therefore: string;
  fullStory: string;
}

export interface ScoringResult {
  overallScore: number;
  accomplishmentScore: number;
  becauseScore: number;
  thereforeScore: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    suggestions: string[];
  };
  rubric: {
    clarity: number;
    impact: number;
    specificity: number;
    relevance: number;
  };
}

// Generate ABT story using Gemini
export async function generateABTStory(
  request: StoryGenerationRequest
): Promise<GeneratedStory> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
Create a compelling interview story using the ABT (Accomplishment-Because-Therefore) framework.

Situation: ${request.situation}
Task/Challenge: ${request.taskOrChallenge}
Audience Level: ${request.audienceLevel || 'mid'}
Industry Context: ${request.industryContext || 'general'}

Please structure your response as a JSON object with the following format:
{
  "accomplishment": "What you achieved (specific, measurable result)",
  "because": "Why it was challenging or important (context, obstacles, complexity)",
  "therefore": "The measurable impact or outcome (business value, learning, growth)",
  "fullStory": "A cohesive narrative combining all three elements for interview delivery"
}

Make the story compelling, specific, and appropriate for the ${request.audienceLevel || 'mid'}-level audience.
Ensure each section is detailed enough to demonstrate competence while being concise for interview format.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse story generation response');
    }
    
    const parsedStory = JSON.parse(jsonMatch[0]);
    return parsedStory as GeneratedStory;
    
  } catch (error) {
    console.error('Story generation error:', error);
    throw new Error('Failed to generate story. Please try again.');
  }
}

// Score ABT story using Gemini
export async function scoreABTStory(
  story: { accomplishment: string; because: string; therefore: string }
): Promise<ScoringResult> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
Evaluate this ABT interview story using professional scoring criteria:

ACCOMPLISHMENT: "${story.accomplishment}"
BECAUSE: "${story.because}"
THEREFORE: "${story.therefore}"

Please provide a comprehensive evaluation as a JSON object with this exact format:
{
  "overallScore": 85,
  "accomplishmentScore": 88,
  "becauseScore": 82,
  "thereforeScore": 87,
  "feedback": {
    "strengths": ["Specific strength 1", "Specific strength 2"],
    "improvements": ["Specific improvement 1", "Specific improvement 2"],
    "suggestions": ["Actionable suggestion 1", "Actionable suggestion 2"]
  },
  "rubric": {
    "clarity": 85,
    "impact": 88,
    "specificity": 82,
    "relevance": 87
  }
}

Scoring criteria (1-100):
- ACCOMPLISHMENT: Specificity, measurability, achievement clarity
- BECAUSE: Context depth, challenge complexity, obstacle identification
- THEREFORE: Impact measurement, business value, outcome clarity
- CLARITY: How well the story is structured and communicated
- IMPACT: Significance of the achievement and outcomes
- SPECIFICITY: Concrete details, metrics, and tangible examples
- RELEVANCE: Alignment with professional competencies and interview goals

Provide constructive, actionable feedback that helps improve interview performance.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse scoring response');
    }
    
    const parsedScore = JSON.parse(jsonMatch[0]);
    return parsedScore as ScoringResult;
    
  } catch (error) {
    console.error('Story scoring error:', error);
    throw new Error('Failed to score story. Please try again.');
  }
}

// Enhanced story generation with interview-specific prompts
export async function generateInterviewStory(
  jobTitle: string,
  companyContext: string,
  skillsToHighlight: string[],
  situationPrompt: string
): Promise<GeneratedStory> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
Generate a compelling interview story for this specific context:

Job Title: ${jobTitle}
Company Context: ${companyContext}
Skills to Highlight: ${skillsToHighlight.join(', ')}
Situation: ${situationPrompt}

Create an ABT story that demonstrates the specified skills and is relevant to the role.
Structure as JSON with accomplishment, because, therefore, and fullStory fields.
Make it authentic, specific, and interview-ready with concrete metrics and outcomes.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse enhanced story response');
    }
    
    return JSON.parse(jsonMatch[0]) as GeneratedStory;
    
  } catch (error) {
    console.error('Enhanced story generation error:', error);
    throw new Error('Failed to generate interview story. Please try again.');
  }
}

// Get story improvement suggestions
export async function getStoryImprovements(
  currentStory: GeneratedStory,
  targetRole: string
): Promise<{ suggestions: string[]; enhancedStory: GeneratedStory }> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
Analyze and improve this interview story for a ${targetRole} role:

Current Story:
- Accomplishment: ${currentStory.accomplishment}
- Because: ${currentStory.because}
- Therefore: ${currentStory.therefore}

Provide specific improvement suggestions and an enhanced version.
Return as JSON with 'suggestions' array and 'enhancedStory' object.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse improvement response');
    }
    
    return JSON.parse(jsonMatch[0]);
    
  } catch (error) {
    console.error('Story improvement error:', error);
    throw new Error('Failed to get story improvements. Please try again.');
  }
}
