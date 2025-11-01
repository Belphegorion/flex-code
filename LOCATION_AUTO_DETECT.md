# Location Auto-Detection Feature

## Overview
The application now includes automatic location detection across all location input fields, making it easier for users to fill in their location information.

## Where Auto-Detection is Available

### 1. **Worker Profile Setup** (`/profile-setup`)
- When workers set up their profile, they can auto-detect their current location
- Click the "Auto-Detect" button to automatically fill in location coordinates and address
- The map will center on the detected location

### 2. **Job Creation** (`/jobs/create`)
- Organizers can auto-detect the event location when creating jobs
- Useful for events at the organizer's current location
- Full address is automatically geocoded from coordinates

### 3. **Event Creation** (`/events`)
- Event organizers can auto-detect venue location
- Integrated with the LocationPicker component
- Provides visual feedback during detection

### 4. **Check-In/Check-Out** (`/attendance/:jobId`)
- Workers' location is **automatically detected** when checking in or out
- No manual action required - happens in the background
- Provides confirmation toast notification
- Falls back gracefully if location access is denied

## How It Works

### User Experience
1. **Manual Trigger** (Profile Setup, Job/Event Creation):
   - Click the "Auto-Detect" button
   - Browser requests location permission (first time only)
   - Location is detected and address is reverse-geocoded
   - Map updates to show the detected location

2. **Automatic Trigger** (Check-In/Check-Out):
   - Location is detected automatically when user clicks check-in/out
   - No additional button click needed
   - User sees "Location detected automatically" toast
   - If detection fails, process continues without location

### Technical Implementation
- Uses browser's Geolocation API (`navigator.geolocation`)
- Reverse geocoding via OpenStreetMap Nominatim API
- Custom React hook: `useGeolocation` for consistent behavior
- High accuracy mode enabled for precise coordinates
- 10-second timeout to prevent hanging

### Components
- **LocationPicker**: Full-featured map component with auto-detect button
- **useGeolocation Hook**: Reusable location detection logic
- **Attendance Page**: Automatic background detection

## User Permissions

### Browser Permission Required
- Users must grant location access permission
- Permission is requested when auto-detect is first used
- Permission persists across sessions (browser setting)

### Permission Denied Handling
- Graceful fallback to manual entry
- Clear error messages
- No app functionality is blocked

## Privacy & Security

### Data Usage
- Location is only detected when explicitly requested by user action
- Coordinates are sent to backend only for:
  - Profile setup (stored in user profile)
  - Job/event creation (stored with job/event)
  - Check-in/out (stored with attendance record)

### No Background Tracking
- Location is NOT tracked continuously
- No location data collected without user action
- Users can always enter location manually instead

## Benefits

1. **Faster Data Entry**: One click instead of typing full addresses
2. **Accuracy**: GPS coordinates are more precise than manual entry
3. **Better Matching**: Accurate locations improve job-worker matching algorithm
4. **Attendance Verification**: Automatic location capture during check-in/out
5. **User Convenience**: Especially useful on mobile devices

## Fallback Options

If auto-detection fails or is unavailable:
1. **Manual Address Entry**: Type address and click "Search"
2. **Map Click**: Click directly on the map to set location
3. **Coordinates**: System works with or without location data

## Browser Compatibility

Supported in all modern browsers:
- Chrome/Edge 5+
- Firefox 3.5+
- Safari 5+
- Opera 10.6+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential improvements:
- Save frequently used locations
- Location history for quick selection
- Offline location caching
- Enhanced accuracy with WiFi/cell tower triangulation
