'use client';
import { SessionProvider } from 'next-auth/react';
import React from 'react';
import { AuthProvider } from '@/lib/auth-context';

export default function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
} 