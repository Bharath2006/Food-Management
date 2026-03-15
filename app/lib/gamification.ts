// Gamification System for Zero Food Hero

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  category: 'donation' | 'volunteer' | 'social' | 'milestone';
  requirement: {
    type: 'donations' | 'food_saved' | 'deliveries' | 'streak' | 'social';
    value: number;
  };
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface UserLevel {
  level: number;
  title: string;
  pointsRequired: number;
  rewards: string[];
  icon: string;
}

export interface UserStats {
  totalPoints: number;
  currentLevel: number;
  levelProgress: number;
  achievements: Achievement[];
  streak: number;
  lastActivity: Date;
  totalDonations: number;
  totalFoodSaved: number;
  totalDeliveries: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  points: number;
  level: number;
  achievements: number;
  rank: number;
}

// Points system
export const POINTS_SYSTEM = {
  DONATION_CREATED: 10,
  DONATION_DELIVERED: 25,
  DONATION_PICKED_UP: 15,
  VOLUNTEER_PICKUP: 20,
  VOLUNTEER_DELIVERY: 30,
  DAILY_STREAK: 5,
  WEEKLY_STREAK: 25,
  MONTHLY_STREAK: 100,
  FIRST_DONATION: 50,
  FIRST_DELIVERY: 75,
  SOCIAL_SHARE: 5,
  PROFILE_COMPLETE: 20,
  LOCATION_SET: 10,
  QR_SCAN: 5,
  PERFECT_RATING: 15,
  REFERRAL: 50,
  MILESTONE_10_DONATIONS: 100,
  MILESTONE_50_DONATIONS: 500,
  MILESTONE_100_DONATIONS: 1000,
  MILESTONE_1KG_FOOD: 25,
  MILESTONE_10KG_FOOD: 250,
  MILESTONE_100KG_FOOD: 2500,
};

// Level system
export const LEVELS: UserLevel[] = [
  { level: 1, title: 'Food Saver', pointsRequired: 0, rewards: ['Basic Badge'], icon: '🌱' },
  { level: 2, title: 'Helper', pointsRequired: 100, rewards: ['Helper Badge', 'Profile Customization'], icon: '⭐' },
  { level: 3, title: 'Supporter', pointsRequired: 250, rewards: ['Supporter Badge', 'Priority Notifications'], icon: '🥈' },
  { level: 4, title: 'Champion', pointsRequired: 500, rewards: ['Champion Badge', 'Advanced Analytics'], icon: '🥇' },
  { level: 5, title: 'Hero', pointsRequired: 1000, rewards: ['Hero Badge', 'VIP Status'], icon: '🏆' },
  { level: 6, title: 'Legend', pointsRequired: 2000, rewards: ['Legend Badge', 'Exclusive Features'], icon: '👑' },
  { level: 7, title: 'Master', pointsRequired: 3500, rewards: ['Master Badge', 'Community Leader'], icon: '🌟' },
  { level: 8, title: 'Grandmaster', pointsRequired: 5000, rewards: ['Grandmaster Badge', 'Hall of Fame'], icon: '💎' },
  { level: 9, title: 'Supreme', pointsRequired: 7500, rewards: ['Supreme Badge', 'Legendary Status'], icon: '🔥' },
  { level: 10, title: 'Immortal', pointsRequired: 10000, rewards: ['Immortal Badge', 'Eternal Recognition'], icon: '⚡' },
];

