import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSend, FiUsers, FiArrowLeft } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import socketService from '../services/socket';

export default function GroupChat() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [message, setMessage] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchGroup();
    socketService.joinGroup(groupId);

    socketService.onGroupMessage((data) => {
      if (data.groupId === groupId) {
        fetchGroup();
      }
    });

    return () => socketService.offGroupMessage();
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [group?.messages]);

  const fetchGroup = async () => {
    try {
      const res = await api.get(`/groups/${groupId}`);
      setGroup(res.group || res);
    } catch (error) {
      toast.error('Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await api.post(`/groups/${groupId}/message`, { text: message });
      setMessage('');
      fetchGroup();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  if (!group) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card p-12 text-center">
            <p className="text-gray-500">Group not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary-600 dark:bg-primary-700 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.history.back()}
              className="hover:bg-primary-700 dark:hover:bg-primary-800 p-2 rounded-full transition-colors"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold">{group.name}</h2>
              <p className="text-sm opacity-90">{group.participants?.length} members • {group.jobId?.title}</p>
            </div>
          </div>
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="hover:bg-primary-700 dark:hover:bg-primary-800 p-2 rounded-full transition-colors flex items-center gap-2"
          >
            <FiUsers size={20} />
            <span className="text-sm">Members</span>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {group.messages?.map((msg, idx) => {
                const isOwn = msg.senderId?._id === user?.id || msg.senderId === user?.id;
                const isSystem = msg.type === 'system';
                
                if (isSystem) {
                  return (
                    <div key={idx} className="flex justify-center">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-4 py-2 text-xs text-gray-600 dark:text-gray-400">
                        {msg.text}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${
                      isOwn
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    } rounded-lg p-3 shadow`}>
                      {!isOwn && (
                        <p className="text-xs font-semibold mb-1 opacity-75">
                          {msg.senderId?.name || 'Unknown'}
                        </p>
                      )}
                      <p className="break-words">{msg.text}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'opacity-75' : 'opacity-50'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button 
                  type="submit" 
                  className="btn-primary px-6"
                  disabled={!message.trim()}
                >
                  <FiSend />
                </button>
              </div>
            </form>
          </div>

          {/* Members Sidebar */}
          {showMembers && (
            <div className="w-64 bg-white dark:bg-gray-800 border-l dark:border-gray-700 p-4 overflow-y-auto">
              <h3 className="font-bold mb-4 text-lg">Members ({group.participants?.length})</h3>
              <div className="space-y-3">
                {group.participants?.map(member => (
                  <div key={member._id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {member.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
