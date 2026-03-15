'use client';

import { motion } from 'framer-motion';
import { 
  Heart, 
  Users, 
  Truck, 
  Building, 
  Globe, 
  Target, 
  Award,
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { icon: Users, label: 'Active Users', value: '10,000+' },
    { icon: Truck, label: 'Volunteers', value: '2,500+' },
    { icon: Building, label: 'Partner NGOs', value: '150+' },
    { icon: Globe, label: 'Cities Covered', value: '25+' }
  ];

  const features = [
    {
      icon: Target,
      title: 'AI-Powered Recognition',
      description: 'Advanced machine learning to identify and categorize food items automatically.'
    },
    {
      icon: Clock,
      title: 'Real-time Matching',
      description: 'Instant connection between donors and recipients for efficient food distribution.'
    },
    {
      icon: Shield,
      title: 'Quality Assurance',
      description: 'Rigorous safety checks and expiry monitoring to ensure food quality.'
    },
    {
      icon: TrendingUp,
      title: 'Impact Tracking',
      description: 'Comprehensive analytics to measure and optimize our impact on food waste reduction.'
    }
  ];

  const team = [
    {
      name: 'Varshini PR',
      role: 'CEO & Founder',
      description: 'Former food industry executive with 15+ years experience in sustainability.'
    },
    {
      name: 'Shana M',
      role: 'CTO',
      description: 'AI/ML expert with background in computer vision and mobile applications.'
    },
    {
      name: 'Lavz',
      role: 'Head of Operations',
      description: 'Non-profit veteran with expertise in food security and community outreach.'
    },
    {
      name: 'Keerthux',
      role: 'Joint Head of Operations',
      description: 'Non-profit veteran with expertise in food security and community outreach.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <Heart className="w-16 h-16 text-green-300" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Zero Food Hero
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
              We're on a mission to eliminate food waste and hunger by connecting surplus food with people who need it most.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto">
              Zero Food Hero is a technology-driven platform that leverages artificial intelligence to identify, 
              categorize, and redistribute surplus food from donors to those in need. We believe that no food 
              should go to waste while people go hungry.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  <stat.icon className="w-12 h-12 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform creates a seamless connection between food donors, volunteers, and NGOs through 
              innovative technology and community engagement.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center p-6"
            >
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Donate Food</h3>
              <p className="text-gray-600">
                Donors upload photos of surplus food. Our AI automatically identifies and categorizes the items.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center p-6"
            >
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Volunteer Pickup</h3>
              <p className="text-gray-600">
                Volunteers receive notifications and can claim donations for pickup and delivery.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-center p-6"
            >
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. NGO Distribution</h3>
              <p className="text-gray-600">
                NGOs receive the food and distribute it to communities in need through their networks.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <feature.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Team</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Meet the passionate individuals behind Zero Food Hero, dedicated to making a difference 
              in food security and sustainability.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-gray-200 w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-16 h-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-green-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">Join Our Mission</h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Whether you're a donor, volunteer, or NGO, you can make a difference in reducing food waste and fighting hunger.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Started Today
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 