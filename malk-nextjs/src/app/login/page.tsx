'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/firebase';
import { signIn as signInOAuth } from 'next-auth/react';
import { upsertUser } from '@/lib/airtable';
import { motion } from 'framer-motion';
import { Lobster, Raleway } from 'next/font/google';

const lobster = Lobster({ weight: '400', subsets: ['latin'] });
const raleway = Raleway({ weight: ['400', '500', '700'], subsets: ['latin'] });

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Social sign-in handler (reuse from signup)
  const handleOAuthSignIn = async (provider: 'google' | 'facebook' | 'apple') => {
    setError('');
    setLoading(true);
    try {
      await signInOAuth(provider, { callbackUrl: '/dashboard' });
    } catch (err: any) {
      setError('Failed to sign in with ' + provider.charAt(0).toUpperCase() + provider.slice(1));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user, error } = await signIn(formData.email, formData.password);
      if (error) {
        setError(error);
      } else if (user) {
        await upsertUser({
          email: user.email!,
          firebaseUID: user.uid,
          displayName: user.displayName || user.email!.split('@')[0],
        });
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 w-full h-full z-0"
        style={{
          background: 'linear-gradient(120deg, #181818 0%, #2a0f0f 40%, #ff8178 70%, #000000 100%)',
          backgroundSize: '200% 200%',
          backgroundPosition: '100% 50%',
          opacity: 0.25,
          pointerEvents: 'none',
        }}
      />
      <div className="flex-1 flex flex-col px-16 md:px-24 py-6 md:py-8 relative z-10">
        {/* Logo in top left */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={`${lobster.className} text-4xl md:text-5xl text-white mb-12`}>Malk</h1>
        </motion.div>
        {/* Main content centered as before */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
          {/* Subheader */}
          <motion.div className="w-full flex justify-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className={`${raleway.className} text-4xl sm:text-5xl md:text-6xl font-light text-white lowercase tracking-wide whitespace-nowrap text-center drop-shadow-[0_2px_16px_rgba(255,255,255,0.15)]`}>Welcome Back</h2>
          </motion.div>
          {/* Email/password login form - moved above social sign-in */}
          <motion.form className="w-full max-w-lg space-y-4"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {error && (
              <div className="rounded-md bg-red-900/30 p-4 mb-2">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-400">Error</h3>
                    <div className="mt-2 text-sm text-red-300">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full py-3 px-4 rounded-xl bg-zinc-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary text-lg"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full py-3 px-4 rounded-xl bg-zinc-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary text-lg mb-8"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <div className="w-full flex justify-end mb-2">
              <Link href="/forgot-password" className="text-sm underline text-gray-400 hover:text-[#ffe29a] transition">Forgot password?</Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-black text-[#ffe29a] font-extrabold text-xl px-8 py-4 rounded-xl uppercase transition-all duration-300 hover:bg-[#181818] focus:outline-none focus:ring-2 focus:ring-[#ffe29a] focus:ring-offset-2"
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </motion.form>
          {/* Social sign-in - now below the form */}
          <motion.div className="w-full max-w-lg flex flex-col items-center mt-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <span className="text-gray-400 font-medium text-lg mb-6 block">or sign in with:</span>
            <div className="grid grid-cols-3 gap-4 w-full mb-8">
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#2a0f0f] border-t-4 border-[#ff8178] text-[#ff8178] font-extrabold text-lg uppercase transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:bg-[#1a0707]"
                onClick={() => handleOAuthSignIn('google')}
                disabled={loading}
                style={{ boxShadow: 'none' }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.35 11.1H12v2.8h5.35c-.23 1.25-1.4 3.67-5.35 3.67-3.22 0-5.85-2.67-5.85-5.97s2.63-5.97 5.85-5.97c1.83 0 3.06.78 3.76 1.45l2.57-2.49C17.09 3.59 14.76 2.5 12 2.5 6.75 2.5 2.5 6.75 2.5 12s4.25 9.5 9.5 9.5c5.47 0 9.09-3.85 9.09-9.27 0-.62-.07-1.09-.16-1.63z" /></svg>
                GOOGLE
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#2a1505] border-t-4 border-[#ff9d47] text-[#ff9d47] font-extrabold text-lg uppercase transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:bg-[#180a03]"
                onClick={() => handleOAuthSignIn('facebook')}
                disabled={loading}
                style={{ boxShadow: 'none' }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a4 4 0 0 0-4 4v3H7v4h4v8h4v-8h3l1-4h-4V6a1 1 0 0 1 1-1h3z" /></svg>
                FACEBOOK
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#2a1f05] border-t-4 border-[#ffb61a] text-[#ffb61a] font-extrabold text-lg uppercase transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:bg-[#181204]"
                onClick={() => handleOAuthSignIn('apple')}
                disabled={loading}
                style={{ boxShadow: 'none' }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M16.365 1.43c0 1.14-.93 2.06-2.07 2.06-.04 0-.08 0-.12-.01.01-.13.02-.27.02-.41 0-1.12.97-2.04 2.07-2.04.06 0 .11 0 .16.01-.01.13-.02.26-.02.39zm2.13 4.37c-1.14-.07-2.1.65-2.65.65-.56 0-1.42-.63-2.34-.61-.96.02-1.85.56-2.34 1.43-1 .17-3.7 1.44-3.7 4.28 0 1.69.65 3.45 1.45 4.59.68.98 1.27 1.85 2.18 1.82.87-.03 1.2-.56 2.25-.56 1.05 0 1.34.56 2.25.54.91-.02 1.48-.89 2.16-1.87.61-.89.86-1.76.86-1.8-.02-.01-2.36-.91-2.38-3.6-.02-2.26 1.84-3.34 1.92-3.39-.99-1.45-2.53-1.48-2.74-1.5zm-2.13 13.13c-.41 0-.82-.12-1.16-.34-.34-.22-.62-.53-.81-.91-.19-.38-.29-.8-.29-1.23 0-.43.1-.85.29-1.23.19-.38.47-.69.81-.91.34-.22.75-.34 1.16-.34.41 0 .82.12 1.16.34.34.22.62.53.81.91.19.38.29.8.29 1.23 0 .43-.1.85-.29 1.23-.19.38-.47.69-.81.91-.34.22-.75.34-1.16.34z"/></svg>
                APPLE
              </button>
            </div>
          </motion.div>
          {/* Sign up prompt */}
          <motion.span className="text-gray-400 text-lg font-medium mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            Don't have an account?{' '}
            <Link href="/signup" className="underline hover:text-primary">Sign up</Link>
          </motion.span>
          {/* Terms fixed at the very bottom */}
          <motion.div
            className="fixed bottom-0 left-0 w-full text-xs text-gray-400 text-center pb-4 bg-transparent z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.0 }}
          >
            By logging in, you agree to the <a href="#" className="underline hover:text-primary">Terms of Service</a> and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
          </motion.div>
        </div>
      </div>
    </div>
  );
} 