// Achievement definitions
export const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  // Donation Achievements
  {
    id: 'first_donation',
    name: 'First Steps',
    description: 'Created your first donation',
    icon: '🎯',
    points: 50,
    category: 'donation',
    requirement: { type: 'donations', value: 1 }
  },
  {
    id: 'generous_donor',
    name: 'Generous Donor',
    description: 'Created 10 donations',
    icon: '🎁',
    points: 100,
    category: 'donation',
    requirement: { type: 'donations', value: 10 }
  },
  {
    id: 'food_hero',
    name: 'Food Hero',
    description: 'Created 50 donations',
    icon: '🦸',
    points: 500,
    category: 'donation',
    requirement: { type: 'donations', value: 50 }
  },
  {
    id: 'donation_master',
    name: 'Donation Master',
    description: 'Created 100 donations',
    icon: '👑',
    points: 1000,
    category: 'donation',
    requirement: { type: 'donations', value: 100 }
  },
  
  // Food Saved Achievements
  {
    id: 'food_saver_1kg',
    name: 'Food Saver',
    description: 'Saved 1kg of food from waste',
    icon: '🌱',
    points: 25,
    category: 'milestone',
    requirement: { type: 'food_saved', value: 1 }
  },
  {
    id: 'food_saver_10kg',
    name: 'Food Champion',
    description: 'Saved 10kg of food from waste',
    icon: '🌿',
    points: 250,
    category: 'milestone',
    requirement: { type: 'food_saved', value: 10 }
  },
  {
    id: 'food_saver_100kg',
    name: 'Food Legend',
    description: 'Saved 100kg of food from waste',
    icon: '🌳',
    points: 2500,
    category: 'milestone',
    requirement: { type: 'food_saved', value: 100 }
  },
  
  // Volunteer Achievements
  {
    id: 'first_delivery',
    name: 'First Delivery',
    description: 'Completed your first delivery',
    icon: '🚚',
    points: 75,
    category: 'volunteer',
    requirement: { type: 'deliveries', value: 1 }
  },
  {
    id: 'reliable_volunteer',
    name: 'Reliable Volunteer',
    description: 'Completed 10 deliveries',
    icon: '📦',
    points: 200,
    category: 'volunteer',
    requirement: { type: 'deliveries', value: 10 }
  },
  {
    id: 'volunteer_master',
    name: 'Volunteer Master',
    description: 'Completed 50 deliveries',
    icon: '🏆',
    points: 1000,
    category: 'volunteer',
    requirement: { type: 'deliveries', value: 50 }
  },
  
  // Streak Achievements
  {
    id: 'streak_3_days',
    name: 'Consistent',
    description: '3-day activity streak',
    icon: '🔥',
    points: 50,
    category: 'milestone',
    requirement: { type: 'streak', value: 3 }
  },
  {
    id: 'streak_7_days',
    name: 'Dedicated',
    description: '7-day activity streak',
    icon: '🔥🔥',
    points: 150,
    category: 'milestone',
    requirement: { type: 'streak', value: 7 }
  },
  {
    id: 'streak_30_days',
    name: 'Unstoppable',
    description: '30-day activity streak',
    icon: '🔥🔥🔥',
    points: 500,
    category: 'milestone',
    requirement: { type: 'streak', value: 30 }
  },
];

class GamificationService {
  private readonly STORAGE_KEY = 'zeroFoodHero_gamification';

  // Get user stats from localStorage
  private loadUserStats(userId: string): UserStats {
    if (typeof window === 'undefined') {
      return this.getDefaultStats();
    }

    try {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
      if (!stored) {
        return this.getDefaultStats();
      }

      const stats = JSON.parse(stored);
      return {
        ...stats,
        lastActivity: new Date(stats.lastActivity),
        achievements: stats.achievements.map((a: any) => ({
          ...a,
          unlockedAt: a.unlockedAt ? new Date(a.unlockedAt) : undefined
        }))
      };
    } catch (error) {
      console.error('Error loading user stats:', error);
      return this.getDefaultStats();
    }
  }

