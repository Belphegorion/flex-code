# Frontend Issues Analysis

## Critical Issues

### 1. Profile Fetching in ProfileView.jsx
**Issue**: Calling `/profiles/${id}` where `id` can be undefined
**Location**: `frontend/src/pages/ProfileView.jsx:73`
**Fix**: Add validation before API call

### 2. Worker Profile Setup Location Validation
**Issue**: Location object structure mismatch - backend expects `{address, lat, lng}` but frontend may send different structure
**Location**: `frontend/src/components/profile/WorkerProfileSetup.jsx:54`
**Impact**: Causes 400 Bad Request on `/api/profile-setup/worker`

### 3. Auth Token Not Being Sent
**Issue**: If token is expired or invalid, multiple endpoints fail with 401
**Location**: `frontend/src/services/api.js` interceptor
**Impact**: All authenticated requests fail

### 4. Profile ID Undefined in Dashboard
**Issue**: WorkerDashboard tries to access `profile?.userId?.completedJobsCount` but profile structure is wrong
**Location**: `frontend/src/pages/WorkerDashboard.jsx:95`

## Medium Priority Issues

### 5. Job Application Endpoint Mismatch
**Issue**: Frontend calls `/applications/${id}/apply` but should be `/applications/apply` with jobId in body
**Location**: `frontend/src/pages/JobDetails.jsx:42`

### 6. Missing Error Handling in ProfileView
**Issue**: When profile fetch fails, component shows loading forever
**Location**: `frontend/src/pages/ProfileView.jsx:73`

### 7. Profile Completeness Component
**Issue**: May reference wrong profile structure
**Location**: `frontend/src/components/profile/ProfileCompleteness.jsx`

## Minor Issues

### 8. Inconsistent API Response Handling
**Issue**: Some endpoints return `{data: {...}}` others return `{...}` directly
**Locations**: Multiple service files

### 9. Missing Loading States
**Issue**: Some components don't show loading indicators during API calls
**Locations**: Various pages

### 10. No Retry Logic for Failed Requests
**Issue**: If API call fails, no automatic retry
**Location**: `frontend/src/services/api.js`
