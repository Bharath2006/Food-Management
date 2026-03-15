'use client';

import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { donationStorage } from '@/app/lib/donation-storage';
import { Donation, FoodCategory } from '@/app/types';
import { formatDate, generateReadableQRCode, generateQRCode, generateSimpleQRCode } from '@/app/lib/utils';
import { useAuth } from '@/app/contexts/AuthContext';

export default function TestDonations() {
  const { user } = useAuth();
  const [allDonations, setAllDonations] = useState<Donation[]>([]);
  const [pendingDonations, setPendingDonations] = useState<Donation[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // Load all donations
      const donations = await donationStorage.getAllDonations();
      setAllDonations(donations);
      
      // Load pending donations
      const pending = await donationStorage.getDonationsByStatus('available');
      setPendingDonations(pending);
    };
    loadData();
  }, []);

  const refreshData = async () => {
    const donations = await donationStorage.getAllDonations();
    setAllDonations(donations);
    
    const pending = await donationStorage.getDonationsByStatus('available');
    setPendingDonations(pending);
  };

  const clearAllDonations = async () => {
    if (confirm('This will delete all test donations from the database. Proceed?')) {
      for (const d of allDonations) {
        await donationStorage.deleteDonation(d.id);
      }
      refreshData();
    }
  };

  const addTestDonation = async () => {
    const testDonation: Omit<Donation, 'id'> = {
      foodType: 'Test Food',
      foodCategory: 'other',
      quantity: 1,
      unit: 'kg',
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
      status: 'available',
      donorId: user?.id || 'test-donor',
      donorName: user?.name || 'Test Donor',
      description: 'This is a test donation',
      location: {
        lat: 33.1581, // Mississippi coordinates (matching volunteer location)
        lng: -89.7452,
        address: 'Test Address, Mississippi, USA'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await donationStorage.addDonation(testDonation);
    refreshData();
  };

  const addMultipleTestDonations = async () => {
    const testDonations: Omit<Donation, 'id'>[] = [
      {
        foodType: 'Rice',
        foodCategory: 'other' as FoodCategory,
        quantity: 2,
        unit: 'kg',
        expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'available',
        donorId: user?.id || 'test-donor',
        donorName: user?.name || 'Test Donor',
        description: 'Fresh rice from local market',
        location: {
          lat: 33.1581, // Mississippi coordinates (matching volunteer location)
          lng: -89.7452,
          address: 'Local Market, Mississippi, USA'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        foodType: 'Bread',
        foodCategory: 'bread' as FoodCategory,
        quantity: 3,
        unit: 'loaf',
        expiry: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        status: 'available',
        donorId: user?.id || 'test-donor',
        donorName: user?.name || 'Test Donor',
        description: 'Fresh bread from bakery',
        location: {
          lat: 33.1581, // Mississippi coordinates (matching volunteer location)
          lng: -89.7452,
          address: 'Local Bakery, Mississippi, USA'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const donation of testDonations) {
      await donationStorage.addDonation(donation);
    }
    refreshData();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Donation Storage Test</h1>
          <p className="text-gray-600 mb-4">
            This page helps test the donation storage system and verify that donations are shared between donor and volunteer roles.
          </p>
          
                     <div className="flex space-x-4 mb-6">
             <button
               onClick={refreshData}
               className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
             >
               Refresh Data
             </button>
             <button
               onClick={addTestDonation}
               className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
             >
               Add Test Donation
             </button>
             <button
               onClick={addMultipleTestDonations}
               className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
             >
               Add Multiple Test Donations
             </button>
             <button
               onClick={clearAllDonations}
               className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
             >
               Clear All Donations
             </button>
           </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* All Donations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              All Donations ({allDonations.length})
            </h2>
            {allDonations.length === 0 ? (
              <p className="text-gray-500">No donations found</p>
            ) : (
              <div className="space-y-3">
                {allDonations.map((donation) => (
                  <div key={donation.id} className="border border-gray-200 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{donation.foodType}</h3>
                        <p className="text-sm text-gray-600">
                          {donation.quantity} {donation.unit} • {donation.donorName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: <span className={`font-medium ${
                            donation.status === 'pending' ? 'text-yellow-600' :
                            donation.status === 'picked' ? 'text-blue-600' :
                            donation.status === 'delivered' ? 'text-green-600' :
                            'text-red-600'
                          }`}>{donation.status}</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          Created: {formatDate(donation.createdAt)}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {donation.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Donations */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pending Donations ({pendingDonations.length})
            </h2>
            {pendingDonations.length === 0 ? (
              <p className="text-gray-500">No pending donations</p>
            ) : (
              <div className="space-y-3">
                {pendingDonations.map((donation) => (
                  <div key={donation.id} className="border border-yellow-200 bg-yellow-50 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{donation.foodType}</h3>
                        <p className="text-sm text-gray-600">
                          {donation.quantity} {donation.unit} • {donation.donorName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Expires: {formatDate(donation.expiry)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {donation.location.address}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        ID: {donation.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

                 {/* QR Code Test Section */}
         <div className="mt-8 bg-white rounded-lg shadow p-6">
           <h2 className="text-xl font-semibold text-gray-900 mb-4">QR Code Test</h2>
           {allDonations.length > 0 ? (
             <div className="text-center">
               <h3 className="text-lg font-medium text-gray-900 mb-3">Donation QR Code</h3>
               <div className="border border-gray-200 rounded p-6">
                                   <QRCode 
                    value={generateSimpleQRCode(allDonations[0])} 
                    size={200}
                    className="mx-auto"
                  />
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Scan this QR code to see donation details
                  </p>
                  <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-600 text-left">
                    <strong>QR Code Content Preview:</strong><br/>
                    {generateSimpleQRCode(allDonations[0]).split('\n').map((line, index) => (
                      <div key={index}>{line}</div>
                    ))}
                  </div>
               </div>
             </div>
           ) : (
             <p className="text-gray-500">Create a donation first to test QR codes</p>
           )}
         </div>

        {/* Instructions */}
         <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
           <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Test:</h3>
           <ol className="list-decimal list-inside space-y-2 text-blue-800">
             <li><strong>Option 1:</strong> Go to the <strong>Donor Dashboard</strong> and create a donation with a pickup location</li>
             <li><strong>Option 2:</strong> Use the buttons above to add test donations (they're set to Coimbatore location)</li>
             <li>Come back to this page and click <strong>Refresh Data</strong> to see the donations</li>
             <li>Go to the <strong>Volunteer Hub</strong> and set your location to "Coimbatore" or use current location</li>
             <li>You should see the donations appear in the volunteer hub</li>
             <li>Try picking up a donation and check if the status updates</li>
           </ol>
                       <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                <strong>Important:</strong> The volunteer hub requires you to set a location first before showing nearby donations. 
                Test donations are now set to Mississippi coordinates (33.1581, -89.7452) to match the volunteer location.
              </p>
            </div>
         </div>
      </div>
    </div>
  );
} 