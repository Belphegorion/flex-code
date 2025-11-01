import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/common/Layout';
import StatCard from '../components/common/StatCard';
import { FiDollarSign, FiCalendar, FiUsers, FiTrendingUp } from 'react-icons/fi';

const SponsorDashboard = () => {
  const [events, setEvents] = useState([]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-8">Sponsor Dashboard</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <StatCard
              icon={FiDollarSign}
              label="Total Sponsored"
              value="$0"
              color="success"
              delay={0}
            />
            <StatCard
              icon={FiCalendar}
              label="Active Events"
              value="0"
              color="primary"
              delay={0.1}
            />
            <StatCard
              icon={FiUsers}
              label="Workers Supported"
              value="0"
              color="warning"
              delay={0.2}
            />
            <StatCard
              icon={FiTrendingUp}
              label="ROI"
              value="0%"
              color="success"
              delay={0.3}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <h2 className="text-xl font-semibold mb-4">Events Needing Funding</h2>
              <div className="text-center py-8">
                <FiCalendar className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-600 dark:text-gray-400">No events available for sponsorship</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="card"
            >
              <h2 className="text-xl font-semibold mb-4">Active Sponsorships</h2>
              <div className="text-center py-8">
                <FiDollarSign className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-600 dark:text-gray-400">You haven't sponsored any events yet</p>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card mt-6"
          >
            <h2 className="text-xl font-semibold mb-4">Live Events & Workers</h2>
            <div className="text-center py-8">
              <FiUsers className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-600 dark:text-gray-400">No events currently in progress</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default SponsorDashboard;
