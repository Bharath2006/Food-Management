'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { donationStorage } from '@/app/lib/donation-storage';
import { Donation, DonationStatus } from '@/app/types';
import { 
  Clock, 
  MapPin, 
  Package, 
  CheckCircle, 
  Truck, 
  AlertCircle,
  Loader2,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';

export default function VolunteerDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // State
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DonationStatus | 'all'>('all');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  // Check authentication and load donations
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        router.push('/auth/signin');
        return;
      }
      
      // Only allow access if user is a volunteer or ngo
      if (user.role !== 'volunteer' && user.role !== 'ngo') {
        router.push('/');
        return;
      }
      
      loadDonations().catch(err => {
        console.error('Error in loadDonations:', err);
        setError('Failed to load donations. Please try again.');
      });
      
      // Refresh donations every 5 seconds to catch new donations
      const refreshInterval = setInterval(() => {
        loadDonations().catch(err => {
          console.error('Error refreshing donations:', err);
        });
      }, 5000);
      
      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated, user, authLoading, router]);

  const loadDonations = async () => {
    try {
      setIsLoading(true);
      const allDonations = donationStorage.getAllDonations();
      
      // For volunteers: show available, pending, and ordered donations
      // For NGOs: show available and their requested donations
      const filteredDonations = allDonations.filter(donation => {
        if (user?.role === 'volunteer') {
          return donation.status === 'available' || 
                 donation.status === 'pending' ||
                 donation.status === 'ordered' ||
                 (donation.volunteerId === user?.id && donation.status === 'in_transit');
        } else if (user?.role === 'ngo') {
          return donation.status === 'available' || 
                 donation.status === 'pending' ||
                 (donation.ngoId === user?.id);
        }
        return false;
      });
      
      setDonations(filteredDonations);
      setError(null);
    } catch (err) {
      console.error('Error loading donations:', err);
      setError('Failed to load donations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimDonation = async (donationId: string) => {
    if (!user || user.role !== 'volunteer') return;
    
    try {
      const donation = donationStorage.getDonationById(donationId);
      if (!donation) {
        alert('Donation not found');
        return;
      }

      // Update donation status based on current status
      let newStatus: DonationStatus = 'in_transit';
      if (donation.status === 'ordered' || donation.status === 'pending') {
        newStatus = 'picked'; // When volunteer picks up, status becomes 'picked'
      } else {
        newStatus = 'in_transit';
      }

      const updatedDonation = donationStorage.updateDonation(donationId, {
        status: newStatus,
        volunteerId: user.id,
        volunteerName: user.name || 'Volunteer',
        updatedAt: new Date()
      });
      
      setDonations(prev => 
        prev.map(d => d.id === donationId ? { 
          ...d, 
          status: newStatus,
          volunteerId: user.id,
          volunteerName: user.name || 'Volunteer',
          updatedAt: new Date()
        } : d)
      );
      
      // Show success message or notification
      if (donation.ngoId) {
        alert(`Donation claimed successfully! Please pick up from ${donation.donorName} and deliver to ${donation.ngoName}.`);
      } else {
        alert('Donation claimed successfully!');
      }
      
      // Reload donations to refresh the list
      loadDonations();
    } catch (err) {
      console.error('Error claiming donation:', err);
      alert('Failed to claim donation. Please try again.');
    }
  };

  const handleRequestPickup = async (donationId: string) => {
    if (!user || user.role !== 'ngo') return;
    
    try {
      const donation = donationStorage.getDonationById(donationId);
      if (!donation) {
        alert('Donation not found');
        return;
      }

      // Get NGO location from localStorage if available
      const ngoLocation = localStorage.getItem('ngoLocation');
      let deliveryAddress = 'NGO Location';
      if (ngoLocation) {
        try {
          const location = JSON.parse(ngoLocation);
          deliveryAddress = location.address || 'NGO Location';
        } catch (e) {
          console.error('Error parsing NGO location:', e);
        }
      }

      // Update donation with NGO request
      const updatedDonation = donationStorage.updateDonation(donationId, {
        status: 'pending',
        ngoId: user.id,
        ngoName: user.name || 'NGO',
        updatedAt: new Date()
      });
      
      // Also save to orders for tracking
      const order = {
        id: `ORDER-${Date.now()}`,
        donationId: donationId,
        ngoId: user.id,
        ngoName: user.name || 'NGO',
        donorId: donation.donorId,
        donorName: donation.donorName,
        foodType: donation.foodType,
        quantity: donation.quantity,
        pickupLocation: donation.location,
        deliveryAddress: deliveryAddress,
        status: 'pending',
        createdAt: new Date()
      };

      const existingOrders = JSON.parse(localStorage.getItem('ngoOrders') || '[]');
      existingOrders.push(order);
      localStorage.setItem('ngoOrders', JSON.stringify(existingOrders));
      
      setDonations(prev => 
        prev.map(d => d.id === donationId ? { 
          ...d, 
          status: 'pending' as const,
          ngoId: user.id,
          ngoName: user.name || 'NGO',
          updatedAt: new Date()
        } : d)
      );
      
      // Show success message or notification
      alert('Pickup requested successfully! Volunteers will see your request and can pick up from the donor to deliver to you.');
      
      // Reload donations
      loadDonations();
    } catch (err) {
      console.error('Error requesting pickup:', err);
      alert('Failed to request pickup. Please try again.');
    }
  };

  const handleMarkDelivered = async (donationId: string) => {
    if (!user) return;
    
    try {
      const updatedDonation = donationStorage.updateDonation(donationId, {
        status: 'delivered',
        updatedAt: new Date()
      });
      
      setDonations(prevDonations => 
        prevDonations.map(donation => 
          donation.id === donationId 
            ? { 
                ...donation, 
                status: 'delivered' as const,
                updatedAt: new Date()
              } 
            : donation
        )
      );
      
      alert('Donation marked as delivered!');
    } catch (err) {
      console.error('Error marking donation as delivered:', err);
      alert('Failed to update donation status. Please try again.');
    }
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.foodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || donation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'volunteer' ? 'Available Donations' : 'Request Pickup'}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search by food type or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DonationStatus | 'all')}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="pending">Pending (NGO Requested)</option>
              <option value="ordered">Ordered (NGO Requested)</option>
              <option value="in_transit">In Transit</option>
              <option value="picked">Picked Up</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Donations Grid */}
        {filteredDonations.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No donations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'There are currently no donations available.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDonations.map((donation) => (
              <div 
                key={donation.id} 
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
              >
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {donation.foodType}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      donation.status === 'available' ? 'bg-green-100 text-green-800' :
                      donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      donation.status === 'ordered' ? 'bg-purple-100 text-purple-800' :
                      donation.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      donation.status === 'picked' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {donation.status === 'ordered' ? 'NGO Ordered' : donation.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-500">
                    {donation.description || 'No description provided.'}
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    {/* Pickup Location (Donor) */}
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-2">
                      <div className="flex items-center text-sm font-medium text-green-900 mb-1">
                        <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4" />
                        <span>Pickup From (Donor)</span>
                      </div>
                      <div className="text-sm text-green-700 ml-6">
                        <div className="font-medium">{donation.donorName || 'Donor'}</div>
                        <div>{donation.location?.address || 'Location not specified'}</div>
                      </div>
                    </div>

                    {/* Delivery Location (NGO) - Only show if NGO has requested */}
                    {(donation.ngoName || donation.status === 'ordered' || donation.status === 'pending') && (
                      <div className="bg-purple-50 border border-purple-200 rounded-md p-3 mb-2">
                        <div className="flex items-center text-sm font-medium text-purple-900 mb-1">
                          <Truck className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          <span>Deliver To (NGO)</span>
                        </div>
                        <div className="text-sm text-purple-700 ml-6">
                          <div className="font-medium">{donation.ngoName || 'NGO Organization'}</div>
                          {(() => {
                            // Try to get NGO delivery address from orders
                            try {
                              const orders = JSON.parse(localStorage.getItem('ngoOrders') || '[]');
                              const order = orders.find((o: any) => o.donationId === donation.id);
                              if (order && order.deliveryAddress) {
                                return <div>{order.deliveryAddress}</div>;
                              }
                            } catch (e) {
                              console.error('Error getting NGO address:', e);
                            }
                            return <div>NGO Location (Contact NGO for address)</div>;
                          })()}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                      <span>Expires {format(new Date(donation.expiry), 'MMM d, yyyy')}</span>
                    </div>
                    
                    {donation.quantity && (
                      <div className="text-sm text-gray-500">
                        Quantity: {donation.quantity} {donation.unit || 'servings'}
                      </div>
                    )}
                    
                    {donation.volunteerName && (
                      <div className="text-sm text-blue-600">
                        Assigned to: {donation.volunteerName}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-5 flex justify-end space-x-3">
                    {/* Volunteer actions */}
                    {user?.role === 'volunteer' && (
                      <>
                        {(donation.status === 'available' || donation.status === 'pending' || donation.status === 'ordered') && (
                          <button
                            type="button"
                            onClick={() => handleClaimDonation(donation.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            {donation.ngoName ? 'Accept Delivery Mission' : 'Claim Donation'}
                            <ArrowRight className="ml-2 -mr-1 h-4 w-4" />
                          </button>
                        )}
                        
                        {donation.status === 'picked' && donation.volunteerId === user?.id && (
                          <button
                            type="button"
                            onClick={() => handleMarkDelivered(donation.id)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Mark as Delivered
                            <CheckCircle className="ml-2 -mr-1 h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                    
                    {/* NGO actions */}
                    {user?.role === 'ngo' && donation.status === 'available' && (
                      <button
                        type="button"
                        onClick={() => handleRequestPickup(donation.id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        Request This Item
                        <Truck className="ml-2 -mr-1 h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
