'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';
import { auth } from './firebase';
import { getUserByFirebaseUID } from './airtable';

interface AirtableUser {
  id: string;
  email: string;
  firebaseUID: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  socialLink?: string;
  profileImage?: string;
  bannerImage?: string;
  role?: string;
  postCount?: number;
  profileURL?: string;
}

interface AuthContextType {
  user: User | null;
  airtableUser: AirtableUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  airtableUser: null,
  loading: true,
  signOut: async () => {},
});

// Helper function to transform UserRecord to AirtableUser
const transformUserRecord = (record: UserRecord | null): AirtableUser | null => {
  if (!record) return null;
  return {
    id: record.id,
    email: record.fields.Email,
    firebaseUID: record.fields.FirebaseUID,
    displayName: record.fields.DisplayName,
    firstName: record.fields.FirstName,
    lastName: record.fields.LastName,
    bio: record.fields.Bio,
    socialLink: record.fields.SocialLink,
    profileImage: record.fields.ProfileImage,
    bannerImage: record.fields.BannerImage,
    role: record.fields.Role,
    postCount: record.fields.PostCount,
    profileURL: record.fields.ProfileURL,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [airtableUser, setAirtableUser] = useState<AirtableUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userRecord = await getUserByFirebaseUID(user.uid);
        setAirtableUser(transformUserRecord(userRecord));
      } else {
        setAirtableUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setAirtableUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, airtableUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 