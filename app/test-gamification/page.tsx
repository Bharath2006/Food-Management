'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Award, 
  TrendingUp, 
  Users, 
  Target,
  Zap,
  Crown,
  Medal,
  Gift,
  Calendar,
  BarChart3,
  Plus,
  Minus
} from 'lucide-react';
import { 
  gamificationService, 
  UserStats, 
  UserLevel, 
  Achievement, 
  LeaderboardEntry,
  LEVELS,
  POINTS_SYSTEM
} from '@/app/lib/gamification';
import { useAuth } from '@/app/contexts/AuthContext';
import { useNotifications } from '@/app/contexts/NotificationContext';
import GamificationDashboard from '@/app/components/GamificationDashboard';
import SocialShare from '@/app/components/SocialShare';

export default function TestGamification() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [currentLevel, setCurrentLevel] = useState<UserLevel | null>(null);

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = () => {
    if (!user) return;
    
    const stats = gamificationService.getUserStats(user.id);
    setUserStats(stats);
    setCurrentLevel(gamificationService.getCurrentLevel(user.id));
  };

  const addTestPoints = (action: string, points: number) => {
    if (!user) return;

    const updatedStats = gamificationService.addPoints(user.id, points, action);
    setUserStats(updatedStats);
    setCurrentLevel(gamificationService.getCurrentLevel(user.id));

    addNotification({
      type: 'achievement',
      title: 'Points Added! 🎉',
      message: `You earned ${points} points for ${action}!`,
      actionUrl: '/test-gamification'
    });
  };

  const simulateAction = (action: 'donation_created' | 'donation_delivered' | 'donation_picked' | 'volunteer_pickup' | 'volunteer_delivery' | 'social_share') => {
    if (!user) return;

    const updatedStats = gamificationService.updateStats(user.id, action);
    setUserStats(updatedStats);
    setCurrentLevel(gamificationService.getCurrentLevel(user.id));

    let message = '';
    switch (action) {
      case 'donation_created': message = 'Created a donation'; break;
      case 'donation_delivered': message = 'Donation was delivered'; break;
      case 'donation_picked': message = 'Donation was picked up'; break;
      case 'volunteer_pickup': message = 'Picked up as volunteer'; break;
      case 'volunteer_delivery': message = 'Delivered as volunteer'; break;
      case 'social_share': message = 'Shared on social media'; break;
    }

    addNotification({
      type: 'achievement',
      title: 'Action Completed! 🎉',
      message: message,
      actionUrl: '/test-gamification'
    });
  };

  const resetStats = () => {
    if (!user) return;
    
    gamificationService.resetUserStats(user.id);
    loadUserStats();
    
    addNotification({
      type: 'system',
      title: 'Stats Reset',
      message: 'Your gamification stats have been reset.',
      actionUrl: '/test-gamification'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Gamification Test</h1>
            <p className="text-gray-600">Please log in to test the gamification system.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🎮 Gamification Test Dashboard</h1>
          <p className="text-gray-600">Test the points, levels, and achievements system</p>
        </div>

        {/* Test Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-600" />
            Test Controls
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { action: 'donation_created', label: 'Create Donation', points: POINTS_SYSTEM.DONATION_CREATED },
                  { action: 'donation_delivered', label: 'Deliver Donation', points: POINTS_SYSTEM.DONATION_DELIVERED },
                  { action: 'volunteer_pickup', label: 'Volunteer Pickup', points: POINTS_SYSTEM.VOLUNTEER_PICKUP },
                  { action: 'volunteer_delivery', label: 'Volunteer Delivery', points: POINTS_SYSTEM.VOLUNTEER_DELIVERY },
                ].map((item) => (
                  <motion.button
                    key={item.action}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => simulateAction(item.action as any)}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="font-medium text-blue-900">{item.label}</div>
                    <div className="text-sm text-blue-600">+{item.points} pts</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Manual Points */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Manual Points</h3>
              <div className="space-y-3">
                {[10, 25, 50, 100, 250, 500].map((points) => (
                  <div key={points} className="flex items-center space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => addTestPoints(`Manual ${points} points`, points)}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-900">+{points}</span>
                    </motion.button>
                    <span className="text-gray-600">points</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetStats}
              className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
            >
              Reset All Stats
            </motion.button>
          </div>
        </motion.div>

        {/* Current Stats Display */}
        {userStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Current Stats
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{userStats.totalPoints}</div>
                <div className="text-sm text-gray-600">Total Points</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{userStats.currentLevel}</div>
                <div className="text-sm text-gray-600">Current Level</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{userStats.streak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {userStats.achievements.filter(a => a.unlocked).length}
                </div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Gamification Dashboard */}
        <div className="mb-8">
          <GamificationDashboard />
        </div>

        {/* Social Share Test */}
        <div>
          <SocialShare />
        </div>
      </div>
    </div>
  );
} 