interface ImproveStoryRequest {
  story: string;
  role: string;
  industry: string;
  feedback?: string;
}

interface ImproveStoryResponse {
  improvedStory: string;
  rationale: string;
}

/**
 * Calls the Gemini improve API endpoint to get an improved version of a story
 * @param request - The story improvement request
 * @returns Promise resolving to the improved story and rationale
 */
export async function improveStory(request: ImproveStoryRequest): Promise<ImproveStoryResponse> {
  try {
    const response = await fetch('/api/gemini/improve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // Ignore parsing errors, use HTTP status message
      }
      throw new Error(errorMessage);
    }

    const data: ImproveStoryResponse = await response.json();
    
    // Validate the response structure
    if (!data.improvedStory || typeof data.improvedStory !== 'string') {
      throw new Error('Invalid response: missing or invalid improvedStory');
    }
    
    if (!data.rationale || typeof data.rationale !== 'string') {
      throw new Error('Invalid response: missing or invalid rationale');
    }
    
    return {
      improvedStory: data.improvedStory.trim(),
      rationale: data.rationale.trim()
    };
  } catch (error) {
    // Re-throw with more context if it's our own error
    if (error instanceof Error) {
      throw error;
    }
    // Handle unexpected error types
    throw new Error('An unexpected error occurred while improving the story');
  }
}

/**
 * Validates story improvement request parameters
 * @param request - The request to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateImproveStoryRequest(request: Partial<ImproveStoryRequest>): string[] {
  const errors: string[] = [];
  
  if (!request.story || typeof request.story !== 'string' || request.story.trim().length === 0) {
    errors.push('Story is required and must be a non-empty string');
  }
  
  if (!request.role || typeof request.role !== 'string' || request.role.trim().length === 0) {
    errors.push('Role is required and must be a non-empty string');
  }
  
  if (!request.industry || typeof request.industry !== 'string' || request.industry.trim().length === 0) {
    errors.push('Industry is required and must be a non-empty string');
  }
  
  if (request.feedback !== undefined && (typeof request.feedback !== 'string' || request.feedback.trim().length === 0)) {
    errors.push('Feedback must be a non-empty string if provided');
  }
  
  return errors;
}

// Export types for use in other components
export type { ImproveStoryRequest, ImproveStoryResponse };
