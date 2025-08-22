import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const getGeminiClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.COMPANY_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'Gemini API key is required. Please set NEXT_PUBLIC_GEMINI_API_KEY or COMPANY_GEMINI_API_KEY in your environment variables.'
    );
  }
  
  return new GoogleGenerativeAI(apiKey);
};

// Get the Gemini 1.5 Pro model instance
export const getGeminiModel = (modelName: string = 'gemini-1.5-pro') => {
  const genAI = getGeminiClient();
  return genAI.getGenerativeModel({ model: modelName });
};

// Helper function to generate content with error handling
export const generateContent = async (
  prompt: string,
  modelName: string = 'gemini-1.5-pro'
) => {
  try {
    const model = getGeminiModel(modelName);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw new Error(
      `Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

// Helper function to generate structured content with JSON parsing
export const generateStructuredContent = async <T>(
  prompt: string,
  modelName: string = 'gemini-1.5-pro'
): Promise<T> => {
  try {
    const content = await generateContent(prompt, modelName);
    
    // Try to extract JSON from the response
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);  
    const jsonString = jsonMatch ? jsonMatch[1] : content;
    
    return JSON.parse(jsonString.trim());
  } catch (error) {
    console.error('Error parsing structured content from Gemini:', error);
    throw new Error(
      `Failed to parse structured response: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export default {
  getGeminiModel,
  generateContent,
  generateStructuredContent,
};
