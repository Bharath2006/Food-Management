'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Clock, 
  Package, 
  ShoppingCart, 
  Navigation,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  Heart,
  Calendar,
  Search,
  Filter,
  Plus,
  Minus
} from 'lucide-react';
import { Donation } from '@/app/types';
import { LocationService, Location } from '@/app/lib/location-service';
import { formatDate, generateReadableQRCode } from '@/app/lib/utils';
import { donationStorage } from '@/app/lib/donation-storage';
import { useAuth } from '@/app/contexts/AuthContext';

export default function NGOFoodAvailability() {
  const { user } = useAuth();
  const [ngoLocation, setNgoLocation] = useState<Location | undefined>(undefined);
  const [availableDonations, setAvailableDonations] = useState<(Donation & { distance: number })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDonations, setSelectedDonations] = useState<{ [key: string]: number }>({});
  const [orderStatus, setOrderStatus] = useState<'idle' | 'ordering' | 'success' | 'error'>('idle');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Load NGO's location from localStorage
  useEffect(() => {
    const savedLocation = localStorage.getItem('ngoLocation');
    if (savedLocation) {
      try {
        setNgoLocation(JSON.parse(savedLocation));
        setAddressInput(JSON.parse(savedLocation).address);
      } catch (error) {
        console.error('Error parsing saved location:', error);
      }
    }
    
    // Load donations immediately on mount
    const initialLoad = async () => {
      await loadAvailableDonations();
    };
    initialLoad();
    
    // Set up auto-refresh every 5 seconds to catch new donations
    const refreshInterval = setInterval(async () => {
      await loadAvailableDonations();
    }, 5000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Load available donations when location changes
  useEffect(() => {
    const onLocationChange = async () => {
      await loadAvailableDonations();
    };
    onLocationChange();
  }, [ngoLocation]);

  const loadAvailableDonations = async () => {
    setIsLoading(true);
    
    // Get all available donations from storage (not filtered by location)
    const allDonationsList = await donationStorage.getAllDonations();
    // Show available donations (new donations from donors) and pending/ordered ones
    const available = allDonationsList.filter(d => 
      d.status === 'available' || 
      d.status === 'pending' || 
      d.status === 'ordered'
    );
    
    // Calculate distances if NGO location is available
    if (ngoLocation) {
      const withDistance = available.map(donation => {
        const distance = LocationService.calculateDistance(
          ngoLocation.lat,
          ngoLocation.lng,
          donation.location.lat,
          donation.location.lng
        );
        
        // Check if addresses match (even if coordinates are different)
        let addressMatch = false;
        if (ngoLocation.address && donation.location?.address) {
          addressMatch = LocationService.addressesMatch(
            ngoLocation.address,
            donation.location.address
          );
        }
        
        return {
          ...donation,
          distance: addressMatch ? 0 : distance, // Set distance to 0 if addresses match
          addressMatch // Flag to indicate address match
        };
      });
      
      // Sort by address match first, then by distance
      withDistance.sort((a, b) => {
        if (a.addressMatch && !b.addressMatch) return -1;
        if (!a.addressMatch && b.addressMatch) return 1;
        return a.distance - b.distance;
      });
      
      setAvailableDonations(withDistance);
    } else {
      // If no NGO location set, show all donations without distance
      setAvailableDonations(available.map(donation => ({
        ...donation,
        distance: 0 // Will be calculated when location is set
      })));
    }
    
    setIsLoading(false);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressInput(e.target.value);
    setError(null);
  };

  const handleGeocode = async () => {
    if (!addressInput.trim()) {
      setError('Please enter an address');
      return;
    }

    setIsGeocoding(true);
    setError(null);

    try {
      // For testing purposes, if user types "mississippi" or similar, use the test coordinates
      const lowerAddress = addressInput.toLowerCase();
      let location: Location;

      if (lowerAddress.includes('mississippi') || lowerAddress.includes('ms')) {
        location = {
          lat: 33.1581,
          lng: -89.7452,
          address: 'Mississippi, USA',
          city: 'Mississippi',
          state: 'MS',
          country: 'USA'
        };
      } else {
        // Use the location service for other addresses
        location = await LocationService.geocodeAddress(addressInput);
      }

      setNgoLocation(location);
      setAddressInput(location.address);
      
      // Save NGO location to localStorage
      localStorage.setItem('ngoLocation', JSON.stringify(location));
    } catch (err) {
      setError('Failed to geocode address. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleQuantityChange = (donationId: string, change: number) => {
    setSelectedDonations(prev => {
      const current = prev[donationId] || 0;
      const newQuantity = Math.max(0, current + change);
      
      if (newQuantity === 0) {
        const { [donationId]: removed, ...rest } = prev;
        return rest;
      }
      
      return { ...prev, [donationId]: newQuantity };
    });
  };

  const handlePlaceOrder = async () => {
    if (Object.keys(selectedDonations).length === 0) {
      setError('Please select at least one donation to order');
      return;
    }

    setOrderStatus('ordering');

    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order with QR codes for each selected donation
      const orderItems = Object.entries(selectedDonations).map(([donationId, quantity]) => {
        const donation = availableDonations.find(d => d.id === donationId);
        const orderQRData = {
          title: "Zero Food Hero - NGO Order",
          orderId: `ORDER-${Date.now()}`,
          donationId: donationId,
          foodType: donation?.foodType || "Food Item",
          quantity: quantity,
          donorName: donation?.donorName || "Anonymous Donor",
          ngoName: user?.name || "NGO",
          deliveryAddress: ngoLocation?.address || "Unknown Location",
          status: "ordered",
          orderDate: new Date().toLocaleDateString(),
          message: "Scan this QR code to verify pickup and delivery of this ordered food item"
        };
        
        return {
          donationId,
          quantity,
          donorName: donation?.donorName,
          foodType: donation?.foodType,
          qrCode: JSON.stringify(orderQRData, null, 2)
        };
      });

      // Save order to localStorage (in real app, this would go to database)
      const order = {
        id: `ORDER-${Date.now()}`,
        ngoId: user?.id,
        ngoName: user?.name,
        items: orderItems,
        status: 'ordered',
        createdAt: new Date(),
        deliveryAddress: ngoLocation?.address,
        totalItems: Object.values(selectedDonations).reduce((sum, qty) => sum + qty, 0)
      };

      const existingOrders = JSON.parse(localStorage.getItem('ngoOrders') || '[]');
      existingOrders.push(order);
      localStorage.setItem('ngoOrders', JSON.stringify(existingOrders));

      // Update donation status to 'ordered' and save NGO info with delivery location
      await Promise.all(Object.keys(selectedDonations).map(async (donationId) => {
        const donation = availableDonations.find(d => d.id === donationId);
        if (donation && ngoLocation) {
          await donationStorage.updateDonation(donationId, { 
            status: 'ordered',
            ngoId: user?.id,
            ngoName: user?.name || 'NGO',
            ngoLocation: {
              lat: ngoLocation.lat,
              lng: ngoLocation.lng,
              address: ngoLocation.address
            },
            updatedAt: new Date()
          });
        }
      }));

      setSelectedDonations({});
      setOrderStatus('success');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setOrderStatus('idle');
        loadAvailableDonations(); // Refresh the list
      }, 3000);
    } catch (error) {
      setOrderStatus('error');
      setTimeout(() => setOrderStatus('idle'), 3000);
    }
  };

  const getExpiryStatus = (expiry: Date) => {
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'expired', color: 'text-red-600', bg: 'bg-red-50' };
    if (diffDays <= 2) return { status: 'expiring_soon', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { status: 'fresh', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const filteredDonations = availableDonations.filter(donation => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = donation.foodType.toLowerCase().includes(searchLower) ||
                         donation.donorName.toLowerCase().includes(searchLower) ||
                         (donation.location?.address?.toLowerCase().includes(searchLower) || false);
    const matchesCategory = filterCategory === 'all' || donation.foodCategory === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalSelectedItems = Object.values(selectedDonations).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Availability</h1>
              <p className="text-gray-600">Browse and order available food donations for your organization</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadAvailableDonations}
                disabled={isLoading}
                className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                title="Refresh donations"
              >
                <Search className="w-4 h-4 mr-2" />
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-6 h-6 text-purple-600" />
                <span className="text-sm text-gray-600">NGO Portal</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Location & Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Location</h2>
              
              {/* Address Input */}
              <div className="space-y-4">
                <div className="relative">
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={addressInput}
                        onChange={handleAddressChange}
                        placeholder="Enter your address..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={handleGeocode}
                      disabled={isGeocoding || !addressInput.trim()}
                      className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {isGeocoding ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      <span>Find</span>
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 text-red-600 text-sm"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Location Found Display */}
                {ngoLocation && !error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-purple-50 border border-purple-200 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-900">Location Set</h4>
                        <p className="text-purple-700 text-sm">{ngoLocation.address}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Search & Filters */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search food, donor, or location (e.g., Coimbatore)..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Categories</option>
                      <option value="bread">Bread</option>
                      <option value="fruits">Fruits</option>
                      <option value="vegetables">Vegetables</option>
                      <option value="dairy">Dairy</option>
                      <option value="meat">Meat</option>
                      <option value="canned">Canned</option>
                      <option value="baked">Baked</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Stats */}
                {ngoLocation && (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Available Donations:</span>
                      <span className="font-medium">{filteredDonations.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Selected Items:</span>
                      <span className="font-medium">{totalSelectedItems}</span>
                    </div>
                  </div>
                )}

                {/* Quick Test Instructions */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Quick Test:</strong> Type "Mississippi" and click Find to see test donations!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Donations List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Available Donations</h2>
                {isLoading && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading donations...</span>
                  </div>
                )}
              </div>
              
              {/* Info Message */}
              {ngoLocation && filteredDonations.length > 0 && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-purple-800 text-sm">
                    <strong>Showing all available donations</strong> - Distance is calculated from your location to help you plan your orders.
                  </p>
                </div>
              )}

              {!ngoLocation ? (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Set Your Location</h3>
                  <p className="text-gray-600">Enter your address to see available food donations</p>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
                    <p className="text-yellow-800 text-sm">
                      <strong>Tip:</strong> Type "Mississippi" in the location field to see test donations!
                    </p>
                  </div>
                </div>
              ) : filteredDonations.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Donations Available</h3>
                  <p className="text-gray-600">No food donations found matching your criteria</p>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                    <p className="text-blue-800 text-sm">
                      <strong>Need test data?</strong> Go to Test Donations page and add some test donations first!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDonations.map((donation, index) => {
                    const expiryStatus = getExpiryStatus(donation.expiry);
                    const selectedQuantity = selectedDonations[donation.id] || 0;
                    
                    return (
                      <motion.div
                        key={donation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">{donation.foodType}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${expiryStatus.bg} ${expiryStatus.color}`}>
                                {expiryStatus.status === 'expired' ? 'Expired' : 
                                 expiryStatus.status === 'expiring_soon' ? 'Expiring Soon' : 'Fresh'}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Package className="w-4 h-4" />
                                <span>{donation.quantity} {donation.unit}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Users className="w-4 h-4" />
                                <span>From: {donation.donorName}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>Expires: {formatDate(donation.expiry)}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>Created: {formatDate(donation.createdAt)}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 mb-4">
                              <div className="flex items-center space-x-2 text-sm text-blue-600">
                                <Navigation className="w-4 h-4" />
                                <span>{LocationService.formatDistance(donation.distance)} away</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{LocationService.getEstimatedTravelTime(donation.distance)} travel time</span>
                              </div>
                            </div>

                            {donation.description && (
                              <p className="text-sm text-gray-600 mb-4">{donation.description}</p>
                            )}

                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <MapPin className="w-4 h-4" />
                              <span>{donation.location.address}</span>
                            </div>
                          </div>

                          <div className="ml-4 flex flex-col items-end space-y-3">
                            {/* Quantity Selector */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleQuantityChange(donation.id, -1)}
                                disabled={selectedQuantity === 0}
                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 flex items-center justify-center"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-medium">{selectedQuantity}</span>
                              <button
                                onClick={() => handleQuantityChange(donation.id, 1)}
                                disabled={selectedQuantity >= donation.quantity}
                                className="w-8 h-8 rounded-full bg-purple-200 hover:bg-purple-300 disabled:opacity-50 flex items-center justify-center"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {selectedQuantity > 0 && (
                              <span className="text-sm text-purple-600 font-medium">
                                {selectedQuantity} selected
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order Summary */}
            {totalSelectedItems > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  {Object.entries(selectedDonations).map(([donationId, quantity]) => {
                    const donation = availableDonations.find(d => d.id === donationId);
                    return (
                      <div key={donationId} className="flex items-center justify-between">
                        <span className="text-gray-700">{donation?.foodType}</span>
                        <span className="font-medium">{quantity} {donation?.unit}</span>
                      </div>
                    );
                  })}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Total Items:</span>
                      <span>{totalSelectedItems}</span>
                    </div>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={orderStatus === 'ordering'}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    {orderStatus === 'ordering' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Place Order</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        {orderStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Order placed successfully! Volunteers will be notified.</span>
            </div>
          </motion.div>
        )}

        {orderStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Failed to place order. Please try again.</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 