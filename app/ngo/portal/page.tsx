'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Package, 
  Users, 
  TrendingUp, 
  FileText, 
  Download,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Loader2
} from 'lucide-react';
import { Donation, NGO, ImpactStats } from '@/app/types';
import { formatDate, formatDateTime, getStatusColor, calculateImpactMetrics } from '@/app/lib/utils';
import jsPDF from 'jspdf';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { donationStorage } from '@/app/lib/donation-storage';
import { userStorage } from '@/app/lib/user-storage';

// Mock data for demonstration
const mockDonations: Donation[] = [
  {
    id: '1',
    foodType: 'Fresh Bread',
    foodCategory: 'bread',
    quantity: 5,
    unit: 'loaf',
    expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: 'delivered',
    donorId: 'donor-1',
    donorName: 'Local Bakery',
    ngoId: 'ngo-1',
    ngoName: 'Community Food Bank',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: '123 Main St, New York, NY'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    description: 'Fresh bread from this morning'
  },
  {
    id: '2',
    foodType: 'Vegetables',
    foodCategory: 'vegetables',
    quantity: 10,
    unit: 'kg',
    expiry: new Date(Date.now() + 48 * 60 * 60 * 1000),
    status: 'picked',
    donorId: 'donor-2',
    donorName: 'Green Market',
    ngoId: 'ngo-1',
    ngoName: 'Community Food Bank',
    location: {
      lat: 40.7589,
      lng: -73.9851,
      address: '456 Market Ave, New York, NY'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    description: 'Fresh organic vegetables'
  }
];

const mockImpactStats: ImpactStats = {
  totalFoodSaved: 15420,
  totalDonations: 2847,
  activeVolunteers: 156,
  partnerNGOs: 23,
  mealsProvided: 38550,
  carbonFootprintReduced: 1234
};

export default function NGOPortalPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [impactStats, setImpactStats] = useState<ImpactStats>(mockImpactStats);
  const [newAlerts, setNewAlerts] = useState<Donation[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDistributionForm, setShowDistributionForm] = useState(false);
  const [showManualDonationForm, setShowManualDonationForm] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDonations = async () => {
    try {
      setIsLoading(true);
      const allDonations = await donationStorage.getAllDonations();
      
      // Show all donations that are available, pending, ordered, picked, or delivered to this NGO
      const ngoDonations = allDonations.filter(donation => 
        donation.status === 'available' ||
        donation.status === 'pending' ||
        donation.status === 'ordered' ||
        (donation.ngoId === user?.id && (donation.status === 'picked' || donation.status === 'delivered'))
      );
      
      setDonations(ngoDonations);
      
      // Calculate real impact metrics
      const metrics = calculateImpactMetrics(ngoDonations);
      setImpactStats({
        totalFoodSaved: metrics.totalFoodSaved,
        totalDonations: metrics.totalDonations,
        mealsProvided: metrics.mealsProvided,
        carbonFootprintReduced: metrics.co2Saved,
        activeVolunteers: 12,
        partnerNGOs: 5
      });
      
      // Set new alerts for recent available donations (last 5)
      const recentAvailable = allDonations
        .filter(d => d.status === 'available')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);
      setNewAlerts(recentAvailable);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading donations:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || !user) {
        router.push('/auth/signin');
        return;
      }
      if (user.role !== 'ngo') {
        router.push('/');
        return;
      }
      // Load donations from storage
      loadDonations();
    }
  }, [isAuthenticated, user, loading, router]);

  useEffect(() => {
    // Simulate real-time alerts with more variety
    const foodTypes = ['Fresh Produce', 'Bakery Items', 'Dairy Products', 'Canned Goods', 'Meal Kits'];
    const donors = ['Local Bakery', 'Green Grocer', 'Family Mart', 'Supermarket Chain', 'City Restaurant'];

    const interval = setInterval(() => {
      const randomFood = foodTypes[Math.floor(Math.random() * foodTypes.length)];
      const randomDonor = donors[Math.floor(Math.random() * donors.length)];
      
      const newDonation: Donation = {
        id: `new-${Date.now()}`,
        foodType: randomFood,
        foodCategory: 'other',
        quantity: 10 + Math.floor(Math.random() * 40),
        unit: 'kg',
        expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'available',
        donorId: `donor-${Math.floor(Math.random() * 10)}`,
        donorName: randomDonor,
        location: {
          lat: 11.0168 + (Math.random() - 0.5) * 0.1,
          lng: 76.9558 + (Math.random() - 0.5) * 0.1,
          address: 'Main St, Local Area'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        description: `New donation of ${randomFood}`
      };
      
      setNewAlerts(prev => [newDonation, ...prev.slice(0, 4)]);
    }, 15000); // New alert every 15 seconds for more activity

    return () => clearInterval(interval);
  }, []);

  const filteredDonations = donations.filter(donation => {
    const matchesStatus = filterStatus === 'all' || donation.status === filterStatus;
    const matchesSearch = donation.foodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.donorName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleLogDistribution = async (donationId: string, recipients: number, notes: string) => {
    try {
      if (!user) return;
      
      await donationStorage.updateDonation(donationId, {
        status: 'delivered',
        updatedAt: new Date()
      });
      
      // Log activity
      const donation = donations.find(d => d.id === donationId);
      userStorage.addUserActivity(user.id, {
        type: 'delivery',
        description: `Distributed ${donation?.foodType || 'food'} to ${recipients} people`,
        metadata: { donationId, recipients, notes }
      });
      
      // Update local state and recalculate impact
      await loadDonations();
      
      setShowDistributionForm(false);
      setSelectedDonation(null);
    } catch (err) {
      console.error('Error logging distribution:', err);
    }
  };

  const handleManualDonation = async (data: any) => {
    try {
      if (!user) return;
      
      const donationId = `manual-${Date.now()}`;
      
      await donationStorage.addDonation({
        foodType: data.foodType,
        foodCategory: data.foodCategory,
        quantity: data.quantity,
        unit: data.unit,
        expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
        status: 'delivered',
        donorId: user.id,
        donorName: user.name,
        location: {
          lat: 11.0168,
          lng: 76.9558,
          address: 'Received at Center'
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        qrCode: `dummy-qr-${donationId}` // Static QR for manual logs
      });
      
      await loadDonations();
      setShowManualDonationForm(false);
    } catch (err) {
      console.error('Error logging manual donation:', err);
    }
  };

  const generateImpactReport = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Impact Report - Community Food Bank', 20, 20);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Generated on: ${formatDate(new Date())}`, 20, 35);
    
    // Stats
    doc.setFontSize(16);
    doc.text('Key Metrics', 20, 50);
    
    doc.setFontSize(12);
    doc.text(`Total Food Saved: ${impactStats.totalFoodSaved.toLocaleString()} kg`, 20, 65);
    doc.text(`Total Donations: ${impactStats.totalDonations.toLocaleString()}`, 20, 75);
    doc.text(`Meals Provided: ${impactStats.mealsProvided.toLocaleString()}`, 20, 85);
    doc.text(`Carbon Footprint Reduced: ${impactStats.carbonFootprintReduced} kg CO2`, 20, 95);
    
    // Recent donations
    doc.setFontSize(16);
    doc.text('Recent Donations', 20, 120);
    
    let yPos = 135;
    donations.slice(0, 10).forEach((donation, index) => {
      doc.setFontSize(10);
      doc.text(`${index + 1}. ${donation.foodType} - ${donation.quantity} ${donation.unit}`, 20, yPos);
      doc.text(`   Donor: ${donation.donorName} | Status: ${donation.status}`, 20, yPos + 5);
      yPos += 15;
    });
    
    // Save the PDF
    doc.save('impact-report.pdf');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'picked': return <Package className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1 sm:mb-0">NGO Portal</h1>
              <p className="text-gray-600 text-sm">Manage food donations and track community impact</p>
            </div>
            {/* Neat nav bar for NGO actions */}
            <nav className="flex flex-row flex-wrap gap-2 overflow-x-auto whitespace-nowrap py-1 px-2 bg-white rounded-lg border border-gray-200 shadow-sm text-sm">
              <button className="px-3 py-1 rounded-md hover:bg-gray-100 transition-colors">Dashboard</button>
              <button className="px-3 py-1 rounded-md hover:bg-gray-100 transition-colors">Donations</button>
              <button className="px-3 py-1 rounded-md hover:bg-gray-100 transition-colors">Volunteers</button>
              <button className="px-3 py-1 rounded-md hover:bg-gray-100 transition-colors">Reports</button>
              <button className="px-3 py-1 rounded-md hover:bg-gray-100 transition-colors">Settings</button>
            </nav>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Real-time Alerts */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-red-500" />
                  Real-time Alerts
                </h2>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                  {newAlerts.length} new
                </span>
              </div>
              
              {newAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No new alerts</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {newAlerts.map((alertItem) => (
                    <motion.div
                      key={alertItem.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{alertItem.foodType}</h3>
                          <p className="text-sm text-gray-600">
                            {alertItem.quantity} {alertItem.unit} from {alertItem.donorName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Expires: {formatDate(alertItem.expiry)}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              if (alertItem.id.startsWith('new-')) {
                                // For simulated alerts, create them in the database when claimed
                                const { id, ...alertData } = alertItem;
                                await donationStorage.addDonation({
                                  ...alertData,
                                  ngoId: user?.id,
                                  ngoName: user?.name,
                                  status: 'ordered',
                                  updatedAt: new Date()
                                } as any);
                              } else {
                                await donationStorage.updateDonation(alertItem.id, {
                                  ngoId: user?.id,
                                  ngoName: user?.name,
                                  status: 'ordered'
                                });
                              }
                              await loadDonations();
                              // Remove from alerts
                              setNewAlerts(prev => prev.filter(a => a.id !== alertItem.id));
                              alert('Donation claimed successfully!');
                            } catch (err) {
                              console.error('Error claiming donation:', err);
                              alert('Failed to claim donation. It might have been already claimed or expired.');
                            }
                          }}
                          className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
                        >
                          Claim
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Donations Management */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Donations Management</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={loadDonations}
                    className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    title="Refresh donations"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                  <button
                    onClick={generateImpactReport}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                    <Download className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search donations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="picked">Picked</option>
                  <option value="delivered">Delivered</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Donations List */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500">Loading donations...</p>
                  </div>
                ) : filteredDonations.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No donations found</p>
                    <button
                      onClick={loadDonations}
                      className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Refresh
                    </button>
                  </div>
                ) : (
                  filteredDonations.map((donation) => (
                    <motion.div
                      key={donation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getStatusIcon(donation.status)}
                            <h3 className="font-medium text-gray-900">{donation.foodType}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(donation.status)}`}>
                              {donation.status}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{donation.quantity} {donation.unit} from {donation.donorName}</p>
                            <p>Expires: {formatDate(donation.expiry)}</p>
                            <p>Received: {formatDateTime(donation.createdAt)}</p>
                            {donation.description && (
                              <p className="text-gray-500 italic">"{donation.description}"</p>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {donation.status === 'available' && (
                            <button
                              onClick={() => {
                                donationStorage.updateDonation(donation.id, {
                                  ngoId: user?.id,
                                  ngoName: user?.name,
                                  status: 'ordered'
                                });
                                loadDonations(); // Refresh the list
                                // TODO: Add notification to donor
                              }}
                              className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
                            >
                              Order
                            </button>
                          )}
                          {donation.status === 'picked' && (
                            <button
                              onClick={() => {
                                setSelectedDonation(donation);
                                setShowDistributionForm(true);
                              }}
                              className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors"
                            >
                              Log Distribution
                            </button>
                          )}
                          <button className="text-blue-600 hover:text-blue-800 p-1">
                            <MapPin className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Impact Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Overview</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {impactStats.totalFoodSaved.toLocaleString()} kg
                  </div>
                  <div className="text-sm text-gray-600">Food Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {impactStats.mealsProvided.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Meals Provided</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {impactStats.carbonFootprintReduced} kg
                  </div>
                  <div className="text-sm text-gray-600">CO2 Reduced</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowManualDonationForm(true)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Log Manual Donation
                </button>
                <button 
                  onClick={generateImpactReport}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Generate Report
                </button>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors text-sm">
                  <Users className="w-4 h-4 inline mr-2" />
                  Manage Volunteers
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {user && userStorage.getUserActivities(user.id).length > 0 ? (
                  userStorage.getUserActivities(user.id).slice(0, 5).reverse().map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`mt-1.5 w-2 h-2 rounded-full ${
                        activity.type === 'delivery' ? 'bg-green-500' :
                        activity.type === 'pickup' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 leading-snug">{activity.description}</p>
                        <p className="text-xs text-gray-500">{formatDateTime(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Distribution Form Modal */}
        {showDistributionForm && selectedDonation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Distribution</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleLogDistribution(
                  selectedDonation.id,
                  Number(formData.get('recipients')),
                  formData.get('notes') as string
                );
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Food Item
                    </label>
                    <p className="text-gray-900">{selectedDonation.foodType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Recipients
                    </label>
                    <input
                      type="number"
                      name="recipients"
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Additional details about the distribution..."
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Confirm Distribution
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDistributionForm(false);
                        setSelectedDonation(null);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {/* Manual Donation Form Modal */}
        {showManualDonationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Log Manual Donation</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleManualDonation({
                  foodType: formData.get('foodType'),
                  foodCategory: formData.get('foodCategory'),
                  quantity: Number(formData.get('quantity')),
                  unit: formData.get('unit'),
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Food Type
                    </label>
                    <input
                      type="text"
                      name="foodType"
                      required
                      placeholder="e.g. Mixed Fruit"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        required
                        min="0.1"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <select
                        name="unit"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="lb">lb</option>
                        <option value="unit">units</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="foodCategory"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="vegetables">Vegetables</option>
                      <option value="fruits">Fruits</option>
                      <option value="bakery">Bakery</option>
                      <option value="dairy">Dairy</option>
                      <option value="canned">Canned Goods</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="flex space-x-3 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Log Donation
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowManualDonationForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
} 