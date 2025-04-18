# MediHelp Backend Setup Guide

This application uses Firebase as its backend. Unlike traditional applications, you don't need to run a separate backend server as Firebase provides cloud-based services.

## Setup Instructions

1. **Install Firebase Tools (Optional - for deployment and emulators)**
```bash
npm install -g firebase-tools
```

2. **Install Project Dependencies**
```bash
npm install
```

3. **Firebase Configuration**
The app is already configured to use Firebase in `src/firebase/config.js`. 
Make sure your Firebase project is properly set up with:
- Authentication enabled
- Firestore database created
- Storage bucket configured

4. **Running Firebase Emulators (Optional - for local development)**
If you want to test against local emulators instead of the production Firebase:
```bash
firebase login
firebase init emulators
firebase emulators:start
```

## Testing Firebase Connection

1. Open your application in a browser
2. Navigate to any page that uses Firebase services (like signup or profile page)
3. Check the browser console for Firebase initialization messages
4. Use the `FirebaseStatusChecker` component to verify Firebase connectivity

## Common Issues

- **CORS Errors**: Ensure proper CORS settings in Firebase console
- **Authentication Errors**: Check if Authentication is enabled in Firebase console
- **Storage Errors**: Verify Storage rules allow read/write operations
- **Missing Dependencies**: Run `npm install firebase` if Firebase modules are not found
