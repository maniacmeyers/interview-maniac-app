import { NextRequest, NextResponse } from 'next/server';

interface ImproveRequest {
  story: string;
  role: string;
  industry: string;
  feedback?: string;
}

interface ImproveResponse {
  improvedStory: string;
  rationale: string;
}

interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export async function POST(req: NextRequest): Promise<NextResponse<ImproveResponse | { error: string }>> {
  try {
    // Validate environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      );
    }

    // Parse and validate request body
    let requestData: ImproveRequest;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error('Failed to parse request JSON:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { story, role, industry, feedback } = requestData;

    // Validate required fields
    if (!story || typeof story !== 'string' || story.trim().length === 0) {
      return NextResponse.json(
        { error: 'Story is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!role || typeof role !== 'string' || role.trim().length === 0) {
      return NextResponse.json(
        { error: 'Role is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!industry || typeof industry !== 'string' || industry.trim().length === 0) {
      return NextResponse.json(
        { error: 'Industry is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Construct the prompt for Gemini
    const basePrompt = `You are an expert interview coach helping improve a candidate's story for a ${role} position in the ${industry} industry.

Original story:
"${story.trim()}"

${feedback ? `Previous feedback received:
"${feedback.trim()}"

` : ''}Please provide an improved version of this story that:
1. Is more compelling and specific
2. Better demonstrates relevant skills and achievements
3. Uses the ABT (Accomplishment-Because-Therefore) framework more effectively
4. Is concise but impactful
5. ${feedback ? 'Addresses the previous feedback provided' : 'Shows clear measurable results'}

Provide your response in this exact JSON format:
{
  "improvedStory": "Your improved version here",
  "rationale": "Explanation of what you changed and why"
}`;

    const geminiRequest: GeminiRequest = {
      contents: [
        {
          parts: [
            {
              text: basePrompt
            }
          ]
        }
      ]
    };

    // Make request to Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiRequest),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return NextResponse.json(
        { error: `Gemini API error: ${geminiResponse.status}` },
        { status: 500 }
      );
    }

    const geminiData: GeminiResponse = await geminiResponse.json();

    // Extract and parse the response
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      console.error('No response text from Gemini');
      return NextResponse.json(
        { error: 'No response received from Gemini' },
        { status: 500 }
      );
    }

    // Try to extract JSON from the response
    let improveResponse: ImproveResponse;
    try {
      // Look for JSON in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        if (parsedResponse.improvedStory && parsedResponse.rationale) {
          improveResponse = {
            improvedStory: parsedResponse.improvedStory.trim(),
            rationale: parsedResponse.rationale.trim()
          };
        } else {
          throw new Error('Missing required fields in response');
        }
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      // Fallback: create a response from the raw text
      const lines = responseText.split('\n').filter(line => line.trim());
      improveResponse = {
        improvedStory: lines.length > 0 ? lines[0] : story,
        rationale: 'Unable to parse detailed rationale from response'
      };
    }

    // Validate the improved response
    if (!improveResponse.improvedStory || improveResponse.improvedStory.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid response from Gemini API' },
        { status: 500 }
      );
    }

    return NextResponse.json(improveResponse);

  } catch (error) {
    console.error('Unexpected error in improve API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
