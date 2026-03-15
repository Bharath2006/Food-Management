export type UserRole = 'donor' | 'volunteer' | 'ngo';

export type DonationStatus = 'pending' | 'picked' | 'delivered' | 'expired' | 'available' | 'in_transit' | 'ordered';

export type FoodCategory = 
  | 'bread' 
  | 'fruits' 
  | 'vegetables' 
  | 'dairy' 
  | 'meat' 
  | 'canned' 
  | 'baked' 
  | 'other';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  createdAt: Date;
  profileImage?: string;
}

export interface Donation {
  id: string;
  foodType: string;
  foodCategory: FoodCategory;
  quantity: number;
  unit: string;
  expiry: Date;
  status: DonationStatus;
  donorId: string;
  donorName: string;
  volunteerId?: string;
  volunteerName?: string;
  ngoId?: string;
  ngoName?: string;
  ngoLocation?: {  // NGO's delivery location (where volunteer should deliver)
    lat: number;
    lng: number;
    address: string;
  };
  description?: string;
  location: {  // Donor's pickup location (where volunteer picks up)
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: Date;
  updatedAt: Date;
  qrCode?: string;
  aiConfidence?: number;
}

export interface NGO {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  capacity: number;
  currentInventory: number;
  createdAt: Date;
}

export interface Volunteer {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  isAvailable: boolean;
  completedMissions: number;
  totalDistance: number;
  rating: number;
  createdAt: Date;
}

export interface Mission {
  id: string;
  donationId: string;
  volunteerId?: string;
  status: 'available' | 'claimed' | 'in_progress' | 'completed';
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  deliveryLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  estimatedPickupTime?: Date;
  estimatedDeliveryTime?: Date;
  actualPickupTime?: Date;
  actualDeliveryTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImpactStats {
  totalFoodSaved: number;
  totalDonations: number;
  activeVolunteers: number;
  partnerNGOs: number;
  mealsProvided: number;
  carbonFootprintReduced: number;
}

export interface AIPrediction {
  className: string;
  probability: number;
}

export interface MapPin {
  id: string;
  type: 'donation' | 'ngo' | 'volunteer';
  position: {
    lat: number;
    lng: number;
  };
  title: string;
  description: string;
  status?: DonationStatus;
} 

declare module 'lucide-react';