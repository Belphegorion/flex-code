import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../components/common/Layout';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { FiBriefcase, FiUsers, FiDollarSign, FiClock, FiCalendar, FiActivity } from 'react-icons/fi';
import api from '../services/api';

const OrganizerDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      const jobsList = res.jobs || [];
      setJobs(jobsList);
      const total = jobsList.length;
      const open = jobsList.filter(j => j.status === 'open').length;
      const inProgress = jobsList.filter(j => j.status === 'in-progress').length;
      const completed = jobsList.filter(j => j.status === 'completed').length;
      setStats({ total, open, inProgress, completed });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
          <div className="flex gap-3">
            <Link to="/cost-estimator" className="btn-primary flex items-center gap-2">
              <FiDollarSign /> Cost Estimator
            </Link>
            <Link to="/events-hero" className="btn-secondary flex items-center gap-2">
              <FiActivity /> Live Events
            </Link>
            <Link to="/events" className="btn-secondary flex items-center gap-2">
              <FiCalendar /> All Events
            </Link>
            <Link to="/jobs/create" className="btn-secondary">
              + Post Job
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={FiBriefcase} label="Total Jobs" value={stats.total} color="primary" delay={0} />
          <StatCard icon={FiClock} label="Open Jobs" value={stats.open} color="success" delay={0.1} />
          <StatCard icon={FiUsers} label="In Progress" value={stats.inProgress} color="warning" delay={0.2} />
          <StatCard icon={FiDollarSign} label="Completed" value={stats.completed} color="info" delay={0.3} />
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Your Jobs</h2>
          {loading ? (
            <LoadingSpinner />
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <FiBriefcase className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No jobs posted yet</p>
              <Link to="/jobs/create" className="btn-primary inline-block">
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job, idx) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{job.location?.city}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {job.positionsFilled}/{job.totalPositions} filled
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          ${job.payPerPerson}/person
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.status === 'open' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        job.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {job.status}
                      </span>
                      <Link to={`/jobs/${job._id}`} className="text-primary-600 dark:text-primary-400 text-sm hover:underline">
                        View Details →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrganizerDashboard;
