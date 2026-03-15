'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Package, 
  Truck, 
  Navigation,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Phone,
  Mail,
  Map,
  Target,
  Route,
  Search,
  Filter
} from 'lucide-react';
import { Donation } from '@/app/types';
import { LocationService, Location } from '@/app/lib/location-service';
import { formatDate } from '@/app/lib/utils';
import { donationStorage } from '@/app/lib/donation-storage';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MyMissions() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [activeMissions, setActiveMissions] = useState<(Donation & { distance: number })[]>([]);
  const [completedMissions, setCompletedMissions] = useState<(Donation & { distance: number })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [volunteerLocation, setVolunteerLocation] = useState<Location | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'picked' | 'in_transit' | 'delivered'>('all');

  const loadMissions = useCallback(() => {
    if (!user) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      const allDonations = donationStorage.getAllDonations();
      
      // Filter missions where volunteer is assigned
      const volunteerMissions = allDonations.filter(d => 
        d.volunteerId === user.id && 
        (d.status === 'picked' || d.status === 'in_transit' || d.status === 'delivered')
      );

      // Calculate distances if volunteer location is available
      const missionsWithDistance = volunteerMissions.map(mission => {
        let distance = 0;
        if (volunteerLocation) {
          distance = LocationService.calculateDistance(
            volunteerLocation.lat,
            volunteerLocation.lng,
            mission.location.lat,
            mission.location.lng
          );
        }
        return { ...mission, distance };
      });

      // Separate active and completed missions
      const active = missionsWithDistance.filter(m => 
        m.status === 'picked' || m.status === 'in_transit'
      );
      const completed = missionsWithDistance.filter(m => 
        m.status === 'delivered'
      );

      setActiveMissions(active);
      setCompletedMissions(completed);
      setIsLoading(false);
    }, 300);
  }, [user, volunteerLocation]);

  // Check authentication
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        router.push('/auth/signin');
        return;
      }
      if (user.role !== 'volunteer') {
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Load volunteer's location from localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem('volunteerLocation');
    if (savedLocation) {
      try {
        setVolunteerLocation(JSON.parse(savedLocation));
      } catch (error) {
        console.error('Error parsing saved location:', error);
      }
    }
  }, []);

  // Load missions
  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  const handleUpdateStatus = async (missionId: string, newStatus: 'in_transit' | 'delivered') => {
    setIsLoading(true);
    
    try {
      donationStorage.updateDonation(missionId, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Reload missions
      loadMissions();
    } catch (error) {
      console.error('Error updating mission status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredActiveMissions = activeMissions.filter(mission => {
    const matchesSearch = 
      mission.foodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mission.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || mission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredCompletedMissions = completedMissions.filter(mission => {
    const matchesSearch = 
      mission.foodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mission.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mission.location?.address?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    return matchesSearch;
  });

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Missions</h1>
              <p className="text-gray-600">Track and manage your active delivery missions</p>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-6 h-6 text-blue-600" />
              <span className="text-sm text-gray-600">Mission Control</span>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search food, donor, or location..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'picked' | 'in_transit' | 'delivered')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="picked">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stats Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mission Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Active Missions</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{activeMissions.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Completed</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{completedMissions.length}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Total Items</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">
                    {activeMissions.reduce((sum, m) => sum + m.quantity, 0) + 
                     completedMissions.reduce((sum, m) => sum + m.quantity, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Missions List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Missions */}
            {filteredActiveMissions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Active Missions</h2>
                  <span className="text-sm text-gray-600">{filteredActiveMissions.length} active</span>
                </div>
                <div className="space-y-4">
                  {filteredActiveMissions.map((mission, index) => (
                    <motion.div
                      key={mission.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Package className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">{mission.foodType}</h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {mission.status === 'picked' ? 'Picked Up' : 'In Transit'}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Quantity:</span>
                              <span>{mission.quantity} {mission.unit}</span>
                            </div>
                            {mission.ngoName && mission.ngoLocation && (
                              <>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="w-4 h-4 text-red-600" />
                                  <span className="font-medium">Pickup From:</span>
                                  <span>{mission.location.address}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Target className="w-4 h-4 text-green-600" />
                                  <span className="font-medium">Deliver To:</span>
                                  <span>{mission.ngoName} - {mission.ngoLocation.address}</span>
                                </div>
                              </>
                            )}
                            {!mission.ngoLocation && (
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span>{mission.location.address}</span>
                              </div>
                            )}
                            {volunteerLocation && mission.ngoLocation && (
                              <div className="flex items-center space-x-2">
                                <Route className="w-4 h-4" />
                                <span>Delivery Distance: {LocationService.formatDistance(
                                  LocationService.calculateDistance(
                                    volunteerLocation.lat,
                                    volunteerLocation.lng,
                                    mission.ngoLocation.lat,
                                    mission.ngoLocation.lng
                                  )
                                )}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          {mission.status === 'picked' && (
                            <button
                              onClick={() => handleUpdateStatus(mission.id, 'in_transit')}
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Mark In Transit
                            </button>
                          )}
                          {mission.status === 'in_transit' && (
                            <button
                              onClick={() => handleUpdateStatus(mission.id, 'delivered')}
                              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Missions */}
            {filteredCompletedMissions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Completed Missions</h2>
                  <span className="text-sm text-gray-600">{filteredCompletedMissions.length} completed</span>
                </div>
                <div className="space-y-4">
                  {filteredCompletedMissions.map((mission, index) => (
                    <motion.div
                      key={mission.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 rounded-lg p-4 bg-green-50"
                    >
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{mission.foodType}</h3>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Delivered
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Quantity:</span>
                              <span>{mission.quantity} {mission.unit}</span>
                            </div>
                            {mission.ngoName && (
                              <div className="flex items-center space-x-2">
                                <Target className="w-4 h-4" />
                                <span>Delivered to: {mission.ngoName}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>Completed: {formatDate(mission.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredActiveMissions.length === 0 && filteredCompletedMissions.length === 0 && !isLoading && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Missions Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No missions match your search criteria. Try adjusting your filters.'
                    : "You don't have any active or completed missions yet. Start by picking up a donation from the Volunteer Hub!"}
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <Link
                    href="/volunteer/hub"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Truck className="w-4 h-4 mr-2" />
                    Go to Volunteer Hub
                  </Link>
                )}
              </div>
            )}

            {isLoading && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading missions...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

