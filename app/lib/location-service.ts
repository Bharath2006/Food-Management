// Location service for handling geocoding, distance calculations, and location-based matching

export interface Location {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface LocationWithDistance extends Location {
  distance: number; // in kilometers
}

export class LocationService {
  // Calculate distance between two points using Haversine formula
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Normalize address for consistent matching
  static normalizeAddress(address: string): string {
    return address
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[.,]/g, '') // Remove punctuation
      .replace(/\bstreet\b/gi, 'st')
      .replace(/\bavenue\b/gi, 'ave')
      .replace(/\broad\b/gi, 'rd')
      .replace(/\bboulevard\b/gi, 'blvd')
      .replace(/\bdrive\b/gi, 'dr')
      .replace(/\blane\b/gi, 'ln');
  }

  // Generate consistent coordinates from address string (hash-based)
  static generateCoordinatesFromAddress(address: string): { lat: number; lng: number } {
    // Create a simple hash from the address string for consistent coordinates
    let hash = 0;
    const normalized = this.normalizeAddress(address);
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Detect if address is in India based on keywords
    const isIndia = normalized.includes('india') || normalized.includes('tamil') || 
                    normalized.includes('karnataka') || normalized.includes('maharashtra') ||
                    normalized.includes('delhi') || normalized.includes('gujarat') ||
                    normalized.includes('rajasthan') || normalized.includes('west bengal') ||
                    normalized.includes('telangana') || normalized.includes('coimbatore') ||
                    normalized.includes('chennai') || normalized.includes('bangalore') ||
                    normalized.includes('mumbai') || normalized.includes('hyderabad') ||
                    normalized.includes('pune') || normalized.includes('kolkata') ||
                    normalized.includes('ahmedabad') || normalized.includes('jaipur') ||
                    normalized.includes('madurai') || normalized.includes('salem') ||
                    normalized.includes('tirunelveli') || normalized.includes('trichy') ||
                    normalized.includes('tiruppur');
    
    if (isIndia) {
      // India coordinates: lat 8-37, lng 68-97
      // Use different hash logic for lat and lng to avoid diagonal lines
      const lat = 8 + (Math.abs(hash) % 2900) / 100;
      const lng = 68 + (Math.abs(hash * 31 + 7) % 2900) / 100;
      return { lat, lng };
    } else {
      // Default to US bounds
      const lat = 25 + (Math.abs(hash) % 2500) / 100;
      const lng = -125 + (Math.abs(hash * 31 + 7) % 6000) / 100;
      return { lat, lng };
    }
  }

