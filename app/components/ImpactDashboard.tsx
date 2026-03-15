'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Leaf, 
  Droplets, 
  Utensils, 
  Award,
  Target,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { calculateImpactMetrics, formatLargeNumber, getImpactBadge } from '@/app/lib/utils';
import { Donation } from '@/app/types';

interface ImpactDashboardProps {
  donations: Donation[];
  user?: any;
}

export default function ImpactDashboard({ donations, user }: ImpactDashboardProps) {
  const metrics = calculateImpactMetrics(donations);
  const badge = getImpactBadge(metrics.totalFoodSaved);

  const impactCards = [
    {
      title: 'Food Saved',
      value: `${metrics.totalFoodSaved} kg`,
      icon: Leaf,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Total food rescued from waste'
    },
    {
      title: 'Meals Provided',
      value: formatLargeNumber(metrics.mealsProvided),
      icon: Utensils,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Estimated meals provided'
    },
    {
      title: 'CO₂ Saved',
      value: `${metrics.co2Saved} kg`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Carbon emissions avoided'
    },
    {
      title: 'Water Saved',
      value: `${formatLargeNumber(metrics.waterSaved)} L`,
      icon: Droplets,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      description: 'Water resources conserved'
    }
  ];

  const statusCards = [
    {
      title: 'Total Donations',
      value: metrics.totalDonations,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      title: 'Delivered',
      value: metrics.deliveredDonations,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'In Transit',
      value: metrics.pickedDonations,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending',
      value: metrics.pendingDonations,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Impact Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow-lg p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Your Impact Dashboard</h2>
            <p className="text-green-100">Making a difference, one donation at a time</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${badge.color} text-white`}>
              <span className="text-2xl">{badge.icon}</span>
              <span className="font-semibold">{badge.name}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {impactCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold mb-1">{card.value}</div>
                <div className="text-sm text-green-100">{card.title}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Detailed Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Impact Metrics */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-600" />
            Impact Metrics
          </h3>
          <div className="space-y-4">
            {impactCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-lg ${card.bgColor}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${card.bgColor}`}>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{card.title}</div>
                      <div className="text-sm text-gray-600">{card.description}</div>
                    </div>
                  </div>
                  <div className={`text-xl font-bold ${card.color}`}>
                    {card.value}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Donation Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Donation Status
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {statusCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`text-center p-4 rounded-lg ${card.bgColor}`}
              >
                <div className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </div>
                <div className="text-sm text-gray-600">{card.title}</div>
              </motion.div>
            ))}
          </div>
          
          {/* Completion Rate */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Completion Rate</span>
              <span className="text-sm font-bold text-green-600">{metrics.completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metrics.completionRate}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-green-500 h-2 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      {donations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-purple-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {donations.slice(0, 5).map((donation, index) => (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{donation.foodType}</div>
                    <div className="text-sm text-gray-600">
                      {donation.quantity} {donation.unit} • {donation.status}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(donation.createdAt).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
} 