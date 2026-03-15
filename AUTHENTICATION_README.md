# Zero Food Hero Authentication System

## Overview

This document describes the authentication system implemented for the Zero Food Hero application. The system provides secure user registration, login, and data persistence with activity tracking.

## Features

### 🔐 User Authentication
- **Email/Password Registration**: Users can create accounts with email and password
- **Email/Password Login**: Secure authentication with existing credentials
- **Session Management**: Automatic session restoration on page refresh
- **Logout**: Secure session termination

### 📧 Email Validation
- **Format Validation**: Ensures valid email format (e.g., user@domain.com)
- **Uniqueness Check**: Prevents duplicate email registrations
- **Case Insensitive**: Email addresses are stored in lowercase

### 🔒 Password Security
- **Strong Password Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Password Confirmation**: Users must confirm their password during registration
- **Visual Feedback**: Real-time password strength indicators

### 📊 User Data Persistence
- **Local Storage**: User data is stored in browser's localStorage
- **Activity Tracking**: All user actions are logged and persisted
- **Profile Management**: Users can update their profile information
- **Role Management**: Support for multiple user roles (donor, volunteer, NGO)

### 📈 Activity Tracking
- **Automatic Logging**: System automatically tracks user activities
- **Activity Types**:
  - `signup`: Account creation
  - `login`: User sign-in
  - `donation`: Food donation activities
  - `pickup`: Food pickup activities
  - `delivery`: Food delivery activities
- **Activity History**: Users can view their complete activity history

## Implementation Details

### File Structure
```
app/
├── contexts/
│   └── AuthContext.tsx          # Authentication context provider
├── lib/
│   └── user-storage.ts          # User data storage service
├── components/
│   └── UserActivityTracker.tsx  # Activity display component
├── auth/
│   ├── signin/
│   │   └── page.tsx            # Sign-in page
│   └── signup/
│       └── page.tsx            # Sign-up page
├── profile/
│   └── page.tsx                # User profile page
└── demo/
    └── page.tsx                # Demo page for testing
```

### Key Components

#### 1. UserStorageService (`app/lib/user-storage.ts`)
- Manages user data persistence
- Handles email validation and password strength checking
- Provides activity tracking functionality
- Manages user sessions

#### 2. AuthContext (`app/contexts/AuthContext.tsx`)
- Provides authentication state management
- Handles sign-in, sign-up, and sign-out operations
- Manages user role updates
- Integrates with UserStorageService

#### 3. UserActivityTracker (`app/components/UserActivityTracker.tsx`)
- Displays user activity history
- Shows activity types with icons and timestamps
- Integrates with profile page

## Usage Examples

### Registration Flow
1. User visits `/auth/signup`
2. Enters first name, last name, email, and password
3. System validates email format and password strength
4. System checks if email already exists
5. If validation passes, user account is created
6. User is redirected to role selection

### Login Flow
1. User visits `/auth/signin`
2. Enters email and password
3. System validates email format
4. System authenticates credentials
5. If successful, user session is created
6. User is redirected to role selection

### Activity Tracking
```typescript
// Add activity when user performs an action
userStorage.addUserActivity(userId, {
  type: 'donation',
  description: 'Created new food donation',
  metadata: { donationId: 'don-123' }
});
```

## Security Considerations

### Current Implementation (Demo)
- Passwords are stored in plain text (for demo purposes only)
- Data is stored in localStorage (client-side only)
- No server-side validation

### Production Recommendations
- **Password Hashing**: Use bcrypt or similar for password hashing
- **Server-Side Storage**: Store user data in secure database
- **JWT Tokens**: Implement JWT for session management
- **HTTPS**: Ensure all communications are encrypted
- **Rate Limiting**: Implement login attempt rate limiting
- **Input Sanitization**: Sanitize all user inputs
- **CSRF Protection**: Implement CSRF tokens

## Testing the System

### Demo Page
Visit `/demo` (requires authentication) to:
- View current user information
- See user activity history
- View all registered users (admin view)
- Clear all data for testing

### Test Scenarios
1. **New User Registration**:
   - Try registering with invalid email format
   - Try registering with weak password
   - Try registering with existing email
   - Successfully register with valid data

2. **User Login**:
   - Try logging in with non-existent email
   - Try logging in with wrong password
   - Successfully login with correct credentials

3. **Data Persistence**:
   - Register a new account
   - Logout and login again
   - Verify user data is preserved
   - Check activity history

4. **Activity Tracking**:
   - Use QR scanner to generate activities
   - Check profile page for activity history
   - Verify activities are timestamped correctly

## API Reference

### UserStorageService Methods

#### `createUser(userData)`
Creates a new user account
```typescript
const user = userStorage.createUser({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  password: 'SecurePass123!'
});
```

#### `authenticateUser(email, password)`
Authenticates user credentials
```typescript
const user = userStorage.authenticateUser('john@example.com', 'SecurePass123!');
```

#### `validateEmail(email)`
Validates email format
```typescript
const isValid = userStorage.validateEmail('john@example.com'); // true
```

#### `validatePassword(password)`
Validates password strength
```typescript
const result = userStorage.validatePassword('SecurePass123!');
// { isValid: true, errors: [] }
```

#### `addUserActivity(userId, activity)`
Adds activity to user history
```typescript
userStorage.addUserActivity(userId, {
  type: 'donation',
  description: 'Created food donation',
  metadata: { donationId: 'don-123' }
});
```

### AuthContext Hooks

#### `useAuth()`
Returns authentication context
```typescript
const { user, isAuthenticated, signIn, signUp, signOut } = useAuth();
```

## Future Enhancements

1. **Email Verification**: Add email verification flow
2. **Password Reset**: Implement forgot password functionality
3. **Social Login**: Add Google, Facebook login options
4. **Two-Factor Authentication**: Add 2FA support
5. **Account Deletion**: Implement secure account deletion
6. **Data Export**: Allow users to export their data
7. **Activity Analytics**: Add activity insights and statistics

## Troubleshooting

### Common Issues

1. **"Email already registered" error**:
   - User is trying to register with existing email
   - Use different email or sign in instead

2. **"Invalid email or password" error**:
   - Check email format
   - Verify password matches registration
   - Ensure user account exists

3. **Activities not showing**:
   - Check if user is authenticated
   - Verify activity was added correctly
   - Check localStorage for data corruption

4. **Session not persisting**:
   - Check browser localStorage support
   - Verify AuthContext is properly configured
   - Check for JavaScript errors in console

### Debug Mode
Enable debug logging by adding to browser console:
```javascript
localStorage.setItem('debug_auth', 'true');
```

## Support

For issues or questions about the authentication system:
1. Check the demo page for system status
2. Review browser console for errors
3. Verify localStorage is enabled
4. Test with different browsers/devices 