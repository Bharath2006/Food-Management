'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Truck, 
  Building, 
  CheckCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { user, updateUserRole } = useAuth();

  const roles = [
    {
      id: 'donor',
      title: 'Food Donor',
      description: 'Share surplus food with those in need',
      icon: Heart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      features: [
        'Upload food photos with AI analysis',
        'Track donation status',
        'Generate QR codes for pickup',
        'View donation history'
      ]
    },
    {
      id: 'volunteer',
      title: 'Volunteer',
      description: 'Help collect and deliver food to communities',
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: [
        'Browse available donations',
        'Accept pickup missions',
        'Track delivery progress',
        'Earn volunteer credits'
      ]
    },
    {
      id: 'ngo',
      title: 'NGO Partner',
      description: 'Receive and distribute food to beneficiaries',
      icon: Building,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: [
        'Manage food inventory',
        'Coordinate with volunteers',
        'Track distribution metrics',
        'Access donor network'
      ]
    }
  ];

  const handleRoleSelect = async (roleId: string) => {
    setSelectedRole(roleId);
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user role
      updateUserRole(roleId as any);
      
      // Redirect to appropriate dashboard
      switch (roleId) {
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
    } catch (error) {
      console.error('Error updating role:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">Z</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Role</h2>
          <p className="text-gray-600">
            Welcome, {user?.name}! How would you like to contribute to Zero Food Hero?
          </p>
        </motion.div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className={`relative cursor-pointer transition-all duration-300 ${
                  isSelected 
                    ? 'transform scale-105 shadow-xl' 
                    : 'hover:transform hover:scale-105 hover:shadow-lg'
                }`}
              >
                <div
                  onClick={() => !isLoading && handleRoleSelect(role.id)}
                  className={`bg-white rounded-xl p-6 border-2 transition-all duration-300 ${
                    isSelected 
                      ? `${role.borderColor} shadow-xl` 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Role Icon */}
                  <div className={`w-16 h-16 ${role.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${role.color}`} />
                  </div>

                  {/* Role Title */}
                  <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                    {role.title}
                  </h3>

                  {/* Role Description */}
                  <p className="text-gray-600 text-center mb-6">
                    {role.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-3 mb-6">
                    {role.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + featureIndex * 0.05 }}
                        className="flex items-center space-x-2 text-sm text-gray-600"
                      >
                        <CheckCircle className={`w-4 h-4 ${role.color} flex-shrink-0`} />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* Select Button */}
                  <button
                    onClick={() => !isLoading && handleRoleSelect(role.id)}
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                      isSelected
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading && selectedRole === role.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span>{isSelected ? 'Selected' : 'Select Role'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500">
            You can change your role anytime from your profile settings
          </p>
        </motion.div>
      </div>
    </div>
  );
} 