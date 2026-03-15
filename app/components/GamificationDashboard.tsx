'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3
} from 'lucide-react';

import {
  gamificationService,
  UserStats,
  UserLevel,
  LeaderboardEntry
} from '@/app/lib/gamification';

import { useAuth } from '@/app/contexts/AuthContext';

export default function GamificationDashboard() {
  const { user } = useAuth();

  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [currentLevel, setCurrentLevel] = useState<UserLevel | null>(null);
  const [nextLevel, setNextLevel] = useState<UserLevel | null>(null);

  const loadUserStats = () => {
    if (!user) return;

    const stats = gamificationService.getUserStats(user.id);
    setUserStats(stats);
    setCurrentLevel(gamificationService.getCurrentLevel(user.id));
    setNextLevel(gamificationService.getNextLevel(user.id));
  };

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const unlockedAchievements =
    userStats?.achievements.filter(a => a.unlocked) || [];

  if (!userStats) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Level Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">
              Level {userStats.currentLevel}
            </h2>
            <p className="text-purple-100">{currentLevel?.title}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{userStats.totalPoints}</div>
            <div className="text-purple-100">Total Points</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress to Level {userStats.currentLevel + 1}</span>
            <span>{Math.round(userStats.levelProgress)}%</span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${userStats.levelProgress}%` }}
              transition={{ duration: 1 }}
              className="bg-white h-3 rounded-full"
            />
          </div>
        </div>

        {/* Next Level */}
        {nextLevel && (
          <div className="bg-white/20 rounded-lg p-3 flex justify-between items-center">
            <div>
              <p className="text-sm">
                Next: Level {nextLevel.level} – {nextLevel.title}
              </p>
              <p className="text-xs text-purple-100">
                {nextLevel.pointsRequired - userStats.totalPoints} points needed
              </p>
            </div>
            <div className="text-2xl">{nextLevel.icon}</div>
          </div>
        )}
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Your Stats
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {userStats.totalDonations}
            </div>
            <div className="text-sm text-gray-600">Donations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {userStats.totalDeliveries}
            </div>
            <div className="text-sm text-gray-600">Deliveries</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {userStats.streak}
            </div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {unlockedAchievements.length}
            </div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
