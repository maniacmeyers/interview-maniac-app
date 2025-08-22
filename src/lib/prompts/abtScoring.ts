// ABT Scoring Prompt Templates for Google Gemini

// TypeScript interfaces for structured scoring
export interface AbtScoreResult {
  scores: {
    clarity: number;          // 0-5: How clear and understandable is the story?
    relevance: number;        // 0-5: How relevant is this to the job/interview context?
    impact: number;           // 0-5: How significant was the impact/result?
    metrics: number;          // 0-5: How well quantified are the results?
    storyArc: number;         // 0-5: How well does it follow ABT structure?
    concision: number;        // 0-5: How concise and focused is the narrative?
  };
  totalScore: number;         // Sum of all scores (0-30)
  averageScore: number;       // Average score (0-5)
  feedback: {
    strengths: string[];      // What the candidate did well
    improvements: string[];   // Areas for improvement
    suggestions: string[];    // Specific actionable suggestions
  };
  overallAssessment: string;  // Brief overall assessment
}

// System prompt for ABT scoring
export const ABT_SYSTEM_PROMPT = `You are an expert interview coach and career advisor specializing in evaluating ABT (Accomplishment-Because-Therefore) stories for job interviews.

Your role is to analyze candidate stories using the ABT framework and provide detailed scoring and feedback.

ABT Framework:
- **Accomplishment**: What the candidate achieved or did
- **Because**: Why it was challenging, important, or noteworthy
- **Therefore**: What measurable impact, result, or outcome occurred

Scoring Criteria (0-5 scale for each):

1. **Clarity (0-5)**: 
   - How clear, understandable, and well-articulated is the story?
   - Is the narrative easy to follow without confusion?

2. **Relevance (0-5)**:
   - How relevant is this story to typical job interview contexts?
   - Does it demonstrate skills valuable to employers?

3. **Impact (0-5)**:
   - How significant and meaningful was the result or outcome?
   - Does it show real value creation or problem-solving?

4. **Metrics (0-5)**:
   - How well quantified and specific are the results?
   - Are there concrete numbers, percentages, or measurable outcomes?

5. **Story Arc (0-5)**:
   - How well does the story follow the ABT structure?
   - Is there a clear progression from accomplishment to because to therefore?

6. **Concision (0-5)**:
   - How focused and concise is the narrative?
   - Does it convey maximum value without unnecessary details?

Provide constructive, actionable feedback that helps candidates improve their storytelling for interviews.

Always respond with valid JSON matching the AbtScoreResult interface.`;

// User prompt template for scoring an ABT story
export const createAbtScoringPrompt = (abtStory: {
  role: string;
  industry: string;
  achievement: string;
  because: string;
  therefore: string;
}) => {
  return `Please analyze and score this ABT interview story:

**Context:**
- Role: ${abtStory.role}
- Industry: ${abtStory.industry}

**ABT Story:**

**Accomplishment:** ${abtStory.achievement}

**Because:** ${abtStory.because}

**Therefore:** ${abtStory.therefore}

---

Please provide a comprehensive analysis and scoring based on the 6 criteria (clarity, relevance, impact, metrics, storyArc, concision). 

For each score:
- 0-1: Poor/Needs major improvement
- 2: Below average/Needs improvement
- 3: Average/Acceptable
- 4: Good/Above average
- 5: Excellent/Outstanding

Provide specific, actionable feedback in the strengths, improvements, and suggestions arrays.

Respond with JSON in this exact format:

\`\`\`json
{
  "scores": {
    "clarity": 0,
    "relevance": 0,
    "impact": 0,
    "metrics": 0,
    "storyArc": 0,
    "concision": 0
  },
  "totalScore": 0,
  "averageScore": 0.0,
  "feedback": {
    "strengths": ["List specific strengths here"],
    "improvements": ["List areas needing improvement"],
    "suggestions": ["List actionable suggestions"]
  },
  "overallAssessment": "Brief overall assessment of the story's effectiveness for interviews"
}
\`\`\`

Ensure the totalScore equals the sum of all individual scores, and averageScore is totalScore divided by 6.`;
};

// Additional prompt for getting improvement suggestions
export const createImprovementPrompt = (originalStory: {
  role: string;
  industry: string;
  achievement: string;
  because: string;
  therefore: string;
}, scores: AbtScoreResult['scores']) => {
  const weakestAreas = Object.entries(scores)
    .filter(([_, score]) => score <= 2)
    .map(([area, _]) => area);

  return `Based on the scoring analysis, the weakest areas for this ABT story are: ${weakestAreas.join(', ')}.

Original story context:
- Role: ${originalStory.role}
- Industry: ${originalStory.industry}
- Achievement: ${originalStory.achievement}
- Because: ${originalStory.because}
- Therefore: ${originalStory.therefore}

Please provide 3-5 specific, actionable recommendations to improve this story, focusing especially on the weakest scoring areas. Make the suggestions concrete and implementable.

Format as a simple array of strings:
["Specific suggestion 1", "Specific suggestion 2", "etc."]`;
};

export default {
  ABT_SYSTEM_PROMPT,
  createAbtScoringPrompt,
  createImprovementPrompt,
};
