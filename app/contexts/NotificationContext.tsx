'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Donation } from '@/app/types';

export interface Notification {
  id: string;
  type: 'donation' | 'pickup' | 'delivery' | 'system' | 'achievement';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
  actionUrl?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zeroFoodHero_notifications');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const notificationsWithDates = parsed.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }));
          setNotifications(notificationsWithDates);
        } catch (error) {
          console.error('Error loading notifications:', error);
        }
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('zeroFoodHero_notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep only last 50 notifications

    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: '/favicon.ico',
        tag: newNotification.id
      });
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      removeNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Helper functions for creating specific types of notifications
export function createDonationNotification(donation: Donation): Omit<Notification, 'id' | 'timestamp' | 'read'> {
  return {
    type: 'donation',
    title: 'New Donation Available!',
    message: `${donation.foodType} (${donation.quantity} ${donation.unit}) is available for pickup near ${donation.location?.address || 'your area'}`,
    data: { donationId: donation.id },
    actionUrl: `/scan/${donation.id}`
  };
}

export function createPickupNotification(donation: Donation, volunteerName: string): Omit<Notification, 'id' | 'timestamp' | 'read'> {
  return {
    type: 'pickup',
    title: 'Donation Picked Up!',
    message: `${volunteerName} has picked up your donation of ${donation.foodType}`,
    data: { donationId: donation.id, volunteerName },
    actionUrl: `/donor/dashboard`
  };
}

export function createDeliveryNotification(donation: Donation, ngoName: string): Omit<Notification, 'id' | 'timestamp' | 'read'> {
  return {
    type: 'delivery',
    title: 'Donation Delivered!',
    message: `Your donation of ${donation.foodType} has been delivered to ${ngoName}`,
    data: { donationId: donation.id, ngoName },
    actionUrl: `/donor/dashboard`
  };
}

export function createAchievementNotification(achievement: string): Omit<Notification, 'id' | 'timestamp' | 'read'> {
  return {
    type: 'achievement',
    title: 'Achievement Unlocked! 🏆',
    message: `Congratulations! You've earned the "${achievement}" achievement!`,
    data: { achievement },
    actionUrl: `/donor/dashboard`
  };
} 