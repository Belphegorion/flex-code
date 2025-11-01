import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/common/Layout';
import { FiStar, FiMapPin, FiBriefcase, FiAward } from 'react-icons/fi';
import api from '../services/api';

const ProfileView = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/profiles/${id}`);
      setProfile(res.data.profile || res.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Profile not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 bg-primary-600 text-white rounded-full flex items-center justify-center text-3xl font-bold">
              {profile.userId?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{profile.userId?.name || 'User'}</h1>
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                {profile.location?.city && (
                  <div className="flex items-center gap-1">
                    <FiMapPin size={16} />
                    <span>{profile.location.city}</span>
                  </div>
                )}
                {profile.userId?.ratingAvg > 0 && (
                  <div className="flex items-center gap-1">
                    <FiStar size={16} className="text-yellow-400" />
                    <span>{profile.userId.ratingAvg.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {profile.bio && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
            </div>
          )}

          {profile.skills?.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <FiBriefcase />
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {profile.userId?.completedJobsCount || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Jobs Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {profile.userId?.ratingCount || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {((profile.userId?.reliabilityScore || 1) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Reliability</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {profile.userId?.ratingAvg?.toFixed(1) || 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ProfileView;
