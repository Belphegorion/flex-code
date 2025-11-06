# Socket.IO & Cloudinary Setup Guide

## Part 1: Socket.IO Setup

### Frontend Setup

#### Step 1: Install Socket.IO Client
```bash
cd frontend
npm install socket.io-client
```

#### Step 2: Create Socket Service
Create `frontend/src/services/socket.js`:

```javascript
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      if (userId) {
        this.socket.emit('join-user-room', userId);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  offNotification() {
    if (this.socket) {
      this.socket.off('notification');
    }
  }

  joinGroup(groupId) {
    if (this.socket) {
      this.socket.emit('join-group', groupId);
    }
  }

  onGroupMessage(callback) {
    if (this.socket) {
      this.socket.on('group-message', callback);
    }
  }
}

export default new SocketService();
```

#### Step 3: Update AuthContext
Add to `frontend/src/context/AuthContext.jsx`:

```javascript
import socketService from '../services/socket';

// In useEffect after user is set:
useEffect(() => {
  if (user?.id) {
    socketService.connect(user.id);
  }
  return () => {
    if (!user) socketService.disconnect();
  };
}, [user]);

// In logout function:
const logout = () => {
  socketService.disconnect();
  // ... rest of logout
};
```

#### Step 4: Update NotificationBell
Add to `frontend/src/components/common/NotificationBell.jsx`:

```javascript
import socketService from '../../services/socket';

useEffect(() => {
  socketService.onNotification(() => {
    fetchNotifications();
    fetchUnreadCount();
  });
  return () => socketService.offNotification();
}, []);
```

#### Step 5: Update Backend
Add to `backend/src/server.js` in Socket.IO section:

```javascript
socket.on('join-user-room', (userId) => {
  socket.join(`user_${userId}`);
});

socket.on('join-group', (groupId) => {
  socket.join(`group_${groupId}`);
});
```

## Part 2: Cloudinary Setup

### Step 1: Create Cloudinary Account
1. Go to https://cloudinary.com
2. Sign up for free account
3. Get your credentials from dashboard:
   - Cloud Name
   - API Key
   - API Secret

### Step 2: Backend Configuration

#### Install Cloudinary
```bash
cd backend
npm install cloudinary
```

#### Update .env
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Verify cloudinary.js
File already exists at `backend/src/config/cloudinary.js`:

```javascript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;
```

### Step 3: Frontend Configuration

#### Update .env
Create/update `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=ml_default
```

#### Create Upload Preset in Cloudinary
1. Go to Cloudinary Dashboard
2. Settings → Upload → Upload Presets
3. Click "Add upload preset"
4. Set:
   - Preset name: `ml_default` (or your choice)
   - Signing Mode: `Unsigned`
   - Folder: `eventpro/profiles`
5. Save

#### Update PhotoUpload Component
The component is already configured, just update line 28:

```javascript
const cloudinaryRes = await fetch(
  `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
  { method: 'POST', body: formData }
);
```

## Testing

### Test Socket.IO
1. Open two browser tabs
2. Login as different users
3. Perform action (apply to job)
4. Check notification appears instantly

### Test Cloudinary
1. Go to Profile Edit
2. Click upload photo
3. Select image
4. Check upload completes
5. Verify image appears in profile

## Environment Variables Summary

### Backend (.env)
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=4000
FRONTEND_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=ml_default
```

## Troubleshooting

### Socket.IO Issues
- Check browser console for connection errors
- Verify VITE_API_URL is correct
- Check backend is running on correct port

### Cloudinary Issues
- Verify cloud name is correct
- Check upload preset is unsigned
- Verify file size < 10MB
- Check browser network tab for errors

## Complete! ✅
Both Socket.IO and Cloudinary are now configured and ready to use.
