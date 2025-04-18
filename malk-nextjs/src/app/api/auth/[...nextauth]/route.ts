import NextAuth, { DefaultSession, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getUserByFirebaseUID } from '@/lib/airtable';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      airtableId: string;
    } & DefaultSession['user'];
  }
  
  interface User {
    id: string;
    airtableId: string;
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Firebase',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Sign in with Firebase
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );
          
          const user = userCredential.user;
          
          // Get Airtable user record
          const airtableUser = await getUserByFirebaseUID(user.uid);
          
          if (!airtableUser) {
            return null;
          }
          
          // Return user object with Firebase and Airtable data
          return {
            id: user.uid,
            email: user.email,
            name: user.displayName || airtableUser.fields.DisplayName || user.email?.split('@')[0],
            image: user.photoURL,
            airtableId: airtableUser.id
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.airtableId = user.airtableId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.airtableId = token.airtableId as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});

export { handler as GET, handler as POST }; 