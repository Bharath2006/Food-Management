'use client';
// This page is for demo purposes to show the authentication system in action
import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { userStorage } from '@/app/lib/user-storage';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  Activity, 
  Users, 
  Eye, 
  EyeOff,
  RefreshCw
} from 'lucide-react';

export default function DemoPage() {
  const { user, signOut } = useAuth();
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAllUsers = () => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      // This would normally be a private method, but for demo purposes we'll access it
      const users = JSON.parse(localStorage.getItem('zeroFoodHero_users') || '[]');
      setAllUsers(users);
      setIsLoading(false);
    }, 1000);
  };

  const clearAllData = () => {
    if (confirm('This will clear all user data. Are you sure?')) {
      localStorage.removeItem('zeroFoodHero_users');
      localStorage.removeItem('zeroFoodHero_currentUser');
      window.location.reload();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Demo</h1>
          <p className="text-gray-600 mb-6">Please sign in to view the demo</p>
          <button
            onClick={() => window.location.href = '/auth/signin'}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Authentication System Demo</h1>
          <p className="text-gray-600">Showing user data persistence and activity tracking</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Current User Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Current User</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{user.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={signOut}
                  className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>

          {/* User Activities */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">User Activities</h2>
            </div>
            
            <div className="space-y-3">
              {userStorage.getUserActivities(user.id).map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">📝</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {userStorage.getUserActivities(user.id).length === 0 && (
                <p className="text-gray-500 text-center py-4">No activities yet</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Admin Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">System Data</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAllUsers(!showAllUsers)}
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
              >
                {showAllUsers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showAllUsers ? 'Hide' : 'Show'} All Users</span>
              </button>
            </div>
          </div>

          {showAllUsers && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={loadAllUsers}
                  disabled={isLoading}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Load All Users</span>
                </button>
                <button
                  onClick={clearAllData}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Clear All Data
                </button>
              </div>

              {allUsers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Registered Users ({allUsers.length})</h3>
                  {allUsers.map((userData, index) => (
                    <div
                      key={userData.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{userData.name}</p>
                        <p className="text-sm text-gray-500">{userData.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{userData.role}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(userData.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Demo Instructions</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Sign up with a new email to create an account</li>
              <li>• Sign in with the same email to see your data persists</li>
              <li>• Try signing up with the same email - it will show an error</li>
              <li>• Check the profile page to see your activity history</li>
              <li>• Use the QR scanner to add donation activities</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 