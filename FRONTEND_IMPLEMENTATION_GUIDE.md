# Frontend Implementation Guide

## Quick Start: Implementing New Features

### 1. Notification Bell Component (30 minutes)

**File**: `frontend/src/components/common/NotificationBell.jsx`

```jsx
import { useState, useEffect } from 'react';
import { FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Socket.IO listener
    const socket = window.io;
    if (socket) {
      socket.on('notification', () => {
        fetchNotifications();
        fetchUnreadCount();
      });
    }
  }, []);

  const fetchNotifications = async () => {
    const res = await api.get('/notifications?limit=10');
    setNotifications(res.notifications || []);
  };

  const fetchUnreadCount = async () => {
    const res = await api.get('/notifications/unread-count');
    setUnreadCount(res.count || 0);
  };

  const handleNotificationClick = async (notification) => {
    await api.put(`/notifications/${notification._id}/read`);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    setShowDropdown(false);
    fetchUnreadCount();
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b dark:border-gray-700">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No notifications</p>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    !notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <p className="font-medium">{notif.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Add to Layout**: In `frontend/src/components/common/Layout.jsx`, add `<NotificationBell />` to the header.

### 2. Job Applicants Page (45 minutes)

**File**: `frontend/src/pages/JobApplicants.jsx`

```jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/common/Layout';
import api from '../services/api';

export default function JobApplicants() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      const res = await api.get(`/applications/job/${jobId}`);
      setApplications(res.applications || []);
    } catch (error) {
      toast.error('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (applicationId) => {
    try {
      await api.post(`/applications/${applicationId}/accept`);
      toast.success('Application accepted!');
      fetchApplicants();
    } catch (error) {
      toast.error('Failed to accept application');
    }
  };

  const handleDecline = async (applicationId) => {
    try {
      await api.post(`/applications/${applicationId}/decline`);
      toast.success('Application declined');
      fetchApplicants();
    } catch (error) {
      toast.error('Failed to decline application');
    }
  };

  const startChat = async (workerId) => {
    try {
      const res = await api.post('/chat/create', {
        participantId: workerId,
        jobId
      });
      window.location.href = `/chat/${res.chat._id}`;
    } catch (error) {
      toast.error('Failed to start chat');
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Job Applicants</h1>
        
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app._id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                    {app.proId?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{app.proId?.name}</h3>
                    <p className="text-gray-600">{app.proId?.email}</p>
                    <p className="text-sm text-gray-500 mt-2">{app.coverLetter}</p>
                    <div className="flex gap-2 mt-2">
                      {app.proId?.badges?.map(badge => (
                        <span key={badge} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className={`px-3 py-1 rounded text-sm ${
                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {app.status}
                  </span>
                  
                  {app.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAccept(app._id)}
                        className="btn-primary text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(app._id)}
                        className="btn-secondary text-sm"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  
                  {app.status === 'accepted' && (
                    <button
                      onClick={() => startChat(app.proId._id)}
                      className="btn-primary text-sm"
                    >
                      Chat
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
```

**Add Route**: In `App.jsx`, add:
```jsx
<Route path="/jobs/:jobId/applicants" element={
  <ProtectedRoute allowedRoles={['organizer']}>
    <JobApplicants />
  </ProtectedRoute>
} />
```

### 3. Group Chat Component (60 minutes)

**File**: `frontend/src/pages/GroupChat.jsx`

```jsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSend, FiUsers } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export default function GroupChat() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [message, setMessage] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchGroup();
    
    // Socket.IO listener
    const socket = window.io;
    if (socket) {
      socket.emit('join-group', groupId);
      socket.on('group-message', handleNewMessage);
    }
    
    return () => {
      if (socket) {
        socket.off('group-message', handleNewMessage);
      }
    };
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [group?.messages]);

  const fetchGroup = async () => {
    try {
      const res = await api.get(`/groups/${groupId}`);
      setGroup(res.group);
    } catch (error) {
      toast.error('Failed to load group');
    }
  };

  const handleNewMessage = (data) => {
    if (data.groupId === groupId) {
      setGroup(prev => ({
        ...prev,
        messages: [...prev.messages, data.message]
      }));
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await api.post(`/groups/${groupId}/message`, { text: message });
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!group) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-200px)] flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{group.name}</h2>
            <p className="text-sm text-gray-600">{group.participants?.length} members</p>
          </div>
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="btn-secondary flex items-center gap-2"
          >
            <FiUsers /> Members
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {group.messages?.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.senderId._id === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${
                msg.senderId._id === user.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              } rounded-lg p-3`}>
                {msg.senderId._id !== user.id && (
                  <p className="text-xs font-semibold mb-1">{msg.senderId.name}</p>
                )}
                <p>{msg.text}</p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 bg-white dark:bg-gray-800 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary">
              <FiSend />
            </button>
          </div>
        </form>

        {/* Members Sidebar */}
        {showMembers && (
          <div className="absolute right-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-l p-4">
            <h3 className="font-bold mb-4">Members</h3>
            <div className="space-y-2">
              {group.participants?.map(member => (
                <div key={member._id} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center">
                    {member.name?.charAt(0)}
                  </div>
                  <span>{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
```

### 4. Profile Photo Upload (30 minutes)

**File**: `frontend/src/components/profile/PhotoUpload.jsx`

```jsx
import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiCamera, FiUpload } from 'react-icons/fi';
import api from '../../services/api';

export default function PhotoUpload({ currentPhoto, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentPhoto);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'your_upload_preset'); // Configure in Cloudinary
      
      const cloudinaryRes = await fetch(
        'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload',
        { method: 'POST', body: formData }
      );
      
      const data = await cloudinaryRes.json();
      
      // Update profile
      await api.post('/profiles/photo', { photoUrl: data.secure_url });
      
      toast.success('Photo uploaded successfully!');
      onUploadSuccess?.(data.secure_url);
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          {preview ? (
            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">
              <FiCamera />
            </div>
          )}
        </div>
        <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700">
          <FiUpload />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
      {uploading && <p className="text-sm text-gray-600">Uploading...</p>}
    </div>
  );
}
```

## Installation Steps

1. **Install Socket.IO Client** (if not already):
```bash
cd frontend
npm install socket.io-client
```

2. **Configure Socket.IO** in `frontend/src/main.jsx`:
```jsx
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000');
window.io = socket;
```

3. **Add Routes** to `App.jsx`:
```jsx
import JobApplicants from './pages/JobApplicants';
import GroupChat from './pages/GroupChat';

// In Routes:
<Route path="/jobs/:jobId/applicants" element={<ProtectedRoute allowedRoles={['organizer']}><JobApplicants /></ProtectedRoute>} />
<Route path="/groups/:groupId" element={<ProtectedRoute><GroupChat /></ProtectedRoute>} />
```

4. **Add NotificationBell** to Layout header

## Testing Flow

1. **Test Notifications**:
   - Worker applies to job
   - Check organizer sees notification
   - Click notification → navigates to job

2. **Test Application Management**:
   - Organizer views applicants
   - Accept/decline applications
   - Worker receives notifications

3. **Test Group Chat**:
   - Organizer creates group for job
   - Workers join group
   - Send messages
   - Real-time updates

4. **Test Profile Photo**:
   - Upload photo
   - See preview
   - Photo appears in profile

## Next: Video Calling

For video calling, install:
```bash
npm install simple-peer
```

Then implement WebRTC component using simple-peer library with Socket.IO signaling.
