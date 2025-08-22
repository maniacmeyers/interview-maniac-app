'use client';

import { useState, useEffect } from 'react';

interface GamificationStats {
  points: number;
  level: number;
  streakDays: number;
  lastActivityDate: string;
  totalSessions: number;
  achievements: string[];
}

interface GamificationProps {
  className?: string;
}

type ActionType = 'generate' | 'score' | 'save' | 'voice_transcript';

const ACTION_POINTS: Record<ActionType, number> = {
  generate: 5,
  score: 5,
  save: 10,
  voice_transcript: 5,
};

const ACTION_LABELS: Record<ActionType, string> = {
  generate: 'Story Generated',
  score: 'Story Scored',
  save: 'Story Saved',
  voice_transcript: 'Voice Transcript',
};

const ACHIEVEMENTS = [
  { id: 'first_story', name: 'First Story', description: 'Create your first ABT story', threshold: 1, type: 'save' },
  { id: 'story_scorer', name: 'Story Scorer', description: 'Score 5 stories', threshold: 5, type: 'score' },
  { id: 'voice_user', name: 'Voice User', description: 'Use voice recording 3 times', threshold: 3, type: 'voice_transcript' },
  { id: 'productive', name: 'Productive', description: 'Generate 10 stories', threshold: 10, type: 'generate' },
  { id: 'level_up', name: 'Level Up', description: 'Reach level 5', threshold: 5, type: 'level' },
  { id: 'streak_master', name: 'Streak Master', description: 'Maintain a 7-day streak', threshold: 7, type: 'streak' },
  { id: 'points_collector', name: 'Points Collector', description: 'Earn 1000 points', threshold: 1000, type: 'points' },
];

