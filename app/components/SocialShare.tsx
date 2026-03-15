'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Copy,
  Check,
  Award
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useNotifications } from '@/app/contexts/NotificationContext';
import { gamificationService } from '@/app/lib/gamification';

interface SocialShareProps {
  impact?: {
    totalFoodSaved: number;
    mealsProvided: number;
    co2Saved: number;
    totalDonations: number;
  };
  className?: string;
}

export default function SocialShare({ impact, className = '' }: SocialShareProps) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState<string[]>([]);

  const defaultImpact = {
    totalFoodSaved: 25.5,
    mealsProvided: 51,
    co2Saved: 63.75,
    totalDonations: 12
  };

  const currentImpact = impact || defaultImpact;

  const shareText = `🌱 I've saved ${currentImpact.totalFoodSaved}kg of food from waste with Zero Food Hero! 
  
🍽️ That's ${currentImpact.mealsProvided} meals provided to people in need
🌍 And ${currentImpact.co2Saved}kg of CO₂ emissions avoided

Join me in fighting food waste and hunger! #ZeroFoodHero #FoodWaste #Sustainability`;

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://zero-food-hero.vercel.app';

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'text-blue-500 hover:bg-blue-50',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600 hover:bg-blue-50',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-700 hover:bg-blue-50',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: 'text-pink-500 hover:bg-pink-50',
      url: `https://www.instagram.com/`
    }
  ];

  const handleShare = async (platform: string, url: string) => {
    if (platform === 'Instagram') {
      // Instagram doesn't support direct sharing, so we'll copy the text
      handleCopyText();
      return;
    }

    try {
      window.open(url, '_blank', 'width=600,height=400');
      
      // Add points for social sharing
      if (user && !shared.includes(platform)) {
        gamificationService.updateStats(user.id, 'social_share', { platform });
        setShared(prev => [...prev, platform]);
        
        addNotification({
          type: 'achievement',
          title: 'Social Impact! 🌟',
          message: `You earned 5 points for sharing on ${platform}! Keep spreading the word!`,
          actionUrl: '/donor/dashboard'
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      
      // Add points for copying
      if (user) {
        gamificationService.updateStats(user.id, 'social_share', { platform: 'copy' });
        
        addNotification({
          type: 'achievement',
          title: 'Shared! 📋',
          message: 'Impact text copied to clipboard! You earned 5 points for sharing!',
          actionUrl: '/donor/dashboard'
        });
      }
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying text:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-lg p-6 ${className}`}
    >
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Share2 className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Share Your Impact</h3>
          <Award className="w-6 h-6 text-yellow-600" />
        </div>
        <p className="text-gray-600">
          Share your food-saving journey and inspire others to join the movement!
        </p>
      </div>

      {/* Impact Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-green-600">{currentImpact.totalFoodSaved}kg</div>
            <div className="text-sm text-gray-600">Food Saved</div>
          </div>
          <div>
            <div className="text-xl font-bold text-blue-600">{currentImpact.mealsProvided}</div>
            <div className="text-sm text-gray-600">Meals Provided</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-600">{currentImpact.co2Saved}kg</div>
            <div className="text-sm text-gray-600">CO₂ Saved</div>
          </div>
          <div>
            <div className="text-xl font-bold text-orange-600">{currentImpact.totalDonations}</div>
            <div className="text-sm text-gray-600">Donations</div>
          </div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {shareLinks.map((platform) => {
            const Icon = platform.icon;
            return (
              <motion.button
                key={platform.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShare(platform.name, platform.url)}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                  shared.includes(platform.name) 
                    ? 'bg-green-50 border-green-200 text-green-600' 
                    : `${platform.color} border-gray-200 hover:border-gray-300`
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{platform.name}</span>
                {shared.includes(platform.name) && (
                  <Check className="w-4 h-4" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Copy Text Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopyText}
          className={`w-full flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
            copied 
              ? 'bg-green-50 border-green-200 text-green-600' 
              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              <span className="font-medium">Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              <span className="font-medium">Copy Impact Text</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Points Info */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-yellow-800">
          <Award className="w-4 h-4" />
          <span>Earn 5 points for each platform you share on!</span>
        </div>
      </div>
    </motion.div>
  );
} 