'use client';

import { useState } from 'react';
import { generateABTStory, getStoryImprovements } from '@/lib/api';

interface ABTStory {
  role: string;
  industry: string;
  achievement: string;
  because: string;
  therefore: string;
  generatedStory?: string;
  improvements?: string[];
}

interface StoryCreatorProps {
  onSave: (story: ABTStory) => void;
  initialStory?: Partial<ABTStory>;
}

export default function StoryCreator({ onSave, initialStory }: StoryCreatorProps) {
  const [story, setStory] = useState<ABTStory>({
    role: initialStory?.role || '',
    industry: initialStory?.industry || '',
    achievement: initialStory?.achievement || '',
    because: initialStory?.because || '',
    therefore: initialStory?.therefore || '',
    generatedStory: initialStory?.generatedStory || '',
    improvements: initialStory?.improvements || [],
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof ABTStory, value: string) => {
    setStory(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleGenerateStory = async () => {
    if (!story.role || !story.industry || !story.achievement || !story.because || !story.therefore) {
      setError('Please fill in all ABT fields before generating a story.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Check if Gemini API key is available
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.');
      }

      const generatedStory = await generateABTStory({
        role: story.role,
        industry: story.industry,
        achievement: story.achievement,
        because: story.because,
        therefore: story.therefore,
      });

      const improvements = await getStoryImprovements(generatedStory);
      
      setStory(prev => ({ 
        ...prev, 
        generatedStory,
        improvements 
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setStory({
      role: '',
      industry: '',
      achievement: '',
      because: '',
      therefore: '',
      generatedStory: '',
      improvements: [],
    });
    setError(null);
  };

  const handleSave = () => {
    if (!story.achievement || !story.because || !story.therefore) {
      setError('Please fill in at least the Achievement, Because, and Therefore fields.');
      return;
    }
    
    onSave(story);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">ABT Story Creator</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role/Position
          </label>
          <input
            type="text"
            value={story.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            placeholder="e.g., Software Engineer, Marketing Manager"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          <input
            type="text"
            value={story.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            placeholder="e.g., Technology, Healthcare, Finance"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ABT Framework Fields */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Achievement (What you accomplished) *
          </label>
          <textarea
            value={story.achievement}
            onChange={(e) => handleInputChange('achievement', e.target.value)}
            placeholder="Describe what you achieved or accomplished..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Because (Why it was challenging or important) *
          </label>
          <textarea
            value={story.because}
            onChange={(e) => handleInputChange('because', e.target.value)}
            placeholder="Explain why this was challenging or important..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Therefore (What was the measurable impact) *
          </label>
          <textarea
            value={story.therefore}
            onChange={(e) => handleInputChange('therefore', e.target.value)}
            placeholder="Describe the measurable impact or result..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={handleGenerateStory}
          disabled={isGenerating || !process.env.NEXT_PUBLIC_GEMINI_API_KEY}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            'Generate Story (Gemini)'
          )}
        </button>
        
        <button
          onClick={handleClear}
          disabled={isGenerating}
          className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
        >
          Clear
        </button>
        
        <button
          onClick={handleSave}
          disabled={isGenerating}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        >
          Save
        </button>
      </div>

      {/* Feature Flag Notice */}
      {!process.env.NEXT_PUBLIC_GEMINI_API_KEY && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p className="font-medium">Gemini API Integration Not Available</p>
          <p className="text-sm mt-1">
            To enable AI story generation, please add your NEXT_PUBLIC_GEMINI_API_KEY to the environment variables.
          </p>
        </div>
      )}

      {/* Generated Story Display */}
      {story.generatedStory && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Generated Story</h3>
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-gray-700 whitespace-pre-wrap">{story.generatedStory}</p>
            </div>
          </div>
          
          {story.improvements && story.improvements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Suggested Improvements</h3>
              <ul className="space-y-2">
                {story.improvements.map((improvement, index) => (
                  <li key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-blue-800">{improvement}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export type { ABTStory, StoryCreatorProps };
