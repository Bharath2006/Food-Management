'use client';

import Link from 'next/link';
import { 
  Heart, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Globe,
  Users,
  Truck,
  Building
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-green-500" />
              <span className="text-xl font-bold">Zero Food Hero</span>
            </div>
            <p className="text-gray-300 text-sm">
              Connecting food donors with volunteers and NGOs to reduce food waste and help those in need.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/donor/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Donor Dashboard
                </Link>
              </li>
              <li>
                <Link href="/volunteer/hub" className="text-gray-300 hover:text-white transition-colors">
                  Volunteer Hub
                </Link>
              </li>
              <li>
                <Link href="/ngo/portal" className="text-gray-300 hover:text-white transition-colors">
                  NGO Portal
                </Link>
              </li>
              <li>
                <Link href="/scan" className="text-gray-300 hover:text-white transition-colors">
                  QR Scanner
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2 text-gray-300">
                <Users className="w-4 h-4" />
                <span>Food Donation</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-300">
                <Truck className="w-4 h-4" />
                <span>Volunteer Pickup</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-300">
                <Building className="w-4 h-4" />
                <span>NGO Distribution</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-300">
                <Globe className="w-4 h-4" />
                <span>AI Food Recognition</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span>support@zerofoodhero.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span>9791499819</span>
              </div>
              <div className="flex items-start space-x-2 text-gray-300">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>Nehru Street,Coimbatore 641-669</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} Zero Food Hero. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 