import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with server-side API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    // Validate API key exists
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing API key' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { content, criteria } = body;

    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required for scoring' },
        { status: 400 }
      );
    }

    // Default scoring criteria if not provided
    const scoringCriteria = criteria || [
      'Clarity and coherence',
      'Specific examples and details',
      'Quantifiable results/impact',
      'Professional language and structure',
      'Relevance to interview context'
    ];

    // Create scoring prompt
    const prompt = `Please analyze and score the following interview response based on these criteria: ${scoringCriteria.join(', ')}.

Content to score:
"${content}"

Provide:
1. An overall score from 1-10
2. Individual scores for each criterion (1-10)
3. Specific feedback and suggestions for improvement
4. Strengths and areas for improvement

Format the response as JSON with the following structure:
{
  "overallScore": number,
  "criteriaScores": {
    "criterion1": number,
    "criterion2": number,
    ...
  },
  "feedback": "detailed feedback",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}`;

    // Get Gemini model and generate response
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the response as JSON
    let scoringResult;
    try {
      // Clean the response text (remove markdown code blocks if present)
      const cleanText = text.replace(/```json\n?|```\n?/g, '').trim();
      scoringResult = JSON.parse(cleanText);
    } catch (parseError) {
      // If JSON parsing fails, return a structured fallback
      scoringResult = {
        overallScore: 0,
        criteriaScores: {},
        feedback: text,
        strengths: [],
        improvements: ['Unable to parse detailed scoring. Please try again.']
      };
    }

    return NextResponse.json({
      success: true,
      data: scoringResult
    });

  } catch (error) {
    console.error('Gemini scoring API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to score content. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to score content.' },
    { status: 405 }
  );
}
