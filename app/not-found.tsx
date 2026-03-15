'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 mb-6">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Popular Pages:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/donor/dashboard"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Donor Dashboard
            </Link>
            <Link
              href="/volunteer/hub"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              Volunteer Hub
            </Link>
            <Link
              href="/ngo/portal"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              NGO Portal
            </Link>
            <Link
              href="/scan"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              QR Scanner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 