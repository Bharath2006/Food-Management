'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { donationStorage } from '@/app/lib/donation-storage';
import { userStorage } from '@/app/lib/user-storage';
import { Donation, User } from '@/app/types';
import { 
  Users, 
  Package, 
  Truck, 
  Building, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Loader2,
  Trash2,
  Shield,
  BarChart3,
  Search
} from 'lucide-react';
import { formatDate } from '@/app/lib/utils';

export default function AdminDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [donations, setDonations] = useState<Donation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'donations' | 'users'>('overview');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || !user) {
        router.push('/auth/signin');
        return;
      }
      
      // Check if user is admin (you can add admin role check here)
      // For now, allow any authenticated user to access (in production, add proper admin check)
      loadData();
    }
  }, [isAuthenticated, user, authLoading, router]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const allDonations = await donationStorage.getAllDonations();
      const allUsers = userStorage.getAllUsers();
      
      setDonations(allDonations);
      setUsers(allUsers);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDonation = async (donationId: string) => {
    if (confirm('Are you sure you want to delete this donation? This action cannot be undone.')) {
      await donationStorage.deleteDonation(donationId);
      setDonations(prev => prev.filter(d => d.id !== donationId));
    }
  };

  const handleRemoveUser = (userId: string) => {
    if (confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
      userStorage.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const stats = {
    totalUsers: users.length,
    totalDonations: donations.length,
    activeDonations: donations.filter(d => d.status === 'available' || d.status === 'pending' || d.status === 'ordered').length,
    deliveredDonations: donations.filter(d => d.status === 'delivered').length,
    donors: users.filter(u => u.role === 'donor').length,
    volunteers: users.filter(u => u.role === 'volunteer').length,
    ngos: users.filter(u => u.role === 'ngo').length,
  };

  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.foodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.donorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || donation.status === filterStatus;
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 mr-2 text-blue-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Monitor and manage platform activity</p>
            </div>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Loader2 className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'donations', label: 'Donations', icon: Package },
              { id: 'users', label: 'Users', icon: Users }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'donations' | 'users')}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Donations</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
                  </div>
                  <Package className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Donations</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeDonations}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Delivered</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.deliveredDonations}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* User Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Breakdown</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Building className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.donors}</p>
                  <p className="text-sm text-gray-600">Donors</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Truck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.volunteers}</p>
                  <p className="text-sm text-gray-600">Volunteers</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Building className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{stats.ngos}</p>
                  <p className="text-sm text-gray-600">NGOs</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search donations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="pending">Pending</option>
                  <option value="ordered">Ordered</option>
                  <option value="picked">Picked</option>
                  <option value="delivered">Delivered</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>

            {/* Donations List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">All Donations</h2>
                <div className="space-y-4">
                  {filteredDonations.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No donations found</p>
                    </div>
                  ) : (
                    filteredDonations.map((donation) => (
                      <div
                        key={donation.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium text-gray-900">{donation.foodType}</h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                donation.status === 'available' ? 'bg-green-100 text-green-800' :
                                donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                donation.status === 'delivered' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {donation.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>{donation.quantity} {donation.unit} from {donation.donorName}</p>
                              <p>Expires: {formatDate(donation.expiry)}</p>
                              <p>Location: {donation.location?.address || 'N/A'}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteDonation(donation.id)}
                            className="text-red-600 hover:text-red-800 p-2"
                            title="Delete donation"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">All Users</h2>
              <div className="space-y-4">
                {users.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No users found</p>
                  </div>
                ) : (
                  users.map((user) => (
                    <div
                      key={user.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{user.name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.role === 'donor' ? 'bg-green-100 text-green-800' :
                              user.role === 'volunteer' ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {user.role}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>{user.email}</p>
                            <p>Joined: {formatDate(user.createdAt)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          className="text-red-600 hover:text-red-800 p-2"
                          title="Remove user"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}






