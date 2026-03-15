import { Donation } from '@/app/types';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { generateQRCode } from './utils';
import { LocationService } from './location-service';

class DonationStorageService {
  private readonly COLLECTION_NAME = 'donations';

  private convertDocToDonation(id: string, data: any): Donation {
    return {
      id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
      expiry: data.expiry instanceof Timestamp ? data.expiry.toDate() : new Date(data.expiry || (Date.now() + 7 * 24 * 60 * 60 * 1000)),
    };
  }

  // Get all donations
  public async getAllDonations(): Promise<Donation[]> {
    try {
      const q = query(collection(db, this.COLLECTION_NAME), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const donations = querySnapshot.docs.map(doc => this.convertDocToDonation(doc.id, doc.data()));
      
      // Filter out and update expired donations
      const now = new Date();
      const validResults: Donation[] = [];
      
      for (const donation of donations) {
        if (donation.expiry < now && donation.status === 'available') {
          // Update in background
          this.updateDonation(donation.id, { status: 'expired' });
          donation.status = 'expired';
        }
        
        if (donation.status !== 'expired') {
          validResults.push(donation);
        }
      }
      
      return validResults;
    } catch (error) {
      console.error('Error getting donations:', error);
      return [];
    }
  }

  // Get donations by status
  public async getDonationsByStatus(status: string): Promise<Donation[]> {
    try {
      const q = query(collection(db, this.COLLECTION_NAME), where('status', '==', status));
      const querySnapshot = await getDocs(q);
      const donations = querySnapshot.docs.map(doc => this.convertDocToDonation(doc.id, doc.data()));
      // Sort client-side to avoid index requirement
      return donations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting donations by status:', error);
      return [];
    }
  }

  // Get donations by donor ID
  public async getDonationsByDonor(donorId: string): Promise<Donation[]> {
    try {
      const q = query(collection(db, this.COLLECTION_NAME), where('donorId', '==', donorId));
      const querySnapshot = await getDocs(q);
      const donations = querySnapshot.docs.map(doc => this.convertDocToDonation(doc.id, doc.data()));
      // Sort client-side to avoid index requirement
      return donations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error getting donations by donor:', error);
      return [];
    }
  }

  // Add a new donation
  public async addDonation(donation: Omit<Donation, 'id'>): Promise<string> {
    try {
      const donationData = {
        ...donation,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), donationData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding donation:', error);
      throw error;
    }
  }

  // Update a donation
  public async updateDonation(donationId: string, updates: Partial<Donation>): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, donationId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating donation:', error);
    }
  }

  // Delete a donation
  public async deleteDonation(donationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, donationId));
    } catch (error) {
      console.error('Error deleting donation:', error);
    }
  }

  // Get donation by ID
  public async getDonationById(donationId: string): Promise<Donation | null> {
    try {
      const docSnap = await getDoc(doc(db, this.COLLECTION_NAME, donationId));
      if (docSnap.exists()) {
        return this.convertDocToDonation(docSnap.id, docSnap.data());
      }
      return null;
    } catch (error) {
      console.error('Error getting donation by id:', error);
      return null;
    }
  }

  // Get nearby donations
  public async getNearbyDonations(lat: number, lng: number, radiusKm: number = 10, address?: string): Promise<Donation[]> {
    const all = await this.getDonationsByStatus('available');
    
    return all
      .map(donation => ({
        ...donation,
        distance: this.calculateDistance(lat, lng, donation.location.lat, donation.location.lng)
      }))
      .filter(donation => {
        if (address && donation.location?.address) {
          if (LocationService.addressesMatch(address, donation.location.address)) {
            return true;
          }
        }
        return donation.distance <= radiusKm;
      })
      .sort((a, b) => a.distance - b.distance);
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}

export const donationStorage = new DonationStorageService(); 