  // Geocode address to coordinates using Google Geocoding API (mock implementation)
  static async geocodeAddress(address: string): Promise<Location> {
    // In production, you would use Google Geocoding API
    // For now, we'll use mock coordinates based on common cities
    
    const mockLocations: { [key: string]: Location } = {
      // US Cities
      'new york': { lat: 40.7128, lng: -74.0060, address: 'New York, NY', city: 'New York', state: 'NY', country: 'USA' },
      'los angeles': { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA', city: 'Los Angeles', state: 'CA', country: 'USA' },
      'chicago': { lat: 41.8781, lng: -87.6298, address: 'Chicago, IL', city: 'Chicago', state: 'IL', country: 'USA' },
      'houston': { lat: 29.7604, lng: -95.3698, address: 'Houston, TX', city: 'Houston', state: 'TX', country: 'USA' },
      'phoenix': { lat: 33.4484, lng: -112.0740, address: 'Phoenix, AZ', city: 'Phoenix', state: 'AZ', country: 'USA' },
      'philadelphia': { lat: 39.9526, lng: -75.1652, address: 'Philadelphia, PA', city: 'Philadelphia', state: 'PA', country: 'USA' },
      'san antonio': { lat: 29.4241, lng: -98.4936, address: 'San Antonio, TX', city: 'San Antonio', state: 'TX', country: 'USA' },
      'san diego': { lat: 32.7157, lng: -117.1611, address: 'San Diego, CA', city: 'San Diego', state: 'CA', country: 'USA' },
      'dallas': { lat: 32.7767, lng: -96.7970, address: 'Dallas, TX', city: 'Dallas', state: 'TX', country: 'USA' },
      'san jose': { lat: 37.3382, lng: -121.8863, address: 'San Jose, CA', city: 'San Jose', state: 'CA', country: 'USA' },
      'mississippi': { lat: 33.1581, lng: -89.7452, address: 'Mississippi, USA', city: 'Mississippi', state: 'MS', country: 'USA' },
      // Indian Cities
      'coimbatore': { lat: 11.0168, lng: 76.9558, address: 'Coimbatore, Tamil Nadu', city: 'Coimbatore', state: 'Tamil Nadu', country: 'India' },
      'chennai': { lat: 13.0827, lng: 80.2707, address: 'Chennai, Tamil Nadu', city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
      'bangalore': { lat: 12.9716, lng: 77.5946, address: 'Bangalore, Karnataka', city: 'Bangalore', state: 'Karnataka', country: 'India' },
      'mumbai': { lat: 19.0760, lng: 72.8777, address: 'Mumbai, Maharashtra', city: 'Mumbai', state: 'Maharashtra', country: 'India' },
      'delhi': { lat: 28.6139, lng: 77.2090, address: 'Delhi', city: 'Delhi', state: 'Delhi', country: 'India' },
      'hyderabad': { lat: 17.3850, lng: 78.4867, address: 'Hyderabad, Telangana', city: 'Hyderabad', state: 'Telangana', country: 'India' },
      'pune': { lat: 18.5204, lng: 73.8567, address: 'Pune, Maharashtra', city: 'Pune', state: 'Maharashtra', country: 'India' },
      'kolkata': { lat: 22.5726, lng: 88.3639, address: 'Kolkata, West Bengal', city: 'Kolkata', state: 'West Bengal', country: 'India' },
      'ahmedabad': { lat: 23.0225, lng: 72.5714, address: 'Ahmedabad, Gujarat', city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
      'jaipur': { lat: 26.9124, lng: 75.7873, address: 'Jaipur, Rajasthan', city: 'Jaipur', state: 'Rajasthan', country: 'India' },
      'madurai': { lat: 9.9252, lng: 78.1198, address: 'Madurai, Tamil Nadu', city: 'Madurai', state: 'Tamil Nadu', country: 'India' },
      'salem': { lat: 11.6643, lng: 78.1460, address: 'Salem, Tamil Nadu', city: 'Salem', state: 'Tamil Nadu', country: 'India' },
      'tirunelveli': { lat: 8.7139, lng: 77.7567, address: 'Tirunelveli, Tamil Nadu', city: 'Tirunelveli', state: 'Tamil Nadu', country: 'India' },
      'trichy': { lat: 10.7905, lng: 78.7047, address: 'Trichy, Tamil Nadu', city: 'Trichy', state: 'Tamil Nadu', country: 'India' },
      'tiruppur': { lat: 11.1085, lng: 77.3411, address: 'Tiruppur, Tamil Nadu', city: 'Tiruppur', state: 'Tamil Nadu', country: 'India' }
    };

    const lowerAddress = address.toLowerCase().trim();
    
    // Try to find a match in mock locations (check if address contains city name)
    for (const [city, location] of Object.entries(mockLocations)) {
      if (lowerAddress.includes(city) || lowerAddress === city) {
        // Return location with the original address preserved
        return {
          ...location,
          address: address.trim() // Keep the original typed address
        };
      }
    }
    
    // If no match found, check if it's a partial match (e.g., "coimb" matches "coimbatore")
    for (const [city, location] of Object.entries(mockLocations)) {
      if (city.includes(lowerAddress) && lowerAddress.length >= 3) {
        return {
          ...location,
          address: address.trim()
        };
      }
    }

    // If no match found, generate consistent coordinates from address
    // This ensures the same address always gets the same coordinates
    const coords = this.generateCoordinatesFromAddress(address);
    const parsed = this.parseAddress(address);
    
    return {
      lat: coords.lat,
      lng: coords.lng,
      address: address, // Keep the original typed address
      city: parsed.city,
      state: parsed.state,
      zipCode: parsed.zipCode,
      country: parsed.country || 'USA'
    };
  }

  // Check if two addresses match (fuzzy matching)
  static addressesMatch(address1: string, address2: string, threshold: number = 0.7): boolean {
    const normalized1 = this.normalizeAddress(address1);
    const normalized2 = this.normalizeAddress(address2);
    
    // Exact match
    if (normalized1 === normalized2) return true;
    
    // Check if one address contains the other (for partial matches)
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
      return true;
    }
    
    // Calculate similarity using simple word matching
    const words1 = normalized1.split(' ').filter(w => w.length > 2);
    const words2 = normalized2.split(' ').filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return false;
    
    const matchingWords = words1.filter(w => words2.includes(w)).length;
    const similarity = matchingWords / Math.max(words1.length, words2.length);
    
    return similarity >= threshold;
  }

  // Find nearby locations within a specified radius
  static findNearbyLocations(
    centerLocation: Location,
    locations: Location[],
    maxDistance: number = 10 // Default 10km radius
  ): LocationWithDistance[] {
    return locations
      .map(location => ({
        ...location,
        distance: this.calculateDistance(
          centerLocation.lat,
          centerLocation.lng,
          location.lat,
          location.lng
        )
      }))
      .filter(location => location.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
  }

  // Format distance for display
  static formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  }

  // Get estimated travel time (mock implementation)
  static getEstimatedTravelTime(distance: number, mode: 'driving' | 'walking' | 'cycling' = 'driving'): string {
    const speeds = {
      driving: 30, // km/h in city
      walking: 5,  // km/h
      cycling: 15  // km/h
    };
    
    const timeInHours = distance / speeds[mode];
    const timeInMinutes = Math.round(timeInHours * 60);
    
    if (timeInMinutes < 60) {
      return `${timeInMinutes} min`;
    } else {
      const hours = Math.floor(timeInMinutes / 60);
      const minutes = timeInMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }

  // Validate location data
  static validateLocation(location: Partial<Location>): boolean {
    return !!(
      location.lat &&
      location.lng &&
      location.address &&
      location.lat >= -90 && location.lat <= 90 &&
      location.lng >= -180 && location.lng <= 180
    );
  }

  // Parse address components
  static parseAddress(address: string): {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  } {
    const parts = address.split(',').map(part => part.trim());
    const result: any = {};
    
    if (parts.length >= 1) result.street = parts[0];
    if (parts.length >= 2) result.city = parts[1];
    if (parts.length >= 3) result.state = parts[2];
    if (parts.length >= 4) result.zipCode = parts[3];
    if (parts.length >= 5) result.country = parts[4];
    
    return result;
  }
}

export const locationService = new LocationService(); 