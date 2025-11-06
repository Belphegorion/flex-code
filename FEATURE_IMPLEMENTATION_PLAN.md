# Feature Implementation Plan

## Overview
Implementing comprehensive profile management, notification system, group chat, and video calling features.

## Phase 1: Profile Photo & Enhanced Profile Management

### Backend Changes:
1. **Profile Photo Upload**
   - Add photo upload endpoint using Cloudinary
   - Update User model to store profilePhoto URL
   - Add photo validation (size, format)

2. **Profile Edit Endpoints**
   - GET /api/profiles/me - Get own profile
   - PUT /api/profiles/me - Update own profile
   - POST /api/profiles/photo - Upload profile photo

### Frontend Changes:
1. **Profile Photo Component**
   - Photo upload with preview
   - Drag & drop support
   - Crop functionality

2. **Profile Edit Page**
   - Edit all profile fields
   - Add/edit work experience, education, portfolio
   - Skills management
   - Bio editor

## Phase 2: Application Notification System

### Backend Changes:
1. **Notification Model**
   ```javascript
   {
     userId: ObjectId,
     type: 'application' | 'acceptance' | 'message' | 'group',
     title: String,
     message: String,
     relatedId: ObjectId, // jobId, chatId, etc
     read: Boolean,
     createdAt: Date
   }
   ```

2. **Application Flow Enhancement**
   - When worker applies → Create notification for organizer
   - When organizer accepts → Create notification for worker
   - Real-time Socket.IO events

3. **Notification Endpoints**
   - GET /api/notifications - Get user notifications
   - PUT /api/notifications/:id/read - Mark as read
   - DELETE /api/notifications/:id - Delete notification

### Frontend Changes:
1. **Notification Bell Component**
   - Badge with unread count
   - Dropdown with recent notifications
   - Click to navigate to relevant page

2. **Organizer Job Management**
   - View all applicants for a job
   - Accept/Decline buttons
   - View applicant profiles
   - Start chat with applicant

## Phase 3: Group Chat System

### Backend Changes:
1. **Group Chat Model**
   ```javascript
   {
     name: String,
     jobId: ObjectId,
     participants: [ObjectId],
     messages: [{
       senderId: ObjectId,
       text: String,
       type: 'text' | 'image' | 'file',
       createdAt: Date
     }],
     createdBy: ObjectId,
     avatar: String
   }
   ```

2. **Group Chat Endpoints**
   - POST /api/groups - Create group for job
   - GET /api/groups - Get user's groups
   - POST /api/groups/:id/message - Send message
   - POST /api/groups/:id/members - Add members
   - DELETE /api/groups/:id/members/:userId - Remove member

3. **Auto Group Creation**
   - When job status changes to 'in-progress'
   - Add all accepted workers + organizer
   - Send welcome message

### Frontend Changes:
1. **Group Chat Interface**
   - WhatsApp-style chat UI
   - Message bubbles with sender info
   - Typing indicators
   - Online status
   - File/image sharing

2. **Group Management**
   - View members
   - Add/remove members (organizer only)
   - Group info panel
   - Leave group option

## Phase 4: Video Calling System

### Backend Changes:
1. **WebRTC Signaling**
   - Socket.IO events for signaling
   - Room management
   - Peer connection handling

2. **Call Model (Optional)**
   ```javascript
   {
     callId: String,
     participants: [ObjectId],
     type: '1-1' | 'group',
     startTime: Date,
     endTime: Date,
     duration: Number
   }
   ```

### Frontend Changes:
1. **Video Call Component**
   - Simple WebRTC implementation
   - Camera/mic controls
   - Screen sharing
   - Participant grid view

2. **Call Integration**
   - Call button in 1-1 chats
   - Group call button in group chats
   - Incoming call notification
   - Call history

## Implementation Order

### Week 1: Profile Management
- [ ] Profile photo upload backend
- [ ] Profile edit endpoints
- [ ] Profile photo component
- [ ] Profile edit page
- [ ] Test profile updates

### Week 2: Notifications & Applications
- [ ] Notification model & endpoints
- [ ] Application notification triggers
- [ ] Notification bell component
- [ ] Organizer applicant management page
- [ ] Test notification flow

### Week 3: Group Chat
- [ ] Group chat model
- [ ] Group chat endpoints
- [ ] Auto group creation logic
- [ ] Group chat UI
- [ ] Test group messaging

### Week 4: Video Calling
- [ ] WebRTC signaling setup
- [ ] Video call component
- [ ] Call integration in chats
- [ ] Test video calls
- [ ] Final integration testing

## Technical Stack

### Already Available:
- Socket.IO (configured in server.js)
- Cloudinary (for image uploads)
- MongoDB (for data storage)
- React (frontend framework)

### To Add:
- simple-peer (WebRTC wrapper)
- react-dropzone (file uploads)
- react-image-crop (photo cropping)
- emoji-picker-react (chat emojis)

## Database Schema Updates

### User Model:
```javascript
profilePhoto: String, // Cloudinary URL
```

### Notification Model (New):
```javascript
{
  userId: ObjectId,
  type: String,
  title: String,
  message: String,
  relatedId: ObjectId,
  relatedModel: String,
  read: Boolean,
  actionUrl: String,
  createdAt: Date
}
```

### GroupChat Model (New):
```javascript
{
  name: String,
  jobId: ObjectId,
  participants: [ObjectId],
  messages: [MessageSchema],
  createdBy: ObjectId,
  avatar: String,
  lastMessageAt: Date
}
```

## API Endpoints Summary

### Profile:
- POST /api/profiles/photo
- GET /api/profiles/me
- PUT /api/profiles/me

### Notifications:
- GET /api/notifications
- GET /api/notifications/unread-count
- PUT /api/notifications/:id/read
- PUT /api/notifications/read-all
- DELETE /api/notifications/:id

### Groups:
- POST /api/groups
- GET /api/groups
- GET /api/groups/:id
- POST /api/groups/:id/message
- POST /api/groups/:id/members
- DELETE /api/groups/:id/members/:userId
- PUT /api/groups/:id/leave

### Applications (Enhanced):
- GET /api/applications/job/:jobId - Get all applicants for a job
- PUT /api/applications/:id/accept - Accept application
- PUT /api/applications/:id/decline - Decline application

## Socket.IO Events

### Existing:
- join-chat
- send-message
- receive-message

### New:
- notification (new notification)
- application-received (organizer)
- application-accepted (worker)
- group-message (group chat)
- typing (typing indicator)
- call-offer (video call)
- call-answer (video call)
- ice-candidate (WebRTC)
