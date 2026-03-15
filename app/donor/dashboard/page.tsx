'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus,
  QrCode as QrCodeIcon, 
  Clock, 
  MapPin, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Download,
  TrendingUp,
  Heart,
  Users,
  Award,
  BarChart3,
  Calendar,
  Package,
  Home,
  Settings,
  Bell
} from 'lucide-react';
import { generateDonationId, generateQRCode, generateSimpleQRCode, formatDate, calculateImpactMetrics } from '@/app/lib/utils';
import { Donation } from '@/app/types';
import QRCode from 'react-qr-code';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LocationPicker from '@/app/components/LocationPicker';
import { Location, LocationService } from '@/app/lib/location-service';
import { donationStorage } from '@/app/lib/donation-storage';
import { useAuth } from '@/app/contexts/AuthContext';
import ImpactDashboard from '@/app/components/ImpactDashboard';
import { useNotifications, createAchievementNotification } from '@/app/contexts/NotificationContext';
import { gamificationService } from '@/app/lib/gamification';
import GamificationDashboard from '@/app/components/GamificationDashboard';
import SocialShare from '@/app/components/SocialShare';

export default function DonorDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { addNotification } = useNotifications();
  const router = useRouter();
  
  // State
  const [donations, setDonations] = useState<Donation[]>([]);
  const [currentDonation, setCurrentDonation] = useState<Partial<Donation> | null>(null);
  const [donationLocation, setDonationLocation] = useState<Location | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'add-new' | 'donations'>('overview');

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        router.push('/auth/signin');
        return;
      }
      // Only allow access if user is a donor
      if (user.role !== 'donor') {
        router.push('/'); // Send to home if not a donor
        return;
      }
      setIsLoading(false);
    }
  }, [isAuthenticated, user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'donor') {
      const loadDonorDonations = async () => {
        try {
          setIsLoading(true);
          const storedDonations = await donationStorage.getDonationsByDonor(user.id);
          setDonations(storedDonations);
          setError(null);
        } catch (err) {
          console.error('Error loading donations:', err);
          setError('Failed to load donations. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      loadDonorDonations();
    }
  }, [user]);

  const startNewDonation = () => {
    if (!user) return;
    
    const donationId = generateDonationId();
    setCurrentDonation({
      id: donationId,
      createdAt: new Date(),
      status: 'available',
      donorId: user.id,
      donorName: user.name,
      updatedAt: new Date(),
      foodType: '',
      quantity: 1,
      unit: 'kg',
      foodCategory: 'other',
      expiry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Default 3 days
    });
  };

  const handleSaveDonation = async () => {
    if (!currentDonation) {
      alert('No donation to save.');
      return;
    }

    if (!currentDonation.foodType || !currentDonation.quantity || !currentDonation.unit) {
      alert('Please fill in all required fields: Food Type, Quantity, and Unit.');
      return;
    }

    if (!currentDonation.expiry || isNaN(currentDonation.expiry.getTime())) {
      currentDonation.expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    // Accept location even if just address is provided (coordinates will be generated)
    if (!currentDonation.location || !currentDonation.location.address) {
      alert('Please enter a pickup location address.');
      return;
    }

    // Ensure location has coordinates (generate if missing)
    if (!currentDonation.location.lat || !currentDonation.location.lng) {
      const coords = LocationService.generateCoordinatesFromAddress(currentDonation.location.address);
      currentDonation.location.lat = coords.lat;
      currentDonation.location.lng = coords.lng;
    }

    try {
      // Ensure all required fields are set
      const donationData: Omit<Donation, 'id'> = {
        foodType: currentDonation.foodType,
        foodCategory: currentDonation.foodCategory || 'other',
        quantity: currentDonation.quantity,
        unit: currentDonation.unit,
        expiry: currentDonation.expiry,
        status: (currentDonation.status as any) || 'available',
        donorId: user?.id || 'unknown',
        donorName: user?.name || 'Unknown Donor',
        location: currentDonation.location as any,
        createdAt: currentDonation.createdAt || new Date(),
        updatedAt: new Date(),
        description: currentDonation.description || '',
        qrCode: currentDonation.qrCode || generateQRCode(`temp-${Date.now()}`)
      };

      const donationId = await donationStorage.addDonation(donationData);
      const finalDonation = { ...donationData, id: donationId };
      
      setDonations(prev => [finalDonation, ...prev]);
      setCurrentDonation(null);
      
      addNotification({
        type: 'donation',
        title: 'Donation Created Successfully! 🎉',
        message: `Your donation of ${finalDonation.foodType} (${finalDonation.quantity} ${finalDonation.unit}) has been posted and is now available for pickup.`,
        actionUrl: `/scan/details?id=${donationId}`
      });

      if (user) {
        try {
          const updatedStats = gamificationService.updateStats(user.id, 'donation_created', {
            foodType: finalDonation.foodType,
            quantity: finalDonation.quantity,
            unit: finalDonation.unit
          });

          const oldLevel = updatedStats.currentLevel;
          const newAchievements = updatedStats.achievements.filter(a => a.unlocked && a.unlockedAt && 
            new Date(a.unlockedAt).getTime() > Date.now() - 1000);

          newAchievements.forEach(achievement => {
            addNotification(createAchievementNotification(achievement.name));
          });

          if (updatedStats.currentLevel > oldLevel) {
            const currentLevel = gamificationService.getCurrentLevel(user.id);
            addNotification({
              type: 'achievement',
              title: `Level Up! 🎉`,
              message: `Congratulations! You've reached Level ${updatedStats.currentLevel} - ${currentLevel.title}!`,
              actionUrl: '/donor/dashboard'
            });
          }
        } catch (error) {
          console.error('Error updating gamification stats:', error);
        }
      }
      
      alert('Donation saved successfully!');
    } catch (error) {
      console.error('Error saving donation:', error);
      setError('Failed to save donation. Please try again.');
    }
  };

  const handleDeleteDonation = async (id: string) => {
    try {
      await donationStorage.deleteDonation(id);
      setDonations(prev => prev.filter(d => d.id !== id));
      alert('Donation deleted successfully');
    } catch (error) {
      console.error('Error deleting donation:', error);
      setError('Failed to delete donation. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'picked': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalDonations = donations.length;
  const pendingDonations = donations.filter(d => d.status === 'pending').length;
  const deliveredDonations = donations.filter(d => d.status === 'delivered').length;
  const impactMetrics = calculateImpactMetrics(donations);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-gray-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-sm w-full bg-white rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <h1 className="text-lg font-medium text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-medium text-gray-900 mb-3">Sign in required</h1>
          <p className="text-gray-600 text-sm mb-4">Please sign in to access the dashboard.</p>
          <Link
            href="/auth/signin"
            className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-medium text-gray-900">Donor Dashboard</h1>
            <Link
              href="/scan"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <QrCodeIcon className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Simple Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: Home },
              { id: 'add-new', label: 'Add Donation', icon: Plus },
              { id: 'donations', label: 'Donations', icon: Package }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Simple Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{totalDonations}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{pendingDonations}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{deliveredDonations}</p>
                <p className="text-sm text-gray-600">Delivered</p>
              </div>
            </div>

            {/* Impact Dashboard */}
            <div className="bg-white rounded-lg p-6">
              <ImpactDashboard donations={donations} />
            </div>

            {/* Gamification Dashboard */}
            <div className="bg-white rounded-lg p-6">
              <GamificationDashboard />
            </div>

            {/* Social Share */}
            <div className="bg-white rounded-lg p-6">
              <SocialShare impact={impactMetrics} />
            </div>
          </div>
        )}

        {/* Add Donation Tab */}
        {activeTab === 'add-new' && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 font-bold">Add New Donation</h2>
              
              {!currentDonation ? (
                <button
                  onClick={startNewDonation}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-900 text-white p-8 rounded-lg border-2 border-dashed border-gray-400 hover:bg-gray-800 transition-all group"
                >
                  <Plus className="w-8 h-8 text-gray-400 group-hover:scale-110 transition-transform" />
                  <span className="text-lg font-medium">Click to create new donation</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Food Type</label>
                      <input
                        type="text"
                        value={currentDonation.foodType || ''}
                        onChange={(e) => setCurrentDonation(prev => ({ ...prev, foodType: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                        placeholder="e.g., Rice, Bread"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={currentDonation.foodCategory || ''}
                        onChange={(e) => setCurrentDonation(prev => ({ ...prev, foodCategory: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                      >
                        <option value="other">Select</option>
                        <option value="bread">Bread & Bakery</option>
                        <option value="fruits">Fruits</option>
                        <option value="vegetables">Vegetables</option>
                        <option value="dairy">Dairy</option>
                        <option value="meat">Meat</option>
                        <option value="canned">Canned Food</option>
                        <option value="baked">Baked Goods</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={currentDonation.quantity || ''}
                        onChange={(e) => setCurrentDonation(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                      <select
                        value={currentDonation.unit || ''}
                        onChange={(e) => setCurrentDonation(prev => ({ ...prev, unit: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="l">l</option>
                        <option value="piece">piece</option>
                        <option value="serving">serving</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Expires</label>
                    <input
                      type="datetime-local"
                      value={currentDonation.expiry ? new Date(currentDonation.expiry).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setCurrentDonation(prev => ({ ...prev, expiry: new Date(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={currentDonation.description || ''}
                      onChange={(e) => setCurrentDonation(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm h-20"
                      placeholder="Special instructions or details..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pickup Location</label>
                    <LocationPicker
                      onLocationSelect={(location) => {
                        setDonationLocation(location);
                        setCurrentDonation(prev => ({ 
                          ...prev, 
                          location: {
                            lat: location.lat,
                            lng: location.lng,
                            address: location.address
                          }
                        }));
                      }}
                      currentLocation={donationLocation}
                      placeholder="Pickup address..."
                      className="text-sm"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={handleSaveDonation}
                      className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                      Post Donation
                    </button>
                    <button
                      onClick={() => {
                        setCurrentDonation(null);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div className="bg-white rounded-lg">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">My Donations</h2>
              
              {donations.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No donations yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {donations.map((donation) => (
                    <div
                      key={donation.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900 text-sm">{donation.foodType}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(donation.status)}`}>
                              {donation.status}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>{donation.quantity} {donation.unit}</p>
                            <p>Expires: {formatDate(donation.expiry)}</p>
                          </div>

                          {donation.qrCode && (
                            <div className="mt-3 text-center">
                              <QRCode 
                                value={generateSimpleQRCode(donation)} 
                                size={80}
                                className="mx-auto"
                              />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {donation.status === 'available' && (
                            <button
                              onClick={async () => {
                                try {
                                  // Cancel donation by updating status
                                  await donationStorage.updateDonation(donation.id, { status: 'expired' });
                                  setDonations(prev => prev.filter(d => d.id !== donation.id));
                                  alert('Donation cancelled successfully');
                                } catch (error) {
                                  console.error('Error cancelling donation:', error);
                                  alert('Failed to cancel donation.');
                                }
                              }}
                              className="text-gray-400 hover:text-yellow-600 p-1"
                              title="Cancel donation"
                            >
                              <AlertCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteDonation(donation.id)}
                            className="text-gray-400 hover:text-red-600 p-1"
                            title="Delete donation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 