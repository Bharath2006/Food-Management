'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  MapPin, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle,
  Truck,
  Building,
  Calendar,
  Package,
  Phone,
  Mail
} from 'lucide-react';
import { Donation } from '@/app/types';
import { formatDate, getStatusColor, getExpiryStatus } from '@/app/lib/utils';
import { donationStorage } from '@/app/lib/donation-storage';

export default function QRScanPage() {
  const params = useParams();
  const donationId = params.id as string;
  
  const [donation, setDonation] = useState<Donation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'volunteer' | 'ngo' | null>(null);
  const [actionTaken, setActionTaken] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonation = async () => {
      setLoading(true);
      try {
        const realDonation = await donationStorage.getDonationById(donationId);
        if (realDonation) {
          setDonation(realDonation);
        } else {
          setError('Donation not found.');
        }
      } catch (err) {
        setError('Failed to load donation information');
      } finally {
        setLoading(false);
      }
    };
    if (donationId) {
      fetchDonation();
    }
  }, [donationId]);

  const handleClaimDonation = async (role: 'volunteer' | 'ngo') => {
    if (!donation) return;

    try {
      setUserRole(role);
      
      // Simulate API call to claim donation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newStatus = role === 'volunteer' ? 'picked' : 'delivered';
      await donationStorage.updateDonation(donation.id, { 
        status: newStatus,
        updatedAt: new Date()
      });
      
      setDonation(prev => prev ? { ...prev, status: newStatus } : null);
      setActionTaken(`Donation successfully claimed by ${role === 'volunteer' ? 'volunteer' : 'NGO'}`);
      
      // Show success message
      setTimeout(() => {
        setActionTaken(null);
      }, 3000);
    } catch (err) {
      console.error('Error claiming donation:', err);
      alert('Failed to claim donation. Please try again.');
    }
  };

  const getExpiryStatusColor = (expiry: Date) => {
    const status = getExpiryStatus(expiry);
    switch (status) {
      case 'fresh': return 'text-green-600';
      case 'expiring_soon': return 'text-yellow-600';
      case 'expired': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading donation information...</p>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Donation Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'This donation could not be found or has expired.'}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <QrCode className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Donation Details</h1>
          <p className="text-gray-600">Scan successful! Here's what you need to know.</p>
        </motion.div>

        {/* Success Message */}
        {actionTaken && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">{actionTaken}</span>
            </div>
          </motion.div>
        )}

        {/* Donation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Status Header */}
          <div className={`px-6 py-4 ${getStatusColor(donation.status)}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">Status: {donation.status.toUpperCase()}</span>
              <span className="text-sm">ID: {donation.id}</span>
            </div>
          </div>



          {/* Donation Details */}
          <div className="p-6 space-y-6">
            {/* Food Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{donation.foodType}</h2>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>{donation.quantity} {donation.unit}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span className={getExpiryStatusColor(donation.expiry)}>
                    Expires: {formatDate(donation.expiry)}
                  </span>
                </div>
              </div>
              {donation.description && (
                <p className="text-gray-600 mt-2">{donation.description}</p>
              )}
            </div>

            {/* Donor Information */}
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-2">Donor Information</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{donation.donorName}</span>
              </div>
            </div>

            {/* Location */}
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-2">Pickup Location</h3>
              <div className="flex items-start space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>{donation.location.address}</span>
              </div>
            </div>

            {/* AI Confidence */}
            {donation.aiConfidence && (
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-2">AI Analysis</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Confidence: {Math.round(donation.aiConfidence * 100)}%</span>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Created: {formatDate(donation.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Updated: {formatDate(donation.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        {donation.status === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 text-center">Claim This Donation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleClaimDonation('volunteer')}
                disabled={userRole !== null}
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Truck className="w-5 h-5" />
                <span>Claim as Volunteer</span>
              </button>
              
              <button
                onClick={() => handleClaimDonation('ngo')}
                disabled={userRole !== null}
                className="flex items-center justify-center space-x-2 bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Building className="w-5 h-5" />
                <span>Claim as NGO</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="font-medium text-gray-900 mb-4">Need Help?</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Call: +1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email: support@zerofoodhero.com</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 