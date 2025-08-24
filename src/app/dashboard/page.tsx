'use client';

import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Welcome!</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Email:</span> {user.email}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Display Name:</span> {user.displayName || 'Not provided'}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">User ID:</span> {user.uid}
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-800 mb-2">🎉 Authentication Successful!</h3>
            <p className="text-green-700">
              You have successfully signed in and can access this protected dashboard page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
