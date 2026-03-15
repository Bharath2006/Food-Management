'use client';

import { useState, useEffect } from 'react';
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
  Target,
  Route
} from 'lucide-react';

import { Donation } from '@/app/types';
import { LocationService, Location } from '@/app/lib/location-service';
import { formatDate } from '@/app/lib/utils';
import { donationStorage } from '@/app/lib/donation-storage';

type DonationWithDistance = Donation & { distance: number };

export default function VolunteerDeliveries() {
  const [activeDeliveries, setActiveDeliveries] = useState<DonationWithDistance[]>([]);
  const [completedDeliveries, setCompletedDeliveries] = useState<DonationWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Donation | null>(null);
  const [deliveryStatus, setDeliveryStatus] =
    useState<'idle' | 'delivering' | 'success' | 'error'>('idle');
  const [volunteerLocation, setVolunteerLocation] = useState<Location | undefined>();

  /* Load volunteer location */
  useEffect(() => {
    const saved = localStorage.getItem('volunteerLocation');
    if (saved) {
      try {
        setVolunteerLocation(JSON.parse(saved));
      } catch {
        setVolunteerLocation(undefined);
      }
    }
  }, []);

  /* Load deliveries */
  useEffect(() => {
    loadDeliveries();
  }, [volunteerLocation]);

  const loadDeliveries = () => {
    setIsLoading(true);

    const all = donationStorage.getAllDonations();
    const picked = all.filter(d => d.status === 'picked');
    const ordered = all.filter(d => d.status === 'ordered');
    const delivered = all.filter(d => d.status === 'delivered');

    const active = [...picked, ...ordered];

    if (volunteerLocation) {
      setActiveDeliveries(
        active.map(d => ({
          ...d,
          distance: LocationService.calculateDistance(
            volunteerLocation.lat,
            volunteerLocation.lng,
            d.location.lat,
            d.location.lng
          )
        }))
      );

      setCompletedDeliveries(
        delivered.map(d => ({
          ...d,
          distance: LocationService.calculateDistance(
            volunteerLocation.lat,
            volunteerLocation.lng,
            d.location.lat,
            d.location.lng
          )
        }))
      );
    } else {
      setActiveDeliveries(active.map(d => ({ ...d, distance: 0 })));
      setCompletedDeliveries(delivered.map(d => ({ ...d, distance: 0 })));
    }

    setIsLoading(false);
  };

  const handleDeliverDonation = async (donation: Donation) => {
    setSelectedDelivery(donation);
    setDeliveryStatus('delivering');

    try {
      await new Promise(res => setTimeout(res, 2000));

      donationStorage.updateDonation(donation.id, { status: 'delivered' });

      setActiveDeliveries(prev => prev.filter(d => d.id !== donation.id));
      setCompletedDeliveries(prev => [
        { ...donation, distance: 0 },
        ...prev
      ]);

      setDeliveryStatus('success');

      setTimeout(() => {
        setDeliveryStatus('idle');
        setSelectedDelivery(null);
      }, 3000);
    } catch {
      setDeliveryStatus('error');
      setTimeout(() => setDeliveryStatus('idle'), 3000);
    }
  };

  const getExpiryStatus = (expiry: Date) => {
    const diff =
      Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return { bg: 'bg-red-50', color: 'text-red-600', label: 'Expired' };
    if (diff <= 2) return { bg: 'bg-yellow-50', color: 'text-yellow-600', label: 'Expiring Soon' };
    return { bg: 'bg-green-50', color: 'text-green-600', label: 'Fresh' };
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">

        {/* Sidebar */}
        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
          <h2 className="text-xl font-semibold mb-4">Delivery Stats</h2>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600" />
              <p className="text-2xl font-bold">{activeDeliveries.length}</p>
              <p className="text-sm">Active Deliveries</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <p className="text-2xl font-bold">{completedDeliveries.length}</p>
              <p className="text-sm">Completed</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <Route className="w-6 h-6 text-purple-600" />
              <p className="text-2xl font-bold">
                {activeDeliveries.reduce((t, d) => t + d.distance, 0).toFixed(1)} km
              </p>
              <p className="text-sm">Total Distance</p>
            </div>
          </div>
        </div>

        {/* Deliveries */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Active Deliveries</h2>

          {isLoading && (
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="animate-spin" /> Loading...
            </div>
          )}

          {activeDeliveries.map((donation, i) => {
            const expiry = getExpiryStatus(donation.expiry);

            return (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border rounded-lg p-6 mb-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{donation.foodType}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${expiry.bg} ${expiry.color}`}>
                      {expiry.label}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeliverDonation(donation)}
                    disabled={deliveryStatus === 'delivering'}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                  >
                    Deliver
                  </button>
                </div>

                <p className="text-sm text-gray-600">
                  {donation.quantity} {donation.unit} • Distance {donation.distance.toFixed(1)} km
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {deliveryStatus === 'success' && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg">
          Delivered successfully!
        </div>
      )}

      {deliveryStatus === 'error' && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg">
          Delivery failed. Try again.
        </div>
      )}
    </div>
  );
}
