'use client';

import { useState } from 'react';
import { scoreABTStory } from '@/lib/api';

interface ScoringRubric {
  clarity: number; // 0-5
  relevance: number; // 0-5
  impact: number; // 0-5
  metrics: number; // 0-5
  storyArc: number; // 0-5
  concision: number; // 0-5
  totalScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestedRewrite?: string;
}

interface ScoringPanelProps {
  story: string;
  onApplyRewrite?: (rewrittenStory: string) => void;
}

export default function ScoringPanel({ story, onApplyRewrite }: ScoringPanelProps) {
  const [scoring, setScoring] = useState<ScoringRubric | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScoreStory = async () => {
    if (!story.trim()) {
      setError('Please provide a story to score.');
      return;
    }

    setIsScoring(true);
    setError(null);
    setScoring(null);

    try {
      // Check if Gemini API key is available
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.');
      }

      const scoringResult = await scoreABTStory(story);
      setScoring(scoringResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to score story. Please try again.');
    } finally {
      setIsScoring(false);
    }
  };

  const handleApplyRewrite = () => {
    if (scoring?.suggestedRewrite && onApplyRewrite) {
      onApplyRewrite(scoring.suggestedRewrite);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 4) return 'bg-green-100 border-green-300';
    if (score >= 3) return 'bg-yellow-100 border-yellow-300';
    return 'bg-red-100 border-red-300';
  };

  const ScoreBar = ({ label, score, maxScore = 5 }: { label: string; score: number; maxScore?: number }) => (
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-gray-700 w-20">{label}:</span>
      <div className="flex-1 mx-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              score >= 4 ? 'bg-green-500' : score >= 3 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${(score / maxScore) * 100}%` }}
          />
        </div>
      </div>
      <span className={`text-sm font-bold ${getScoreColor(score)} w-10 text-center`}>
        {score}/{maxScore}
      </span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">ABT Story Scoring</h2>
        
        <button
          onClick={handleScoreStory}
          disabled={isScoring || !story.trim() || !process.env.NEXT_PUBLIC_GEMINI_API_KEY}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isScoring ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Scoring...
            </>
          ) : (
            'Score Story'
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Feature Flag Notice */}
      {!process.env.NEXT_PUBLIC_GEMINI_API_KEY && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <p className="font-medium">Gemini API Integration Not Available</p>
          <p className="text-sm mt-1">
            To enable AI story scoring, please add your NEXT_PUBLIC_GEMINI_API_KEY to the environment variables.
          </p>
        </div>
      )}

      {/* Story Display */}
      {story && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Story to Score</h3>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="text-gray-700 whitespace-pre-wrap">{story}</p>
          </div>
        </div>
      )}

      {/* Scoring Results */}
      {scoring && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className={`p-6 rounded-lg border-2 ${getScoreBg(scoring.totalScore / 6)}`}>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Overall Score</h3>
              <div className={`text-5xl font-bold ${getScoreColor(scoring.totalScore / 6)}`}>
                {scoring.totalScore.toFixed(1)}/30
              </div>
              <div className={`text-lg ${getScoreColor(scoring.totalScore / 6)}`}>
                Average: {(scoring.totalScore / 6).toFixed(1)}/5
              </div>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Scoring Rubric</h3>
              <div className="space-y-2">
                <ScoreBar label="Clarity" score={scoring.clarity} />
                <ScoreBar label="Relevance" score={scoring.relevance} />
                <ScoreBar label="Impact" score={scoring.impact} />
                <ScoreBar label="Metrics" score={scoring.metrics} />
                <ScoreBar label="Story Arc" score={scoring.storyArc} />
                <ScoreBar label="Concision" score={scoring.concision} />
              </div>
            </div>

            <div className="space-y-4">
              {/* Strengths */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Strengths</h4>
                {scoring.strengths.length > 0 ? (
                  <ul className="space-y-1">
                    {scoring.strengths.map((strength, index) => (
                      <li key={index} className="text-green-700 text-sm flex items-start">
                        <span className="text-green-500 mr-2">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-green-600 text-sm">No specific strengths identified.</p>
                )}
              </div>

              {/* Weaknesses */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">Areas for Improvement</h4>
                {scoring.weaknesses.length > 0 ? (
                  <ul className="space-y-1">
                    {scoring.weaknesses.map((weakness, index) => (
                      <li key={index} className="text-red-700 text-sm flex items-start">
                        <span className="text-red-500 mr-2">!</span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-red-600 text-sm">No specific weaknesses identified.</p>
                )}
              </div>
            </div>
          </div>

          {/* Suggested Rewrite */}
          {scoring.suggestedRewrite && (
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-800">Suggested Rewrite</h3>
                {onApplyRewrite && (
                  <button
                    onClick={handleApplyRewrite}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Apply Rewrite
                  </button>
                )}
              </div>
              <div className="p-4 bg-white border border-blue-200 rounded-md">
                <p className="text-gray-700 whitespace-pre-wrap">{scoring.suggestedRewrite}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!story && !scoring && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-500 mb-2">No Story to Score</h3>
          <p className="text-gray-400">Provide an ABT story to get detailed scoring and feedback.</p>
        </div>
      )}
    </div>
  );
}

export type { ScoringRubric, ScoringPanelProps };