export default function Gamification({ className = '' }: GamificationProps) {
  const [stats, setStats] = useState<GamificationStats>({
    points: 0,
    level: 1,
    streakDays: 0,
    lastActivityDate: '',
    totalSessions: 0,
    achievements: [],
  });
  
  const [recentAction, setRecentAction] = useState<{ action: ActionType; points: number } | null>(null);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const [actionCounts, setActionCounts] = useState<Record<ActionType, number>>({
    generate: 0,
    score: 0,
    save: 0,
    voice_transcript: 0,
  });

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('interview-maniac-gamification');
    const savedCounts = localStorage.getItem('interview-maniac-action-counts');
    
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (err) {
        console.error('Failed to parse saved gamification stats:', err);
      }
    }
    
    if (savedCounts) {
      try {
        setActionCounts(JSON.parse(savedCounts));
      } catch (err) {
        console.error('Failed to parse saved action counts:', err);
      }
    }
  }, []);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('interview-maniac-gamification', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('interview-maniac-action-counts', JSON.stringify(actionCounts));
  }, [actionCounts]);

  // Calculate level based on points (level = floor(points/100) + 1)
  const calculateLevel = (points: number): number => {
    return Math.floor(points / 100) + 1;
  };

  // Check for new achievements
  const checkAchievements = (newStats: GamificationStats, newCounts: Record<ActionType, number>): string[] => {
    const achievements: string[] = [];
    
    ACHIEVEMENTS.forEach(achievement => {
      if (newStats.achievements.includes(achievement.id)) return;
      
      let earned = false;
      
      switch (achievement.type) {
        case 'save':
        case 'score':
        case 'generate':
        case 'voice_transcript':
          earned = newCounts[achievement.type] >= achievement.threshold;
          break;
        case 'level':
          earned = newStats.level >= achievement.threshold;
          break;
        case 'streak':
          earned = newStats.streakDays >= achievement.threshold;
          break;
        case 'points':
          earned = newStats.points >= achievement.threshold;
          break;
      }
      
      if (earned) {
        achievements.push(achievement.id);
      }
    });
    
    return achievements;
  };

  // Update streak based on last activity date
  const updateStreak = (lastDate: string): { streakDays: number; lastActivityDate: string } => {
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    if (lastDate === today) {
      // Same day, no change
      return { streakDays: stats.streakDays, lastActivityDate: today };
    } else if (lastDate === yesterdayStr || lastDate === '') {
      // Consecutive day or first time
      return { streakDays: stats.streakDays + 1, lastActivityDate: today };
    } else {
      // Streak broken
      return { streakDays: 1, lastActivityDate: today };
    }
  };

  // Award points for an action
  const awardPoints = (action: ActionType) => {
    const pointsEarned = ACTION_POINTS[action];
    const newCounts = { ...actionCounts, [action]: actionCounts[action] + 1 };
    const streakData = updateStreak(stats.lastActivityDate);
    
    const newStats: GamificationStats = {
      ...stats,
      points: stats.points + pointsEarned,
      level: calculateLevel(stats.points + pointsEarned),
      streakDays: streakData.streakDays,
      lastActivityDate: streakData.lastActivityDate,
      totalSessions: stats.totalSessions + 1,
      achievements: [...stats.achievements],
    };
    
    // Check for new achievements
    const newAchievementIds = checkAchievements(newStats, newCounts);
    if (newAchievementIds.length > 0) {
      newStats.achievements.push(...newAchievementIds);
      setNewAchievements(newAchievementIds);
      
      // Clear new achievements after 3 seconds
      setTimeout(() => {
        setNewAchievements([]);
      }, 3000);
    }
    
    setStats(newStats);
    setActionCounts(newCounts);
    setRecentAction({ action, points: pointsEarned });
    
    // Clear recent action after 2 seconds
    setTimeout(() => {
      setRecentAction(null);
    }, 2000);
  };

  // Expose the awardPoints function globally for other components
  useEffect(() => {
    // @ts-ignore
    window.awardGamificationPoints = awardPoints;
    
    return () => {
      // @ts-ignore
      delete window.awardGamificationPoints;
    };
  }, [awardPoints]);

  const pointsToNextLevel = (stats.level * 100) - stats.points;
  const progressPercentage = ((stats.points % 100) / 100) * 100;

  const getLevelColor = (level: number): string => {
    if (level >= 10) return 'bg-purple-500';
    if (level >= 7) return 'bg-indigo-500';
    if (level >= 5) return 'bg-blue-500';
    if (level >= 3) return 'bg-green-500';
    return 'bg-gray-500';
  };

  const getAchievementByKey = (id: string) => {
    return ACHIEVEMENTS.find(a => a.id === id);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Progress & Achievements</h2>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-600">Level</div>
          <div className={`px-3 py-1 rounded-full text-white font-bold ${getLevelColor(stats.level)}`}>
            {stats.level}
          </div>
        </div>
      </div>

      {/* Recent Action Notification */}
      {recentAction && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-md animate-pulse">
          <div className="flex items-center justify-between">
            <span className="text-green-800 font-medium">
              {ACTION_LABELS[recentAction.action]}
            </span>
            <span className="text-green-600 font-bold">+{recentAction.points} points</span>
          </div>
        </div>
      )}

      {/* New Achievements */}
      {newAchievements.length > 0 && (
        <div className="mb-4 space-y-2">
          {newAchievements.map(achievementId => {
            const achievement = getAchievementByKey(achievementId);
            return achievement ? (
              <div key={achievementId} className="p-3 bg-yellow-100 border border-yellow-300 rounded-md animate-bounce">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="font-bold text-yellow-800">{achievement.name}</div>
                    <div className="text-sm text-yellow-700">{achievement.description}</div>
                  </div>
                </div>
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Points & Level Progress */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
          <div className="text-center mb-3">
            <div className="text-3xl font-bold text-indigo-600">{stats.points}</div>
            <div className="text-sm text-indigo-500">Total Points</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-center mt-2 text-gray-600">
            {pointsToNextLevel} points to Level {stats.level + 1}
          </div>
        </div>

        {/* Streak */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-orange-600">{stats.streakDays}</div>
          <div className="text-sm text-orange-500">Day Streak</div>
          <div className="text-xs text-gray-600 mt-2">
            {stats.streakDays === 0 ? 'Start your streak!' : 'Keep it up! 🔥'}
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-green-600">{stats.totalSessions}</div>
          <div className="text-sm text-green-500">Total Sessions</div>
          <div className="text-xs text-gray-600 mt-2">
            Achievements unlocked: {stats.achievements.length}
          </div>
        </div>
      </div>

      {/* Action Breakdown */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Activity Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="font-bold text-blue-600">{actionCounts.generate}</div>
            <div className="text-xs text-blue-500">Stories Generated</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="font-bold text-purple-600">{actionCounts.score}</div>
            <div className="text-xs text-purple-500">Stories Scored</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="font-bold text-green-600">{actionCounts.save}</div>
            <div className="text-xs text-green-500">Stories Saved</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="font-bold text-orange-600">{actionCounts.voice_transcript}</div>
            <div className="text-xs text-orange-500">Voice Used</div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {stats.achievements.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Unlocked Achievements</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.achievements.map(achievementId => {
              const achievement = getAchievementByKey(achievementId);
              return achievement ? (
                <div key={achievementId} className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="font-semibold text-yellow-800">{achievement.name}</div>
                    <div className="text-sm text-yellow-700">{achievement.description}</div>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Integration Note */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Currently using localStorage for data persistence. 
          In production, this will be integrated with Firestore for cross-device synchronization.
        </p>
      </div>
    </div>
  );
}

// Helper function for other components to award points
export const awardGamificationPoints = (action: ActionType) => {
  // @ts-ignore
  if (typeof window !== 'undefined' && window.awardGamificationPoints) {
    // @ts-ignore
    window.awardGamificationPoints(action);
  }
};

export type { GamificationStats, ActionType };
export { ACTION_POINTS, ACTION_LABELS };
