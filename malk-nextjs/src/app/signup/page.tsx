'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOAuthSignUp = async (provider: 'google' | 'facebook' | 'apple') => {
    setError('');
    setLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (err: any) {
      setError('Failed to sign up with ' + provider.charAt(0).toUpperCase() + provider.slice(1));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    // This will trigger the next step/modal for email/password (to be implemented)
  };

  // Animated gradient keyframes for button border (if not already present)
  if (typeof window !== 'undefined') {
    if (!document.getElementById('button-gradient-keyframes-signup')) {
      const style = document.createElement('style');
      style.id = 'button-gradient-keyframes-signup';
      style.innerHTML = `@keyframes button-gradient-move { 0% { background-position: 0% 50%; } 100% { background-position: 100% 50%; } }`;
      document.head.appendChild(style);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 py-8">
      {/* Header Row - Centered, Huge */}
      <motion.div className="flex flex-col items-center mb-2"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="flex flex-row items-baseline justify-center gap-4">
          <span className="text-[9rem] sm:text-[12rem] md:text-[16rem] lg:text-[18rem] font-lobster text-white leading-none font-bold drop-shadow-[0_4px_32px_rgba(255,255,255,0.25)]">Malk</span>
        </div>
      </motion.div>
      {/* Subheader */}
      <motion.div className="w-full flex justify-center mb-16"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-white lowercase tracking-wide whitespace-nowrap text-center drop-shadow-[0_2px_16px_rgba(255,255,255,0.15)]">Social Video Discovery</h2>
      </motion.div>
      {/* Two-column layout for sign up options */}
      <div className="w-full max-w-md grid grid-rows-[auto_auto] grid-cols-3 gap-y-8 gap-x-4 mb-8 mx-auto">
        <motion.div
          className="col-span-3"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <button
            type="button"
            onClick={handleCreateAccount}
            className="bg-[#232323] border-4 border-[#ffe29a] text-[#ffe29a] font-extrabold text-xl px-8 py-6 rounded-xl uppercase relative z-10 w-full min-w-0 flex justify-center items-center transition-all duration-300 hover:bg-[#181818] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            disabled={loading}
            style={{ boxShadow: 'none' }}
          >
            CREATE ACCOUNT
          </button>
        </motion.div>
        <motion.div className="col-span-3 flex flex-col items-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <span className="text-gray-400 font-medium text-lg mb-6 block">or create an account via:</span>
          <div className="grid grid-cols-3 gap-4 w-full">
            {/* Google Button styled as accent bar */}
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#2a0f0f] border-t-4 border-[#ff8178] text-[#ff8178] font-extrabold text-lg uppercase transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:bg-[#1a0707]"
              onClick={() => handleOAuthSignUp('google')}
              disabled={loading}
              style={{ boxShadow: 'none' }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.35 11.1H12v2.8h5.35c-.23 1.25-1.4 3.67-5.35 3.67-3.22 0-5.85-2.67-5.85-5.97s2.63-5.97 5.85-5.97c1.83 0 3.06.78 3.76 1.45l2.57-2.49C17.09 3.59 14.76 2.5 12 2.5 6.75 2.5 2.5 6.75 2.5 12s4.25 9.5 9.5 9.5c5.47 0 9.09-3.85 9.09-9.27 0-.62-.07-1.09-.16-1.63z" /></svg>
              GOOGLE
            </button>
            {/* Facebook Button styled as accent bar */}
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#2a1505] border-t-4 border-[#ff9d47] text-[#ff9d47] font-extrabold text-lg uppercase transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:bg-[#180a03]"
              onClick={() => handleOAuthSignUp('facebook')}
              disabled={loading}
              style={{ boxShadow: 'none' }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a4 4 0 0 0-4 4v3H7v4h4v8h4v-8h3l1-4h-4V6a1 1 0 0 1 1-1h3z" /></svg>
              FACEBOOK
            </button>
            {/* Apple Button styled as accent bar */}
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#2a1f05] border-t-4 border-[#ffb61a] text-[#ffb61a] font-extrabold text-lg uppercase transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:bg-[#181204]"
              onClick={() => handleOAuthSignUp('apple')}
              disabled={loading}
              style={{ boxShadow: 'none' }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M16.365 1.43c0 1.14-.93 2.06-2.07 2.06-.04 0-.08 0-.12-.01.01-.13.02-.27.02-.41 0-1.12.97-2.04 2.07-2.04.06 0 .11 0 .16.01-.01.13-.02.26-.02.39zm2.13 4.37c-1.14-.07-2.1.65-2.65.65-.56 0-1.42-.63-2.34-.61-.96.02-1.85.56-2.34 1.43-1 .17-3.7 1.44-3.7 4.28 0 1.69.65 3.45 1.45 4.59.68.98 1.27 1.85 2.18 1.82.87-.03 1.2-.56 2.25-.56 1.05 0 1.34.56 2.25.54.91-.02 1.48-.89 2.16-1.87.61-.89.86-1.76.86-1.8-.02-.01-2.36-.91-2.38-3.6-.02-2.26 1.84-3.34 1.92-3.39-.99-1.45-2.53-1.48-2.74-1.5zm-2.13 13.13c-.41 0-.82-.12-1.16-.34-.34-.22-.62-.53-.81-.91-.19-.38-.29-.8-.29-1.23 0-.43.1-.85.29-1.23.19-.38.47-.69.81-.91.34-.22.75-.34 1.16-.34.41 0 .82.12 1.16.34.34.22.62.53.81.91.19.38.29.8.29 1.23 0 .43-.1.85-.29 1.23-.19.38-.47.69-.81.91-.34.22-.75.34-1.16.34z"/></svg>
              APPLE
            </button>
          </div>
        </motion.div>
      </div>
      {/* Terms and sign-in */}
      <motion.span className="text-gray-400 text-lg font-medium"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.8 }}
      >
        Already have an account?{' '}
        <Link href="/login" className="underline hover:text-primary">Sign in</Link>
      </motion.span>
      {/* Terms and sign-in fixed at the very bottom */}
      <motion.div
        className="fixed bottom-0 left-0 w-full text-xs text-gray-400 text-center pb-4 bg-transparent z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.0 }}
      >
        By signing up, you agree to the <a href="#" className="underline hover:text-primary">Terms of Service</a> and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
      </motion.div>
    </div>
  );
} 