  // Save user stats to localStorage
  private saveUserStats(userId: string, stats: UserStats): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${this.STORAGE_KEY}_${userId}`, JSON.stringify(stats));
  }

  // Get default stats for new users
  private getDefaultStats(): UserStats {
    return {
      totalPoints: 0,
      currentLevel: 1,
      levelProgress: 0,
      achievements: ACHIEVEMENTS.map(achievement => ({
        ...achievement,
        unlocked: false
      })),
      streak: 0,
      lastActivity: new Date(),
      totalDonations: 0,
      totalFoodSaved: 0,
      totalDeliveries: 0
    };
  }

  // Calculate level and progress
  private calculateLevel(points: number): { level: number; progress: number } {
    let level = 1;
    let progress = 0;

    for (let i = 0; i < LEVELS.length; i++) {
      if (points >= LEVELS[i].pointsRequired) {
        level = LEVELS[i].level;
        if (i < LEVELS.length - 1) {
          const currentLevelPoints = LEVELS[i].pointsRequired;
          const nextLevelPoints = LEVELS[i + 1].pointsRequired;
          const pointsInLevel = points - currentLevelPoints;
          const pointsNeededForNext = nextLevelPoints - currentLevelPoints;
          progress = (pointsInLevel / pointsNeededForNext) * 100;
        } else {
          progress = 100;
        }
      } else {
        break;
      }
    }

    return { level, progress };
  }

  // Check and unlock achievements
  private checkAchievements(stats: UserStats): { newAchievements: Achievement[]; updatedStats: UserStats } {
    const newAchievements: Achievement[] = [];
    const updatedAchievements = stats.achievements.map(achievement => {
      if (achievement.unlocked) return achievement;

      let shouldUnlock = false;
      switch (achievement.requirement.type) {
        case 'donations':
          shouldUnlock = stats.totalDonations >= achievement.requirement.value;
          break;
        case 'food_saved':
          shouldUnlock = stats.totalFoodSaved >= achievement.requirement.value;
          break;
        case 'deliveries':
          shouldUnlock = stats.totalDeliveries >= achievement.requirement.value;
          break;
        case 'streak':
          shouldUnlock = stats.streak >= achievement.requirement.value;
          break;
      }

      if (shouldUnlock) {
        const unlockedAchievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date()
        };
        newAchievements.push(unlockedAchievement);
        return unlockedAchievement;
      }

      return achievement;
    });

    const updatedStats = {
      ...stats,
      achievements: updatedAchievements
    };

    return { newAchievements, updatedStats };
  }

  // Add points to user
  public addPoints(userId: string, points: number, reason: string): UserStats {
    const stats = this.loadUserStats(userId);
    const oldLevel = stats.currentLevel;
    
    stats.totalPoints += points;
    stats.lastActivity = new Date();
    
    // Update streak
    const now = new Date();
    const lastActivity = new Date(stats.lastActivity);
    const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) {
      stats.streak += 1;
    } else if (daysDiff > 1) {
      stats.streak = 1;
    }

    // Calculate new level
    const { level, progress } = this.calculateLevel(stats.totalPoints);
    stats.currentLevel = level;
    stats.levelProgress = progress;

    // Check achievements
    const { newAchievements, updatedStats } = this.checkAchievements(stats);

    // Save updated stats
    this.saveUserStats(userId, updatedStats);

    // Log the action
    console.log(`Added ${points} points to user ${userId} for: ${reason}`);
    if (newAchievements.length > 0) {
      console.log(`Unlocked achievements:`, newAchievements.map(a => a.name));
    }
    if (level > oldLevel) {
      console.log(`User ${userId} reached level ${level}!`);
    }

    return updatedStats;
  }

  // Update user stats based on actions
  public updateStats(userId: string, action: 'donation_created' | 'donation_delivered' | 'donation_picked' | 'volunteer_pickup' | 'volunteer_delivery' | 'social_share', data?: any): UserStats {
    let points = 0;
    let reason = '';

    switch (action) {
      case 'donation_created':
        points = POINTS_SYSTEM.DONATION_CREATED;
        reason = 'Created a donation';
        break;
      case 'donation_delivered':
        points = POINTS_SYSTEM.DONATION_DELIVERED;
        reason = 'Donation was delivered';
        break;
      case 'donation_picked':
        points = POINTS_SYSTEM.DONATION_PICKED_UP;
        reason = 'Donation was picked up';
        break;
      case 'volunteer_pickup':
        points = POINTS_SYSTEM.VOLUNTEER_PICKUP;
        reason = 'Picked up a donation as volunteer';
        break;
      case 'volunteer_delivery':
        points = POINTS_SYSTEM.VOLUNTEER_DELIVERY;
        reason = 'Delivered a donation as volunteer';
        break;
      case 'social_share':
        points = POINTS_SYSTEM.SOCIAL_SHARE;
        reason = 'Shared impact on social media';
        break;
    }

    return this.addPoints(userId, points, reason);
  }

  // Get user stats
  public getUserStats(userId: string): UserStats {
    return this.loadUserStats(userId);
  }

  // Get current level info
  public getCurrentLevel(userId: string): UserLevel {
    const stats = this.getUserStats(userId);
    return LEVELS.find(level => level.level === stats.currentLevel) || LEVELS[0];
  }

  // Get next level info
  public getNextLevel(userId: string): UserLevel | null {
    const stats = this.getUserStats(userId);
    const nextLevel = LEVELS.find(level => level.level === stats.currentLevel + 1);
    return nextLevel || null;
  }

  // Get leaderboard (mock data for now)
  public getLeaderboard(): LeaderboardEntry[] {
    // In a real app, this would fetch from a database
    return [
      { userId: '1', userName: 'Food Hero', points: 2500, level: 8, achievements: 15, rank: 1 },
      { userId: '2', userName: 'Green Thumb', points: 1800, level: 6, achievements: 12, rank: 2 },
      { userId: '3', userName: 'Community Helper', points: 1200, level: 5, achievements: 10, rank: 3 },
      { userId: '4', userName: 'Fresh Start', points: 800, level: 4, achievements: 8, rank: 4 },
      { userId: '5', userName: 'Local Hero', points: 600, level: 3, achievements: 6, rank: 5 },
    ];
  }

  // Reset user stats (for testing)
  public resetUserStats(userId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${this.STORAGE_KEY}_${userId}`);
  }
}

export const gamificationService = new GamificationService(); 