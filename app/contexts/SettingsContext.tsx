'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showPhone: boolean;
    allowLocationSharing: boolean;
    dataCollection: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordChangeRequired: boolean;
    loginNotifications: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    donationAlerts: boolean;
    volunteerRequests: boolean;
    ngoUpdates: boolean;
    marketingEmails: boolean;
    soundEnabled: boolean;
  };
  language: {
    language: string;
    region: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
  };
}

const defaultSettings: Settings = {
  privacy: {
    profileVisibility: 'public',
    showEmail: true,
    showPhone: false,
    allowLocationSharing: true,
    dataCollection: true,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordChangeRequired: false,
    loginNotifications: true,
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    donationAlerts: true,
    volunteerRequests: true,
    ngoUpdates: true,
    marketingEmails: false,
    soundEnabled: true,
  },
  language: {
    language: 'English',
    region: 'United States',
    timezone: 'UTC-5',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  },
  appearance: {
    theme: 'light',
    fontSize: 'medium',
    compactMode: false,
  },
};

interface SettingsContextType {
  settings: Settings;
  updateSetting: (category: keyof Settings, key: string, value: any) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetSettings: () => void;
  saveSettings: () => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const updateSetting = (category: keyof Settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('userSettings');
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    settings,
    updateSetting,
    updateSettings,
    resetSettings,
    saveSettings,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 