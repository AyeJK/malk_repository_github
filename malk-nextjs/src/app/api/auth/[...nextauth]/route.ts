import NextAuth, { DefaultSession, User } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 