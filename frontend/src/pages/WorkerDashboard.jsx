import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/common/Layout';
import JobCard from '../components/common/JobCard';
import SearchBar from '../components/common/SearchBar';
import ProfileCompleteness from '../components/profile/ProfileCompleteness';
import { FiBriefcase, FiDollarSign, FiMapPin } from 'react-icons/fi';
import { jobService } from '../services/jobService';
import api from '../services/api';

const WorkerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsData, profileData] = await Promise.all([
        jobService.discoverJobs({ maxDistance: 50 }),
        api.get('/profiles/my-profile')
      ]);
      setJobs(jobsData.jobs || jobsData || []);
      setProfile(profileData.profile || profileData);
    } catch (error) {
      console.error('Error fetching data:', error);
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <h1 className="text-3xl font-bold mb-8">Find Work</h1>
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search jobs..."
                className="mb-6"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                      <JobCard job={job} showMatchScore userLocation={profile?.location} />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <FiBriefcase className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 dark:text-gray-400">No jobs available at the moment</p>
                  </div>
                )}
              </div>
            </div>
            <aside className="lg:col-span-1">
              <h2 className="text-2xl font-bold mb-4">Your Dashboard</h2>
              {profile && <ProfileCompleteness profile={profile} />}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="card text-center">
                  <FiBriefcase className="mx-auto text-primary-600 dark:text-primary-400 mb-2" size={24} />
                  <p className="text-xl font-bold">{jobs.length}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Available Jobs</p>
                </div>
                <div className="card text-center">
                  <FiDollarSign className="mx-auto text-green-600 dark:text-green-400 mb-2" size={24} />
                  <p className="text-xl font-bold">$0</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Earnings</p>
                </div>
                <div className="card text-center col-span-2">
                  <FiMapPin className="mx-auto text-blue-600 dark:text-blue-400 mb-2" size={24} />
                  <p className="text-xl font-bold">{profile?.userId?.completedJobsCount || 0}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Jobs Completed</p>
                </div>
              </div>
            </aside>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default WorkerDashboard;
