'use client';

import { useNotifications } from '@/app/contexts/NotificationContext';
import { useSettings } from '@/app/contexts/SettingsContext';

export default function TestNotificationsPage() {
  const { addNotification } = useNotifications();
  const { settings, updateSetting } = useSettings();

  const testNotifications = () => {
    addNotification({
      type: 'system',
      title: 'Success!',
      message: 'This is a success notification',
    });

    setTimeout(() => {
      addNotification({
        type: 'system',
        title: 'Error!',
        message: 'This is an error notification',
      });
    }, 500);

    setTimeout(() => {
      addNotification({
        type: 'system',
        title: 'Warning!',
        message: 'This is a warning notification',
      });
    }, 1000);

    setTimeout(() => {
      addNotification({
        type: 'system',
        title: 'Info!',
        message: 'This is an info notification',
      });
    }, 1500);
  };

  const toggleNotifications = () => {
    updateSetting('notifications', 'pushNotifications', !settings.notifications.pushNotifications);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Notification System Test</h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Current Settings</h2>
              <p className="text-blue-800">
                Push Notifications: <span className="font-semibold">{settings.notifications.pushNotifications ? 'Enabled' : 'Disabled'}</span>
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={testNotifications}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                Test All Notifications
              </button>

              <button
                onClick={toggleNotifications}
                className={`w-full py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  settings.notifications.pushNotifications
                    ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                    : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                }`}
              >
                {settings.notifications.pushNotifications ? 'Disable' : 'Enable'} Notifications
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instructions</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• Click "Test All Notifications" to see different types of notifications</li>
                <li>• Use the toggle button to enable/disable notifications</li>
                <li>• When disabled, no notifications will appear</li>
                <li>• Notifications will auto-dismiss after their duration</li>
                <li>• You can manually close notifications by clicking the X button</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 