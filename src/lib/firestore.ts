import { 
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// TypeScript interface for ABT Session
export interface AbtSession {
  id?: string;
  uid: string;
  createdAt: Timestamp;
  role: string;
  industry: string;
  achievement: string;
  because: string;
  therefore: string;
}

// Helper function to extract error messages
const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Add a new ABT session to Firestore
export const addAbtSession = async (
  uid: string,
  sessionData: {
    role: string;
    industry: string;
    achievement: string;
    because: string;
    therefore: string;
  }
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'abt_sessions'), {
      uid,
      ...sessionData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    throw new Error(`Failed to add ABT session: ${extractErrorMessage(error)}`);
  }
};

// List ABT sessions for the current user (last 5, ordered by creation date)
export const listAbtSessions = async (uid: string): Promise<AbtSession[]> => {
  try {
    const q = query(
      collection(db, 'abt_sessions'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    
    const querySnapshot = await getDocs(q);
    const sessions: AbtSession[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      sessions.push({
        id: doc.id,
        uid: data.uid,
        createdAt: data.createdAt,
        role: data.role,
        industry: data.industry,
        achievement: data.achievement,
        because: data.because,
        therefore: data.therefore
      });
    });
    
    return sessions;
  } catch (error) {
    throw new Error(`Failed to fetch ABT sessions: ${extractErrorMessage(error)}`);
  }
};
