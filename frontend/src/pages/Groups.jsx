import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiMessageCircle } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import api from '../services/api';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Groups</h1>

        {groups.length === 0 ? (
          <div className="card p-12 text-center">
            <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">No groups yet</p>
            <p className="text-sm text-gray-400 mt-2">Groups will be created when jobs start</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group, idx) => (
              <motion.div
                key={group._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link
                  to={`/groups/${group._id}`}
                  className="card p-6 hover:shadow-lg transition-shadow block"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <FiUsers size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{group.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {group.jobId?.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {group.participants?.length} members
                    </span>
                    {group.lastMessage && (
                      <span className="text-gray-500 text-xs">
                        {new Date(group.lastMessageAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {group.lastMessage && (
                    <div className="mt-3 pt-3 border-t dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex items-center gap-2">
                        <FiMessageCircle size={14} />
                        {group.lastMessage}
                      </p>
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
