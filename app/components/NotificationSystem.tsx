'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertTriangle, Info, Award, Truck, Package } from 'lucide-react';
import { useSettings } from '@/app/contexts/SettingsContext';
import { useNotifications, Notification } from '@/app/contexts/NotificationContext';

export default function NotificationSystem() {
  const { settings } = useSettings();
  const { notifications, removeNotification } = useNotifications();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'donation':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'pickup':
        return <Truck className="w-5 h-5 text-green-500" />;
      case 'delivery':
        return <CheckCircle className="w-5 h-5 text-purple-500" />;
      case 'achievement':
        return <Award className="w-5 h-5 text-yellow-500" />;
      case 'system':
        return <Info className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationStyles = (type: Notification['type']) => {
    switch (type) {
      case 'donation':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'pickup':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'delivery':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'achievement':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'system':
        return 'bg-gray-50 border-gray-200 text-gray-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  // Auto-remove notifications after 5 seconds (for system notifications)
  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.type === 'system' && !notification.read) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, removeNotification]);

  // Don't show notifications if user has disabled them
  if (!settings.notifications.pushNotifications) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.filter(n => n.type === 'system' && !n.read).map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`max-w-sm w-full p-4 rounded-lg border shadow-lg ${getNotificationStyles(
              notification.type
            )}`}
          >
            <div className="flex items-start space-x-3">
              {getNotificationIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium">{notification.title}</h4>
                <p className="text-sm mt-1">{notification.message}</p>
                <p className="text-xs opacity-75 mt-2">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 