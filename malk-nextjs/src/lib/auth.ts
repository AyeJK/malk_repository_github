import CredentialsProvider from 'next-auth/providers/credentials';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getUserByFirebaseUID } from '@/lib/airtable';
import { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
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
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Unify user creation for OAuth
      if (account && (account.provider === 'google' || account.provider === 'facebook')) {
        const { upsertUser, fetchRecords } = await import('@/lib/airtable');
        let airtableUser = null;
        if (user?.email) {
          // Find user by email in Airtable
          const users = await fetchRecords('Users');
          airtableUser = users.find(u => u.fields.Email === user.email);
        }
        if (!airtableUser && user?.email) {
          // Create user in Airtable with a dummy firebaseUID
          const firebaseUID = `oauth-${account.provider.toUpperCase()}-${user.email}`;
          airtableUser = await upsertUser({
            email: user.email,
            firebaseUID,
            displayName: user.name || user.email.split('@')[0],
            profileURL: user.name ? user.name.toLowerCase().replace(/\s+/g, '-') : user.email.split('@')[0],
            postCount: 0
          });
        }
        if (airtableUser) {
          token.airtableId = airtableUser.id;
        }
      }
      if (user) {
        token.id = user.id;
        if (user.airtableId) token.airtableId = user.airtableId;
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.malk.tv' : undefined
      }
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.malk.tv' : undefined
      }
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.malk.tv' : undefined
      }
    }
  }
}; 