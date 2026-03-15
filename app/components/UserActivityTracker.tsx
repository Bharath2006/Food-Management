'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { userStorage, UserActivity } from '@/app/lib/user-storage';
import { Calendar, Clock, Activity } from 'lucide-react';

export default function UserActivityTracker() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<UserActivity[]>([]);

  useEffect(() => {
    if (user) {
      const userActivities = userStorage.getUserActivities(user.id);
      setActivities(userActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    }
  }, [user]);

  const getActivityIcon = (type: UserActivity['type']) => {
    switch (type) {
      case 'signup':
        return '👤';
      case 'login':
        return '🔑';
      case 'donation':
        return '🍽️';
      case 'pickup':
        return '📦';
      case 'delivery':
        return '🚚';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type: UserActivity['type']) => {
    switch (type) {
      case 'signup':
        return 'text-blue-600 bg-blue-50';
      case 'login':
        return 'text-green-600 bg-green-50';
      case 'donation':
        return 'text-purple-600 bg-purple-50';
      case 'pickup':
        return 'text-orange-600 bg-orange-50';
      case 'delivery':
        return 'text-emerald-600 bg-emerald-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">Your Activity History</h3>
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No activities yet. Start using the app to see your history!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.description}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 