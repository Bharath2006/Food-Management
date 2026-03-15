'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Upload, 
  MapPin, 
  Heart, 
  Users, 
  Package, 
  Globe,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [impactStats, setImpactStats] = useState({
    foodSaved: 0,
    donations: 0,
    volunteers: 0,
    ngos: 0
  });

  useEffect(() => {
    // Animate counters on mount
    const animateCounters = () => {
      const targets = {
        foodSaved: 15420,
        donations: 2847,
        volunteers: 156,
        ngos: 23
      };

      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        setImpactStats({
          foodSaved: Math.floor(targets.foodSaved * progress),
          donations: Math.floor(targets.donations * progress),
          volunteers: Math.floor(targets.volunteers * progress),
          ngos: Math.floor(targets.ngos * progress)
        });

        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    };

    animateCounters();
  }, []);

  const workflowSteps = [
    {
      icon: Upload,
      title: 'Upload Food',
      description: 'Take a photo of your surplus food and let AI classify it automatically',
      color: 'bg-blue-500'
    },
    {
      icon: MapPin,
      title: 'Track Pickup',
      description: 'Volunteers will pick up your donation and deliver it to those in need',
      color: 'bg-green-500'
    },
    {
      icon: Heart,
      title: 'Create Impact',
      description: 'Your food reaches people who need it most, reducing waste and hunger',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
            >
              Zero Food Hero
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Connect surplus food with people who need it most. 
              Powered by AI to reduce waste and fight hunger.
            </motion.p>
            
            {/* Impact Counter */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-12 shadow-xl"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                    {impactStats.foodSaved.toLocaleString()} kg
                  </div>
                  <div className="text-gray-600">Food Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                    {impactStats.donations.toLocaleString()}
                  </div>
                  <div className="text-gray-600">Donations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                    {impactStats.volunteers}
                  </div>
                  <div className="text-gray-600">Volunteers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">
                    {impactStats.ngos}
                  </div>
                  <div className="text-gray-600">Partner NGOs</div>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {isAuthenticated ? (
                <>
                  {/* Only show role-specific CTAs if user has a role */}
                  {user?.role === 'donor' && (
                    <Link 
                      href="/donor/dashboard"
                      className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Donate Food
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  )}
                  {user?.role === 'volunteer' && (
                    <Link 
                      href="/volunteer/hub"
                      className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                    >
                      <Users className="w-5 h-5 mr-2" />
                      Become Volunteer
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  )}
                  {user?.role === 'ngo' && (
                    <Link 
                      href="/ngo/portal"
                      className="inline-flex items-center px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
                    >
                      <Users className="w-5 h-5 mr-2" />
                      NGO Portal
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  )}
                  {/* If no role, show choose role CTA */}
                  {!user?.role && (
                    <Link 
                      href="/auth/role-selection"
                      className="inline-flex items-center px-8 py-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
                    >
                      <Users className="w-5 h-5 mr-2" />
                      Choose Your Role
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/signup"
                    className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link 
                    href="/auth/signin"
                    className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Sign In
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                  <Link 
                    href="/ngo/food-availability"
                    className="inline-flex items-center px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
                  >
                    <Package className="w-5 h-5 mr-2" />
                    Receive Food
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to make a difference in your community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${step.color} text-white mb-6 group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Zero Food Hero?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced technology meets human compassion
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                AI-Powered Classification
              </h3>
              <p className="text-gray-600">
                Our advanced AI automatically identifies and categorizes food items from photos, making donation easy and accurate.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Real-Time Tracking
              </h3>
              <p className="text-gray-600">
                Track your donation from pickup to delivery with real-time updates and GPS location tracking.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Community Impact
              </h3>
              <p className="text-gray-600">
                Join a network of volunteers and NGOs working together to reduce food waste and help those in need.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Awareness & Community Building Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Food Waste Awareness
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Understanding the impact and taking action together
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-red-50 border border-red-200 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-red-900 mb-4">Food Waste Facts</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span><strong>1.3 billion tons</strong> of food is wasted globally each year</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span><strong>30-40%</strong> of food in the US goes uneaten</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>Food waste contributes to <strong>8%</strong> of global greenhouse gas emissions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>If food waste were a country, it would be the <strong>3rd largest</strong> emitter</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span><strong>870 million</strong> people go hungry while we waste food</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-green-50 border border-green-200 rounded-xl p-8"
            >
              <h3 className="text-2xl font-bold text-green-900 mb-4">Tips to Reduce Waste</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Plan meals</strong> and buy only what you need</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Store food properly</strong> to extend freshness</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Donate surplus</strong> food before it expires</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Compost</strong> food scraps that can't be donated</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Share meals</strong> with neighbors and community</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong>Support</strong> local food recovery programs</span>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 text-white text-center"
          >
            <h3 className="text-2xl font-bold mb-4">Building a Zero-Waste Mindset</h3>
            <p className="text-lg mb-6 max-w-3xl mx-auto">
              Every small action counts. By working together, we can create a sustainable future where 
              no food goes to waste and everyone has access to nutritious meals. Join our community 
              and be part of the solution!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth/signup"
                className="inline-flex items-center px-6 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Join the Movement
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link 
                href="/about"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-green-600 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of people already helping to reduce food waste and feed communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/signup"
              className="inline-flex items-center px-8 py-4 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Get Started Today
            </Link>
            <Link 
              href="/about"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-green-600 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
