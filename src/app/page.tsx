'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { addAbtSession, listAbtSessions, AbtSession } from '@/lib/firestore';
import AuthPanel from '@/components/AuthPanel';
import Protected from '@/components/Protected';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, Clock, User as UserIcon, Building, Award, Target, Wand2, Trophy } from 'lucide-react';

interface AbtFormData {
  role: string;
  industry: string;
  achievement: string;
  because: string;
  therefore: string;
}

const AbtSessionForm: React.FC<{ user: User; onSessionAdded: () => void }> = ({ user, onSessionAdded }) => {
  const [formData, setFormData] = useState<AbtFormData>({
    role: '',
    industry: '',
    achievement: '',
    because: '',
    therefore: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: keyof AbtFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await addAbtSession(user.uid, formData);
      setFormData({
        role: '',
        industry: '',
        achievement: '',
        because: '',
        therefore: ''
      });
      setSuccess(true);
      onSessionAdded();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create ABT session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New ABT Session
        </CardTitle>
        <CardDescription>
          Structure your achievements using the Accomplishment-Because-Therefore framework
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <Alert className="mb-4 border-green-500 bg-green-50">
            <AlertDescription>
              ABT session created successfully!
            </AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Role/Position
              </label>
              <Input
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                placeholder="e.g., Software Engineer, Product Manager"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Industry/Company
              </label>
              <Input
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                placeholder="e.g., Technology, Healthcare, Finance"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Achievement (What did you accomplish?)
            </label>
            <Textarea
              value={formData.achievement}
              onChange={(e) => handleInputChange('achievement', e.target.value)}
              placeholder="Describe your specific accomplishment..."
              rows={3}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Because (Why was this challenging/important?)
            </label>
            <Textarea
              value={formData.because}
              onChange={(e) => handleInputChange('because', e.target.value)}
              placeholder="Explain the context, challenges, or importance..."
              rows={3}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Therefore (What was the impact/result?)
            </label>
            <Textarea
              value={formData.therefore}
              onChange={(e) => handleInputChange('therefore', e.target.value)}
              placeholder="Describe the measurable impact or outcome..."
              rows={3}
              required
              disabled={loading}
            />
          </div>
          
          <Button className="w-full" disabled={loading} type="submit">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>Create ABT Session</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const AbtSessionsList: React.FC<{ user: User; refresh: number }> = ({ user, refresh }) => {
  const [sessions, setSessions] = useState<AbtSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const userSessions = await listAbtSessions(user.uid);
        setSessions(userSessions);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load ABT sessions');
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [user.uid, refresh]);

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return 'Unknown date';
    try {
      const date = (timestamp as { toDate?: () => Date }).toDate ? (timestamp as { toDate: () => Date }).toDate() : new Date(timestamp as string | number | Date);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Unknown date';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading your ABT sessions...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent ABT Sessions
        </CardTitle>
        <CardDescription>
          Your last 5 ABT sessions (most recent first)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {sessions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No ABT sessions yet</p>
            Create your first ABT session above to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => (
              <Card className="border-l-4 border-l-blue-500" key={session.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span className="font-medium">{session.role}</span>
                      <Building className="h-4 w-4 ml-2" />
                      <span className="text-sm text-gray-600">{session.industry}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatDate(session.createdAt)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Award className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm text-green-700">Achievement</span>
                    </div>
                    <p className="text-sm bg-green-50 p-2 rounded">{session.achievement}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Target className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-sm text-orange-700">Because</span>
                    </div>
                    <p className="text-sm bg-orange-50 p-2 rounded">{session.because}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <UserIcon className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm text-blue-700">Therefore</span>
                    </div>
                    <p className="text-sm bg-blue-50 p-2 rounded">{session.therefore}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [refreshSessions, setRefreshSessions] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSessionAdded = () => {
    setRefreshSessions(prev => prev + 1);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-3 text-lg">Loading...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Interview Maniac
          </h1>
          <p className="text-lg text-gray-600">
            Master your interview stories with the ABT framework
          </p>
        </div>
        
        <div className="mb-8">
          <AuthPanel className="max-w-md mx-auto" />
        </div>
        
        {/* Navigation Links */}
        <div className="max-w-md mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Choose Your Path</CardTitle>
              <CardDescription className="text-center">
                Select how you'd like to prepare for your interviews
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/wizard" className="block">
                <Button className="w-full flex items-center justify-center gap-2 h-12" variant="outline">
                  <Wand2 className="h-5 w-5" />
                  Interview Wizard
                  <span className="text-sm text-gray-500 ml-2">Step-by-step guidance</span>
                </Button>
              </Link>
              <Link href="/practice" className="block">
                <Button className="w-full flex items-center justify-center gap-2 h-12" variant="outline">
                  <Trophy className="h-5 w-5" />
                  Practice Arena
                  <span className="text-sm text-gray-500 ml-2">Mock interviews & exercises</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        
        <Protected>
          <div className="max-w-4xl mx-auto space-y-8">
            {user && (
              <>
                <AbtSessionForm user={user} onSessionAdded={handleSessionAdded} />
                <AbtSessionsList user={user} refresh={refreshSessions} />
              </>
            )}
          </div>
        </Protected>
      </div>
    </div>
  );
}
