'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import AuthPanel from './AuthPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ProtectedProps {
  children: ReactNode;
  className?: string;
}

const Protected: React.FC<ProtectedProps> = ({ children, className }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-3 text-lg">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return <AuthPanel className={className} />;
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default Protected;
