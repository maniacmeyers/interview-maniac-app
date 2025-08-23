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
    const { prompt, type, context } = body;

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required for content generation' },
        { status: 400 }
      );
    }

    // Generate different types of content based on the type parameter
    let finalPrompt = '';
    
    switch (type) {
      case 'interview-questions':
        finalPrompt = `Generate interview questions based on the following context: ${context || 'general interview'}\n\nUser request: ${prompt}\n\nProvide 5-10 relevant interview questions that would be appropriate for this context. Format as a JSON array of strings.`;
        break;
      
      case 'sample-answers':
        finalPrompt = `Generate sample answers for interview questions using the ABT (Accomplishment-Because-Therefore) framework.\n\nQuestion: ${prompt}\n\nContext: ${context || 'General professional context'}\n\nProvide 2-3 different sample answers following the ABT structure:\n- Accomplishment: What you achieved\n- Because: Why it was challenging or important\n- Therefore: What the measurable impact or result was\n\nFormat as JSON with this structure:\n{\n  \"answers\": [\n    {\n      \"accomplishment\": \"...\",\n      \"because\": \"...\",\n      \"therefore\": \"...\",\n      \"fullAnswer\": \"...\"\n    }\n  ]\n}`;
        break;
      
      case 'feedback':
        finalPrompt = `Provide constructive feedback and improvement suggestions for the following interview response:\n\n\"${prompt}\"\n\nContext: ${context || 'General interview context'}\n\nAnalyze the response and provide:\n1. What's working well\n2. Areas for improvement\n3. Specific suggestions for enhancement\n4. Alternative phrasing suggestions\n\nFormat as JSON with this structure:\n{\n  \"strengths\": [\"...\"],\n  \"improvements\": [\"...\"],\n  \"suggestions\": [\"...\"],\n  \"alternatives\": [\"...\"]\n}`;
        break;
      
      case 'practice-scenarios':
        finalPrompt = `Generate realistic practice scenarios for interview preparation based on: ${prompt}\n\nContext: ${context || 'General professional environment'}\n\nProvide 3-5 detailed scenarios that would be relevant for interview practice, including:\n- Situation description\n- Key challenges\n- Expected outcomes\n- Skills being tested\n\nFormat as JSON array of scenario objects.`;
        break;
      
      default:
        // General content generation
        finalPrompt = `${context ? `Context: ${context}\n\n` : ''}${prompt}\n\nPlease provide a helpful and detailed response appropriate for interview preparation and professional development.`;
    }

    // Get Gemini model and generate response
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse as JSON if it's a structured response
    let generatedContent;
    try {
      // Clean the response text (remove markdown code blocks if present)
      const cleanText = text.replace(/```json\n?|```\n?/g, '').trim();
      
      // Only try to parse as JSON for structured types
      if (['interview-questions', 'sample-answers', 'feedback', 'practice-scenarios'].includes(type)) {
        generatedContent = JSON.parse(cleanText);
      } else {
        generatedContent = { content: text };
      }
    } catch (parseError) {
      // If JSON parsing fails, return as plain text content
      generatedContent = { content: text };
    }

    return NextResponse.json({
      success: true,
      type: type || 'general',
      data: generatedContent
    });

  } catch (error) {
    console.error('Gemini generation API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate content. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate content.' },
    { status: 405 }
  );
}
