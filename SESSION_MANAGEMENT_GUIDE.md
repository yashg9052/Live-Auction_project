# Session Management Implementation Guide

## Overview
A complete session management system has been implemented for the Auction System. Sessions are created when users register, login, or verify via OTP, and are deleted when users logout. Each session expires after 7 days.

## What Was Implemented

### 1. Session Model (Already Existed)
**Location:** `backend/User/src/Model/SessionModel.ts`
- Stores session information with unique session tokens
- Tracks userId, sessionToken, and expiresAt (7-day expiry)
- Fields: `_id`, `userId`, `sessionToken`, `expiresAt`, `createdAt`, `updatedAt`

### 2. Session Utility Functions
**Location:** `backend/User/src/utils/sessionUtils.ts`
**Functions:**
- `createSession(userId)` - Creates a new session for user with 7-day expiry
- `deleteSession(sessionToken)` - Deletes a specific session
- `deleteSessionByUserId(userId)` - Deletes all sessions for a user (used on logout)
- `validateSession(sessionToken)` - Validates if session exists and is not expired

### 3. Updated Controllers
**Location:** `backend/User/src/controller/user.ts`

#### Modified Functions:
- **register()** - Now creates a session after user registration
- **login()** - Now creates a session after successful login
- **verifyUser()** - Now creates a session after OTP verification

#### New Function:
- **logout()** - Deletes all sessions for the authenticated user
  - Protected by `isAuth` middleware
  - Returns 200 status on success
  - Returns 401 if user is not authenticated

### 4. Updated Routes
**Location:** `backend/User/src/Routes/User.ts`
- Added `POST /user/logout` endpoint (requires authentication)

### 5. Frontend Logout Implementation
**Location:** `frontend/src/app/(dashboard)/user-dashboard/ProfileCard.tsx`
- Updated logout handler to call the backend logout API
- Sends token in Authorization header
- Removes token from cookies on successful logout
- Redirects to login page
- Shows error alerts on failure

## How It Works

### User Registration/Login Flow:
```
User Register/Login/Verify
    ↓
Token Generated (JWT - 7 days)
    ↓
Session Created in Database with:
  - userId
  - sessionToken (random 64-char hex string)
  - expiresAt (7 days from now)
    ↓
Response sent to client with JWT token
```

### Logout Flow:
```
User clicks Logout (in ProfileCard)
    ↓
Frontend calls POST /api/user/logout with token
    ↓
Backend verifies user authentication (isAuth middleware)
    ↓
All sessions for user deleted from database
    ↓
Session deleted ✓
```

## API Endpoints

### Logout Endpoint
```
POST /user/logout
Headers: 
  - Authorization: Bearer <token>
  - Content-Type: application/json

Response (200):
{
  "message": "Logged out successfully"
}

Response (401):
{
  "message": "Unauthorized"
}
```

## Session Expiry
- **Expiry Duration:** 7 days (matches JWT expiry)
- **Auto Cleanup:** Sessions older than 7 days can be cleaned up using scheduled jobs (MongoDB will not auto-delete, but expired sessions can be identified by `expiresAt < new Date()`)

## Database Collection
Sessions are stored in MongoDB collection: `sessions`

Example document:
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId(user._id)",
  "sessionToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "expiresAt": "2026-03-16T14:30:00Z",
  "createdAt": "2026-03-09T14:30:00Z",
  "updatedAt": "2026-03-09T14:30:00Z"
}
```

## Key Features

✅ **Session Creation** - Automatic on register, login, and verify
✅ **Session Deletion** - Automatic on logout
✅ **7-Day Expiry** - Sessions expire after 7 days
✅ **Token-Based** - Uses secure random hex tokens
✅ **User Isolation** - Sessions linked to specific users
✅ **Secure Logout** - All user sessions deleted on logout
✅ **Frontend Integration** - Logout button integrated in ProfileCard

## Testing the Implementation

### Test Registration with Session:
```bash
POST /user/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
# Response includes token
# Session automatically created in DB
```

### Test Login with Session:
```bash
POST /user/login
{
  "email": "test@example.com",
  "password": "password123"
}
# Response includes token
# Session automatically created in DB
```

### Test Logout:
```bash
POST /user/logout
Headers: {
  "Authorization": "Bearer <token>"
}
# All sessions for user deleted
# Frontend removes token and redirects to login
```

## Security Considerations

1. **Session Tokens** - Random 32-byte hex strings (not predictable)
2. **User Authentication** - Logout requires valid JWT token via isAuth middleware
3. **Session Isolation** - Each user has separate sessions
4. **Expiry Matching** - Sessions and JWTs both expire in 7 days
5. **Complete Logout** - All sessions deleted on logout (security on shared devices)

## Future Enhancements (Optional)

1. **Scheduled Cleanup Job** - Remove expired sessions periodically
2. **Device/Browser Tracking** - Store user agent with sessions
3. **IP Address Validation** - Store IP with sessions for anomaly detection
4. **Session Limits** - Limit maximum concurrent sessions per user
5. **Activity Tracking** - Track last activity timestamp
6. **Logout From All Devices** - Already implemented (deletes all sessions)
