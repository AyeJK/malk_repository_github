'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';
import { auth } from './firebase';
import { getUserByFirebaseUID, UserRecord } from './airtable';

interface AirtableUser {
  id: string;
  fields: {
    Email: string;
    FirebaseUID: string;
    DisplayName?: string;
    FirstName?: string;
    LastName?: string;
    Bio?: string;
    SocialLink?: string;
    ProfileImage?: string;
    BannerImage?: string;
    Role?: string;
    PostCount?: number;
    ProfileURL?: string;
  };
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
    fields: {
      Email: record.fields.Email,
      FirebaseUID: record.fields.FirebaseUID,
      DisplayName: record.fields.DisplayName,
      FirstName: record.fields.FirstName,
      LastName: record.fields.LastName,
      Bio: record.fields.Bio,
      SocialLink: record.fields.SocialLink,
      ProfileImage: record.fields.ProfileImage,
      BannerImage: record.fields.BannerImage,
      Role: record.fields.Role,
      PostCount: record.fields.PostCount,
      ProfileURL: record.fields.ProfileURL,
    }
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