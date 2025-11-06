import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/common/Layout';
import JobCard from '../components/common/JobCard';
import AdvancedSearch from '../components/search/AdvancedSearch';
import ProfileCompleteness from '../components/profile/ProfileCompleteness';
import WorkerBadgeCard from '../components/badges/WorkerBadgeCard';
import AadhaarUpload from '../components/documents/AadhaarUpload';
import { FiBriefcase, FiDollarSign, FiMapPin, FiFileText } from 'react-icons/fi';
import { jobService } from '../services/jobService';
import api from '../services/api';

const WorkerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filteredJobs, setFilteredJobs] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsData, profileData] = await Promise.all([
        jobService.discoverJobs({ maxDistance: 50 }),
        api.get('/profiles/my-profile')
      ]);
      const jobsList = jobsData.jobs || jobsData || [];
      setJobs(jobsList);
      setFilteredJobs(jobsList);
      setProfile(profileData.profile || profileData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters) => {
    let filtered = jobs;
    
    if (filters.query) {
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(filters.query.toLowerCase()) ||
        job.description?.toLowerCase().includes(filters.query.toLowerCase())
      );
    }
    
    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location?.city?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.payMin) {
      filtered = filtered.filter(job => job.payPerPerson >= parseFloat(filters.payMin));
    }
    
    if (filters.payMax) {
      filtered = filtered.filter(job => job.payPerPerson <= parseFloat(filters.payMax));
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(job => job.status === filters.status);
    }
    
    if (filters.skills.length > 0) {
      filtered = filtered.filter(job => 
        filters.skills.some(skill => 
          job.requiredSkills?.some(jobSkill => 
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }
    
    setFilteredJobs(filtered);
  };
  
  const handleReset = () => {
    setFilteredJobs(jobs);
  };

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
              <AdvancedSearch
                onSearch={handleSearch}
                onReset={handleReset}
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
                      className="relative"
                    >
                      <JobCard job={job} showMatchScore userLocation={profile?.location} />
                      {job.isAccepted && (
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => navigate(`/events/${job.eventId}/work-hours`)}
                            className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                          >
                            Work Hours
                          </button>
                        </div>
                      )}
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
              <WorkerBadgeCard />
              {profile && <ProfileCompleteness profile={profile} />}
              
              {/* Document Upload Section */}
              <div className="mt-6">
                <AadhaarUpload onUploadComplete={() => fetchData()} />
              </div>
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
