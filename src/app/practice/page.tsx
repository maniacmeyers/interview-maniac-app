'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { addAbtSession, getAbtSessions } from '@/lib/firestore';
import { awardGamificationPoints } from '@/components/Gamification';
import StoryCreator, { type ABTStory } from '@/components/StoryCreator';
import ScoringPanel from '@/components/ScoringPanel';
import VoiceRecorder, { type TranscriptionResult } from '@/components/VoiceRecorder';
import Gamification from '@/components/Gamification';
import AuthPanel from '@/components/AuthPanel';

interface ABTSession {
  id?: string;
  userId: string;
  story: ABTStory;
  score?: any;
  createdAt: Date;
  updatedAt: Date;
}

export default function PracticePage() {
  const [user, loading, error] = useAuthState(auth);
  const [currentStory, setCurrentStory] = useState<ABTStory>({
    role: '',
    industry: '',
    achievement: '',
    because: '',
    therefore: '',
    generatedStory: '',
    improvements: [],
  });
  const [recentSessions, setRecentSessions] = useState<ABTSession[]>([]);
  const [selectedStoryForScoring, setSelectedStoryForScoring] = useState<string>('');
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showGamification, setShowGamification] = useState(true);

  // Load recent sessions for authenticated users
  useEffect(() => {
    if (user) {
      loadRecentSessions();
    }
  }, [user]);

  const loadRecentSessions = async () => {
    if (!user) return;
    
    setIsLoadingSessions(true);
    try {
      const sessions = await getAbtSessions(user.uid, 5);
      setRecentSessions(sessions);
    } catch (err) {
      console.error('Failed to load recent sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleStoryCreated = async (story: ABTStory) => {
    setCurrentStory(story);
    
    // Auto-select for scoring if story has content
    if (story.generatedStory || (story.achievement && story.because && story.therefore)) {
      const storyText = story.generatedStory || `${story.achievement} because ${story.because}, therefore ${story.therefore}`;
      setSelectedStoryForScoring(storyText);
    }
    
    // Award gamification points
    awardGamificationPoints('save');
    
    // Save session if user is authenticated
    if (user) {
      try {
        const session: Omit<ABTSession, 'id'> = {
          userId: user.uid,
          story,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await addAbtSession(session);
        await loadRecentSessions(); // Refresh the list
      } catch (err) {
        console.error('Failed to save ABT session:', err);
      }
    }
  };

  const handleVoiceTranscription = (result: TranscriptionResult) => {
    // Award points for using voice
    awardGamificationPoints('voice_transcript');
    
    // Update current story with transcription results
    setCurrentStory(prev => ({
      ...prev,
      role: result.role || prev.role,
      industry: result.industry || prev.industry,
      achievement: result.achievement || prev.achievement,
      because: result.because || prev.because,
      therefore: result.therefore || prev.therefore,
    }));
    
    // If we have a complete story, auto-select for scoring
    if (result.raw) {
      setSelectedStoryForScoring(result.raw);
    }
  };

  const handleRewriteApplied = (rewrittenStory: string) => {
    setCurrentStory(prev => ({
      ...prev,
      generatedStory: rewrittenStory,
    }));
    
    setSelectedStoryForScoring(rewrittenStory);
  };

  const handleLoadSession = (session: ABTSession) => {
    setCurrentStory(session.story);
    
    // Set story for scoring
    const storyText = session.story.generatedStory || 
      `${session.story.achievement} because ${session.story.because}, therefore ${session.story.therefore}`;
    setSelectedStoryForScoring(storyText);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">ABT Practice</h1>
              <div className="hidden sm:flex space-x-2">
                <button
                  onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    showVoiceRecorder 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🎤 Voice
                </button>
                <button
                  onClick={() => setShowGamification(!showGamification)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    showGamification 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  🏆 Progress
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <AuthPanel />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Guest Banner */}
        {!user && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="text-blue-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Welcome, Guest!</h3>
                <p className="text-blue-700 mb-3">
                  You can generate and score ABT stories without an account, but sign in to save your progress, 
                  track your improvement over time, and access your story history.
                </p>
                <div className="flex items-center space-x-4 text-sm text-blue-600">
                  <span>✓ Generate & Score Stories</span>
                  <span>✗ Save Progress</span>
                  <span>✗ Track History</span>
                  <span>✗ Cross-device Sync</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gamification Panel */}
        {showGamification && (
          <div className="mb-8">
            <Gamification className="" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Voice Recorder */}
            {showVoiceRecorder && (
              <VoiceRecorder onTranscriptionReady={handleVoiceTranscription} />
            )}

            {/* Story Creator */}
            <StoryCreator 
              onSave={handleStoryCreated}
              initialStory={currentStory}
            />

            {/* Scoring Panel */}
            <ScoringPanel 
              story={selectedStoryForScoring}
              onApplyRewrite={handleRewriteApplied}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Sessions (Authenticated Users) */}
            {user && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Sessions</h3>
                  <button
                    onClick={loadRecentSessions}
                    disabled={isLoadingSessions}
                    className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    {isLoadingSessions ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
                
                {recentSessions.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No recent sessions. Create your first ABT story!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentSessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleLoadSession(session)}
                      >
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {session.story.achievement || 'Untitled Story'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {session.story.role && `${session.story.role} • `}
                          {session.story.industry}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Quick Tips</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Use the ABT framework: <strong>Achievement</strong> because <strong>Challenge</strong>, therefore <strong>Impact</strong></span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <span>Include specific metrics and numbers in your "Therefore" section</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>Try voice recording for a more natural storytelling experience</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Score your stories to get detailed feedback and improvement suggestions</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>Complete actions to earn points and unlock achievements</span>
                </li>
              </ul>
            </div>

            {/* Mobile Toggle Buttons */}
            <div className="sm:hidden bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Tools</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showVoiceRecorder 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🎤 {showVoiceRecorder ? 'Hide' : 'Show'} Voice Recorder
                </button>
                <button
                  onClick={() => setShowGamification(!showGamification)}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showGamification 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🏆 {showGamification ? 'Hide' : 'Show'} Progress Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
