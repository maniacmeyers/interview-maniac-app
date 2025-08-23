# Interview Maniac App

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Repository Structure

The application lives at the repository root with the following structure:

• `src/` - Source code directory
• `package.json` - Project dependencies and scripts
• `next.config.js` - Next.js configuration
• `tailwind.config.ts` - Tailwind CSS configuration

## 🔒 Security Warning

**⚠️ IMPORTANT: Never commit sensitive information to version control!**

- **DO NOT** commit `.env.local` or any files containing API keys, secrets, or sensitive data
- The `.env.local` file has been removed from this repository and added to `.gitignore`
- Always use `.env.local.example` as a template with placeholder values only
- Use server-side environment variables for sensitive API keys in production
- Review your commits before pushing to ensure no secrets are accidentally included

For production deployments, set environment variables directly in your hosting platform (Vercel, Netlify, etc.) rather than committing them to the repository.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Firebase Setup

This application uses Firebase for backend services. To set up Firebase:

### 1. Environment Variables

1. Copy the .env.local.example file to .env.local:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update the Firebase configuration in .env.local with your actual values:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-YOUR_MEASUREMENT_ID
   ```

### 2. Firebase Project Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and choose your preferred sign-in methods
3. Set up Firestore Database for data storage
4. Configure Firebase Storage if needed for file uploads
5. Copy your Firebase config values to the .env.local file

### 3. Security Notes

• Never commit your .env.local file to version control
• The .env.local.example file contains example values for reference
• All Firebase configuration variables are prefixed with NEXT_PUBLIC_ as they're used client-side
• Consider implementing Firebase Security Rules for production use

## Auth & Firestore

This application implements Firebase Authentication and Firestore database integration for managing ABT (Accomplishment-Because-Therefore) interview sessions.

### Authentication Setup

To enable authentication in your Firebase project:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Authentication > Sign-in method
4. Enable the following providers:
   • Email/Password: Click on Email/Password and toggle "Enable"
   • Google: Click on Google, toggle "Enable", and configure OAuth consent screen

### Firestore Database Setup

1. In Firebase Console, navigate to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" initially
4. Select a location for your database

### Firestore Security Rules

Replace the default Firestore rules with the following to ensure users can only read/write their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own ABT sessions
    match /abt_sessions/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
    }
  }
}
```

### Features

• Authentication: Email/password and Google sign-in
• Protected Routes: Content only accessible after authentication
• ABT Session Management: Create and view interview preparation sessions
• Data Security: User data is isolated and protected
• Real-time Updates: Firestore provides real-time data synchronization

### ABT Framework

The application helps users structure their interview stories using the ABT framework:

• Accomplishment: What you achieved
• Because: Why it was challenging or important
• Therefore: What the measurable impact or result was

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deployment

The production version of this application is deployed on Vercel at [interview-maniac-app.vercel.app](https://interview-maniac-app.vercel.app/).

To deploy your own instance, the easiest way is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
