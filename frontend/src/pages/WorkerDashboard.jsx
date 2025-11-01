import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/common/Layout';
import JobCard from '../components/common/JobCard';
import SearchBar from '../components/common/SearchBar';
import { FiBriefcase, FiDollarSign, FiMapPin } from 'react-icons/fi';
import { jobService } from '../services/jobService';
import api from '../services/api';

const WorkerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/profiles/my-profile');
      if (res.profile?.location) {
        setUserLocation({
          lat: res.profile.location.lat,
          lng: res.profile.location.lng
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const data = await jobService.discoverJobs({ maxDistance: 50 });
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-8">Find Work</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="card text-center"
            >
              <FiBriefcase className="mx-auto text-primary-600 dark:text-primary-400 mb-2" size={32} />
              <p className="text-2xl font-bold">{jobs.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available Jobs</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="card text-center"
            >
              <FiDollarSign className="mx-auto text-green-600 dark:text-green-400 mb-2" size={32} />
              <p className="text-2xl font-bold">$0</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Earnings</p>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="card text-center sm:col-span-2 lg:col-span-1"
            >
              <FiMapPin className="mx-auto text-blue-600 dark:text-blue-400 mb-2" size={32} />
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Jobs Completed</p>
            </motion.div>
          </div>

          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search jobs..."
            className="mb-6"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Loading jobs...</p>
              </div>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job, idx) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <JobCard job={job} showMatchScore userLocation={userLocation} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <FiBriefcase className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 dark:text-gray-400">No jobs available at the moment</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default WorkerDashboard;
