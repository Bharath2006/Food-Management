import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  // Handle invalid dates
  if (!date || isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return format(date, "MMM dd, yyyy");
}

export function formatDateTime(date: Date): string {
  // Handle invalid dates
  if (!date || isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return format(date, "MMM dd, yyyy 'at' HH:mm");
}

export function timeAgo(date: Date): string {
  // Handle invalid dates
  if (!date || isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return formatDistanceToNow(date, { addSuffix: true });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'picked':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'delivered':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'expired':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getStatusIcon(status: string): string {
  switch (status) {
    case 'pending':
      return '⏳';
    case 'picked':
      return '🚚';
    case 'delivered':
      return '✅';
    case 'expired':
      return '❌';
    default:
      return '❓';
  }
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function generateQRCode(data: string): string {
  // Create a simple URL-based QR code for better mobile compatibility
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://zero-food-hero.vercel.app';
  return `${baseUrl}/scan/${data}`;
}

export function generateSimpleQRCode(donation: any): string {
  // Create a very simple QR code that's easy to scan
  const simpleData = `ZERO FOOD HERO
${donation.foodType || "Food"}
${donation.quantity || "0"} ${donation.unit || "units"}
${donation.donorName || "Anonymous"}
${donation.location?.address || "Unknown Location"}`;
  
  return simpleData;
}

export function generateReadableQRCode(donation: any): string {
  // Create a simple, clean QR code with donation details
  const simpleData = `ZERO FOOD HERO DONATION

Food: ${donation.foodType || "Food Item"}
Quantity: ${donation.quantity ? `${donation.quantity} ${donation.unit}` : "Unknown"}
Status: ${donation.status || "pending"}
Expires: ${donation.expiry ? new Date(donation.expiry).toLocaleDateString() : "Unknown"}

Donor: ${donation.donorName || "Anonymous"}
Location: ${donation.location?.address || "Unknown Location"}

Scan to view full details and claim this donation!`;
  
  return simpleData;
}

export function formatQuantity(quantity: number, unit: string): string {
  return `${quantity} ${unit}${quantity !== 1 ? 's' : ''}`;
}

export function isExpired(date: Date): boolean {
  // Handle invalid dates
  if (!date || isNaN(date.getTime())) {
    return true; // Consider invalid dates as expired
  }
  return new Date() > date;
}

export function getExpiryStatus(expiry: Date): 'fresh' | 'expiring_soon' | 'expired' {
  // Handle invalid dates
  if (!expiry || isNaN(expiry.getTime())) {
    return 'expired'; // Consider invalid dates as expired
  }
  
  const now = new Date();
  const diffInHours = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 0) return 'expired';
  if (diffInHours < 24) return 'expiring_soon';
  return 'fresh';
}

export function generateDonationId(): string {
  return `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function validateImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  return validTypes.includes(file.type) && file.size <= maxSize;
}

export function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        const compressedFile = new File([blob!], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        resolve(compressedFile);
      }, 'image/jpeg', 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
} 

export function calculateImpactMetrics(donations: any[]) {
  const totalDonations = donations.length;
  const deliveredDonations = donations.filter(d => d.status === 'delivered').length;
  const pendingDonations = donations.filter(d => d.status === 'pending').length;
  const pickedDonations = donations.filter(d => d.status === 'picked').length;
  
  // Calculate total food saved (in kg)
  const totalFoodSaved = donations.reduce((total, donation) => {
    const quantity = donation.quantity || 0;
    const unit = donation.unit || 'kg';
    
    // Convert to kg for calculation
    let kgEquivalent = quantity;
    if (unit.toLowerCase().includes('gram') || unit.toLowerCase().includes('g')) {
      kgEquivalent = quantity / 1000;
    } else if (unit.toLowerCase().includes('pound') || unit.toLowerCase().includes('lb')) {
      kgEquivalent = quantity * 0.453592;
    } else if (unit.toLowerCase().includes('ounce') || unit.toLowerCase().includes('oz')) {
      kgEquivalent = quantity * 0.0283495;
    } else if (unit.toLowerCase().includes('liter') || unit.toLowerCase().includes('l')) {
      kgEquivalent = quantity; // Approximate for liquids
    }
    
    return total + kgEquivalent;
  }, 0);
  
  // Calculate meals provided (rough estimate: 0.5kg per meal)
  const mealsProvided = Math.round(totalFoodSaved / 0.5);
  
  // Calculate CO2 saved (rough estimate: 2.5kg CO2 per kg of food waste avoided)
  const co2Saved = totalFoodSaved * 2.5;
  
  // Calculate water saved (rough estimate: 1000L per kg of food)
  const waterSaved = totalFoodSaved * 1000;
  
  return {
    totalDonations,
    deliveredDonations,
    pendingDonations,
    pickedDonations,
    totalFoodSaved: Math.round(totalFoodSaved * 100) / 100,
    mealsProvided,
    co2Saved: Math.round(co2Saved * 100) / 100,
    waterSaved: Math.round(waterSaved),
    completionRate: totalDonations > 0 ? Math.round((deliveredDonations / totalDonations) * 100) : 0
  };
}

export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function getImpactBadge(impact: number): { name: string; color: string; icon: string } {
  if (impact >= 1000) {
    return { name: 'Hero', color: 'bg-purple-500', icon: '🏆' };
  } else if (impact >= 500) {
    return { name: 'Champion', color: 'bg-blue-500', icon: '🥇' };
  } else if (impact >= 100) {
    return { name: 'Supporter', color: 'bg-green-500', icon: '🥈' };
  } else if (impact >= 50) {
    return { name: 'Helper', color: 'bg-yellow-500', icon: '🥉' };
  } else {
    return { name: 'Starter', color: 'bg-gray-500', icon: '⭐' };
  }
}

// Performance optimization: Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Performance optimization: Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
} 