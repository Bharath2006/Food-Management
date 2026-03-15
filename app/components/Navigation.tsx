'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home, 
  Upload, 
  MapPin, 
  Users, 
  Bell,
  User,
  Info,
  Phone,
  QrCode,
  LogOut,
  Settings,
  ChevronDown,
  Building,
  Truck,
  Heart,
  Activity,
  ShoppingCart,
  Package
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import NotificationCenter from './NotificationCenter';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, signOut, updateUserRole } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'About Us', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Phone },
    { name: 'QR Scanner', href: '/scan', icon: QrCode },
  ];

  // Role-based navigation items
  const getRoleNavigation = () => {
    if (user?.role === 'volunteer') {
      return [
        { name: 'Volunteer Hub', href: '/volunteer/hub', icon: Users },
        { name: 'My Deliveries', href: '/volunteer/deliveries', icon: Truck },
      ];
    }
    if (user?.role === 'donor') {
      return [
        { name: 'Donor Dashboard', href: '/donor/dashboard', icon: Heart },
      ];
    }
    if (user?.role === 'ngo') {
      return [
        { name: 'NGO Portal', href: '/ngo/portal', icon: Building },
        { name: 'Food Availability', href: '/ngo/food-availability', icon: ShoppingCart },
        { name: 'My Orders', href: '/ngo/orders', icon: Package },
      ];
    }
    return [];
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'donor': return Heart;
      case 'volunteer': return Truck;
      case 'ngo': return Building;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'donor': return 'text-green-600';
      case 'volunteer': return 'text-blue-600';
      case 'ngo': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'donor': return 'Food Donor';
      case 'volunteer': return 'Volunteer';
      case 'ngo': return 'NGO Partner';
      default: return 'User';
    }
  };

  const handleSignOut = () => {
    signOut();
    setShowUserMenu(false);
    router.push('/');
  };

  const handleRoleChange = (newRole: string) => {
    updateUserRole(newRole as any);
    setShowUserMenu(false);
    // Redirect to appropriate dashboard only if user chooses a role
    switch (newRole) {
      case 'donor':
        router.push('/donor/dashboard');
        break;
      case 'volunteer':
        router.push('/volunteer/hub');
        break;
      case 'ngo':
        router.push('/ngo/portal');
        break;
      default:
        router.push('/');
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="text-sm font-bold text-gray-900 whitespace-nowrap">Zero Food Hero</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Role-based navigation */}
            {getRoleNavigation().map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && <NotificationCenter />}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="max-w-32 truncate">{user?.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {(() => {
                          const RoleIcon = getRoleIcon(user?.role || '');
                          return (
                            <>
                              <RoleIcon className={`w-4 h-4 ${getRoleColor(user?.role || '')}`} />
                              <span className={`text-sm font-medium ${getRoleColor(user?.role || '')}`}>
                                {getRoleName(user?.role || '')}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Role Change Options */}
                    <div className="py-1">
                      <p className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Change Role
                      </p>
                      {['donor', 'volunteer', 'ngo'].map((role) => {
                        const RoleIcon = getRoleIcon(role);
                        return (
                          <button
                            key={role}
                            onClick={() => handleRoleChange(role)}
                            disabled={user?.role === role}
                            className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-left transition-colors ${
                              user?.role === role
                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <RoleIcon className={`w-4 h-4 ${getRoleColor(role)}`} />
                            <span>{getRoleName(role)}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="border-t border-gray-200 py-1">
                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Account Settings</span>
                      </Link>
                      <Link
                        href="/demo"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Activity className="w-4 h-4" />
                        <span>Demo</span>
                      </Link>
                      <Link
                        href="/test-notifications"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Bell className="w-4 h-4" />
                        <span>Test Notifications</span>
                      </Link>
                      <Link
                        href="/test-donations"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span>Test Donations</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <>
                <Link 
                  href="/auth/signin"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup"
                  className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t border-gray-200"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Role-based navigation mobile */}
            {getRoleNavigation().map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
              {isAuthenticated ? (
                <>
                  {/* User Info Mobile */}
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {(() => {
                        const RoleIcon = getRoleIcon(user?.role || '');
                        return (
                          <>
                            <RoleIcon className={`w-4 h-4 ${getRoleColor(user?.role || '')}`} />
                            <span className={`text-sm font-medium ${getRoleColor(user?.role || '')}`}>
                              {getRoleName(user?.role || '')}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Role Change Mobile */}
                  <div className="px-3 py-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Change Role
                    </p>
                    {['donor', 'volunteer', 'ngo'].map((role) => {
                      const RoleIcon = getRoleIcon(role);
                      return (
                        <button
                          key={role}
                          onClick={() => {
                            handleRoleChange(role);
                            setIsOpen(false);
                          }}
                          disabled={user?.role === role}
                          className={`w-full flex items-center space-x-3 px-3 py-2 text-sm text-left transition-colors rounded-md ${
                            user?.role === role
                              ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <RoleIcon className={`w-4 h-4 ${getRoleColor(role)}`} />
                          <span>{getRoleName(role)}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions Mobile */}
                                     <Link 
                     href="/settings"
                     onClick={() => setIsOpen(false)}
                     className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors w-full"
                   >
                     <Settings className="w-5 h-5" />
                     <span>Account Settings</span>
                   </Link>
                  <Link 
                    href="/demo"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors w-full"
                  >
                    <Activity className="w-5 h-5" />
                    <span>Demo</span>
                  </Link>
                  <Link 
                    href="/test-notifications"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors w-full"
                  >
                    <Bell className="w-5 h-5" />
                    <span>Test Notifications</span>
                  </Link>
                  <Link 
                    href="/test-donations"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors w-full"
                  >
                    <Heart className="w-5 h-5" />
                    <span>Test Donations</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/signin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors w-full"
                  >
                    <User className="w-5 h-5" />
                    <span>Sign In</span>
                  </Link>
                  <Link 
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors w-full"
                  >
                    <User className="w-5 h-5" />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
} 