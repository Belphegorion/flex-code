import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiClock, FiCheckCircle, FiXCircle, FiCalendar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import StartWorkButton from '../components/work/StartWorkButton';
import api from '../services/api';

export default function WorkerDashboard() {
  const [applications, setApplications] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
    fetchAcceptedJobs();
  }, []);
  const navigate = useNavigate();

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my-applications');
      setApplications(res.applications || []);
    } catch (error) {
      toast.error('Failed to load applications');
    }
  };

  const fetchAcceptedJobs = async () => {
    try {
      const res = await api.get('/jobs/my-jobs');
      setAcceptedJobs(res.jobs || []);
    } catch (error) {
      toast.error('Failed to load accepted jobs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <FiCheckCircle className="text-green-500" />;
      case 'rejected':
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiClock className="text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <div className="max-w-xs">
            <StartWorkButton />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Accepted Jobs */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FiCheckCircle className="text-green-600" />
              My Active Jobs ({acceptedJobs.length})
            </h2>
            
            {acceptedJobs.length === 0 ? (
              <div className="text-center py-8">
                <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No active jobs yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {acceptedJobs.map(job => (
                  <div key={job._id} className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{job.title}</h3>
                      <span className="text-green-600 font-bold">${job.payPerPerson}/hr</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {job.eventId?.title}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <FiCalendar size={14} />
                        {new Date(job.eventId?.dateStart).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Job Applications */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FiClock className="text-blue-600" />
              My Applications ({applications.length})
            </h2>
            
                {applications.length === 0 ? (
              <div className="text-center py-8">
                <FiClock className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 mb-4">No applications yet</p>
                <button onClick={() => navigate('/jobs')} className="btn-primary">Find Work</button>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {applications.map(application => (
                  <div key={application._id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{application.jobId?.title}</h3>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(application.status)}
                        <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {application.jobId?.eventId?.title}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                      <span className="font-medium">${application.jobId?.payPerPerson}/hr</span>
                    </div>
                    {application.coverLetter && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                        <strong>Cover Letter:</strong> {application.coverLetter}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {applications.filter(app => app.status === 'accepted').length}
            </div>
            <div className="text-sm text-gray-600">Accepted Applications</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter(app => app.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending Applications</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {acceptedJobs.length}
            </div>
            <div className="text-sm text-gray-600">Active Jobs</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}