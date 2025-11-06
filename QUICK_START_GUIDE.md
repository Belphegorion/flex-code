# Quick Start Guide - New Features

## 🚀 Getting Started

### 1. Install Dependencies (if needed)
```bash
cd frontend
npm install
```

### 2. Configure Environment
Create/update `frontend/.env`:
```env
VITE_API_URL=http://localhost:4000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

### 3. Start Application
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 📱 Feature Access Guide

### For Workers:

#### 1. Apply to Jobs
- Go to "Find Work" or "Discover Jobs"
- Click on a job
- Fill cover letter
- Click "Submit Application"
- ✅ Organizer gets notification

#### 2. Check Notifications
- Look at bell icon in navbar
- Red badge shows unread count
- Click bell to see notifications
- Click notification to navigate

#### 3. View Groups
- Navigate to `/groups`
- See all your job groups
- Click to open group chat
- Send messages to team

#### 4. Edit Profile
- Go to your profile
- Click "Edit Profile"
- Upload photo
- Edit fields
- Save changes

### For Organizers:

#### 1. View Applicants
- Go to "Dashboard"
- Click on a job
- Click "View Applicants"
- See all applications

#### 2. Manage Applications
- Review applicant profiles
- Click "Accept" or "Decline"
- ✅ Worker gets notification
- Start chat with accepted workers

#### 3. Create Groups
- When job starts (status: in-progress)
- Group auto-created with all accepted workers
- Access via `/groups`

#### 4. Check Notifications
- Bell icon shows new applications
- Click to see details
- Navigate to applicants page

## 🔗 URL Routes

### Public Routes
- `/` - Home
- `/login` - Login
- `/signup` - Signup

### Worker Routes
- `/worker` - Worker Dashboard
- `/jobs/discover` - Discover Jobs
- `/jobs/:id` - Job Details
- `/profile/:id` - View Profile
- `/profile/edit` - Edit Profile
- `/groups` - My Groups
- `/groups/:groupId` - Group Chat

### Organizer Routes
- `/organizer` - Organizer Dashboard
- `/jobs/create` - Create Job
- `/jobs/:id` - Job Details
- `/jobs/:jobId/applicants` - View Applicants
- `/profile/edit` - Edit Profile
- `/groups` - My Groups
- `/groups/:groupId` - Group Chat

## 🎯 Common Tasks

### Upload Profile Photo
1. Go to `/profile/edit`
2. Click camera icon
3. Select image (max 5MB)
4. Wait for upload
5. Photo appears immediately

### Accept Application
1. Go to job details
2. Click "View Applicants"
3. Find pending application
4. Click "Accept"
5. Worker gets notification
6. Can now start chat

### Send Group Message
1. Go to `/groups`
2. Click on a group
3. Type message
4. Press Enter or click Send
5. Message appears instantly

### View Notifications
1. Click bell icon in navbar
2. See recent notifications
3. Click notification to navigate
4. Notification marked as read
5. Click "Mark all read" to clear all

## 🐛 Troubleshooting

### Notifications Not Showing
- Check if logged in
- Refresh page
- Check backend is running
- Check browser console for errors

### Photo Upload Fails
- Check file size (< 5MB)
- Check file type (image only)
- Verify Cloudinary config
- Check network tab for errors

### Can't See Applicants
- Verify you're the job organizer
- Check job ID in URL
- Ensure backend is running
- Check console for errors

### Group Chat Not Loading
- Verify you're a group member
- Check group ID in URL
- Refresh page
- Check backend connection

## 📊 API Endpoints Reference

### Quick Reference
```
GET    /api/notifications              - Get notifications
GET    /api/notifications/unread-count - Unread count
PUT    /api/notifications/:id/read     - Mark read
GET    /api/applications/job/:jobId    - Get applicants
POST   /api/applications/:id/accept    - Accept
POST   /api/applications/:id/decline   - Decline
GET    /api/groups                     - Get groups
GET    /api/groups/:id                 - Get group
POST   /api/groups/:id/message         - Send message
GET    /api/profiles/me                - Get profile
PUT    /api/profiles/me                - Update profile
POST   /api/profiles/photo             - Upload photo
```

## 🎨 Customization

### Change Notification Badge Color
Edit `NotificationBell.jsx` line 35:
```jsx
<span className="... bg-red-500 ...">  // Change to bg-blue-500, etc.
```

### Change Group Chat Colors
Edit `GroupChat.jsx` line 115:
```jsx
bg-primary-600  // Change to your color
```

### Add More Skills
Edit `ProfileEdit.jsx` - skills are dynamic, just type and add!

## 💡 Pro Tips

1. **Keyboard Shortcuts**
   - Enter in message input = Send
   - Enter in skill input = Add skill
   - Esc = Close notification dropdown

2. **Mobile Usage**
   - All features work on mobile
   - Swipe to close dropdowns
   - Tap to navigate

3. **Performance**
   - Notifications cached locally
   - Images lazy loaded
   - Messages paginated

4. **Best Practices**
   - Upload square photos for best display
   - Keep cover letters concise
   - Use clear group names
   - Update profile regularly

## 🔒 Security Notes

- All routes protected by authentication
- Role-based access control
- JWT tokens auto-refresh
- Secure file uploads
- XSS protection enabled

## 📞 Support

### Common Issues
1. **401 Unauthorized**: Login again
2. **404 Not Found**: Check URL
3. **500 Server Error**: Check backend logs
4. **Upload Failed**: Check file size/type

### Debug Mode
Open browser console (F12) to see:
- API calls
- Error messages
- Network requests
- State changes

## 🎉 Success Indicators

### Everything Working When:
- ✅ Bell icon shows in navbar
- ✅ Notifications appear when actions happen
- ✅ Can view and manage applicants
- ✅ Group chat sends/receives messages
- ✅ Profile photo uploads successfully
- ✅ Edit profile saves changes

## 📈 Next Steps

1. Test all features
2. Customize colors/styling
3. Add more notification types
4. Implement video calling
5. Add file sharing
6. Deploy to production

## 🚀 Ready to Go!

Your application now has:
- ✅ Real-time notifications
- ✅ Application management
- ✅ Group chat
- ✅ Profile management
- ✅ Photo uploads
- ✅ And much more!

**Enjoy your fully-featured event management platform!** 🎊
