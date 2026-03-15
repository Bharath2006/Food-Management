'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Search, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Navigation,
  Clock,
  Users
} from 'lucide-react';
import { LocationService, Location, LocationWithDistance } from '@/app/lib/location-service';

interface LocationPickerProps {
  onLocationSelect: (location: Location) => void;
  currentLocation?: Location;
  showNearbyLocations?: boolean;
  maxDistance?: number;
  placeholder?: string;
  className?: string;
}

export default function LocationPicker({
  onLocationSelect,
  currentLocation,
  showNearbyLocations = false,
  maxDistance = 10,
  placeholder = "Enter your address...",
  className = ""
}: LocationPickerProps) {
  const [address, setAddress] = useState(currentLocation?.address || '');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodedLocation, setGeocodedLocation] = useState<Location | null>(currentLocation || null);
  const [error, setError] = useState<string | null>(null);
  const [nearbyLocations, setNearbyLocations] = useState<LocationWithDistance[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mock nearby locations for demonstration
  const mockNearbyLocations: Location[] = [
    { lat: 40.7128, lng: -74.0060, address: '123 Main St, New York, NY 10001', city: 'New York', state: 'NY' },
    { lat: 40.7589, lng: -73.9851, address: '456 Broadway, New York, NY 10013', city: 'New York', state: 'NY' },
    { lat: 40.7505, lng: -73.9934, address: '789 5th Ave, New York, NY 10022', city: 'New York', state: 'NY' },
    { lat: 40.7484, lng: -73.9857, address: '321 Madison Ave, New York, NY 10017', city: 'New York', state: 'NY' },
    { lat: 40.7614, lng: -73.9776, address: '654 Park Ave, New York, NY 10065', city: 'New York', state: 'NY' },
  ];

  useEffect(() => {
    if (showNearbyLocations && geocodedLocation) {
      const nearby = LocationService.findNearbyLocations(geocodedLocation, mockNearbyLocations, maxDistance);
      setNearbyLocations(nearby);
    }
  }, [geocodedLocation, showNearbyLocations, maxDistance]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    setError(null);
    setShowSuggestions(true);
  };

  const handleGeocode = async () => {
    if (!address.trim()) {
      setError('Please enter an address');
      return;
    }

    setIsGeocoding(true);
    setError(null);

    try {
      // Always geocode to get coordinates, but accept the typed address
      const location = await LocationService.geocodeAddress(address);
      // Ensure the original typed address is preserved
      location.address = address.trim();
      setGeocodedLocation(location);
      onLocationSelect(location);
      setShowSuggestions(false);
    } catch (err) {
      // Even if geocoding fails, accept the address with default coordinates
      const defaultLocation: Location = {
        ...LocationService.generateCoordinatesFromAddress(address),
        address: address.trim(),
        country: 'USA'
      };
      setGeocodedLocation(defaultLocation);
      onLocationSelect(defaultLocation);
      setShowSuggestions(false);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleLocationSelect = (location: Location) => {
    setAddress(location.address);
    setGeocodedLocation(location);
    onLocationSelect(location);
    setShowSuggestions(false);
    setError(null);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGeocoding(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const location: Location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: 'Current Location',
              city: 'Current Location',
              state: 'Current Location',
              country: 'Current Location'
            };
            setGeocodedLocation(location);
            onLocationSelect(location);
            setAddress('Current Location');
          } catch (err) {
            setError('Failed to get current location');
          } finally {
            setIsGeocoding(false);
          }
        },
        (err) => {
          setError('Unable to get current location. Please enter address manually.');
          setIsGeocoding(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Address Input */}
      <div className="relative">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={address}
              onChange={handleAddressChange}
              onBlur={() => {
                // Auto-accept address when user leaves the field (if address is provided)
                if (address.trim() && !geocodedLocation) {
                  handleGeocode();
                }
              }}
              placeholder={placeholder || "Type location (e.g., Coimbatore, Chennai, Bangalore)..."}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              onFocus={() => setShowSuggestions(true)}
            />
          </div>
          <button
            onClick={handleGeocode}
            disabled={isGeocoding || !address.trim()}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isGeocoding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Find</span>
          </button>
        </div>

        {/* Current Location Button */}
        <button
          onClick={handleUseCurrentLocation}
          disabled={isGeocoding}
          className="mt-2 text-sm text-green-600 hover:text-green-700 flex items-center space-x-1 disabled:opacity-50"
        >
          <Navigation className="w-4 h-4" />
          <span>Use Current Location</span>
        </button>
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

      {/* Geocoded Location Display */}
      {geocodedLocation && !error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-green-900">Location Found</h4>
              <p className="text-green-700 text-sm">{geocodedLocation.address}</p>
              <div className="mt-2 flex items-center space-x-4 text-xs text-green-600">
                <span>Lat: {geocodedLocation.lat.toFixed(4)}</span>
                <span>Lng: {geocodedLocation.lng.toFixed(4)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Nearby Locations */}
      {showNearbyLocations && nearbyLocations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Nearby Locations (within {maxDistance}km)</span>
          </h4>
          <div className="space-y-2">
            {nearbyLocations.map((location, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleLocationSelect(location)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{location.address}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Navigation className="w-3 h-3" />
                        <span>{LocationService.formatDistance(location.distance)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{LocationService.getEstimatedTravelTime(location.distance)}</span>
                      </span>
                    </div>
                  </div>
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Address Suggestions */}
      {showSuggestions && address && !geocodedLocation && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <div className="p-2">
            <div className="text-sm text-gray-500 mb-2">Popular addresses:</div>
            {[
              '123 Main St, New York, NY 10001',
              '456 Broadway, New York, NY 10013',
              '789 5th Ave, New York, NY 10022',
              '321 Madison Ave, New York, NY 10017',
              '654 Park Ave, New York, NY 10065'
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleLocationSelect({
                  lat: 40.7128 + (index * 0.01),
                  lng: -74.0060 + (index * 0.01),
                  address: suggestion,
                  city: 'New York',
                  state: 'NY'
                })}
                className="w-full text-left p-2 hover:bg-gray-100 rounded text-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
} 