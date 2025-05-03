'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOAuthSignUp = async (provider: 'google' | 'facebook') => {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 py-8">
      {/* Header Row - Centered, Huge */}
      <div className="flex flex-col items-center mb-2">
        <div className="flex flex-row items-baseline justify-center gap-4">
          <span className="text-[5rem] sm:text-[7rem] md:text-[9rem] lg:text-[11rem] font-lobster text-white leading-none">Malk</span>
          <span className="text-blue-400 italic font-semibold align-baseline mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl">beta</span>
        </div>
              </div>
      {/* Subheader */}
      <div className="w-full max-w-md text-center mb-16">
        <h2 className="text-2xl font-light text-gray-200 lowercase tracking-wide">watch what the world is watching</h2>
                </div>
      {/* Social sign-in */}
      <div className="w-full max-w-md flex flex-row gap-4 mb-6">
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 transition font-semibold text-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={() => handleOAuthSignUp('google')}
          disabled={loading}
        >
          <svg className="w-6 h-6" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.23l6.9-6.9C36.68 2.36 30.7 0 24 0 14.82 0 6.71 5.06 2.69 12.44l8.06 6.26C12.33 13.13 17.74 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.01l7.19 5.6C43.99 37.13 46.1 31.3 46.1 24.55z"/><path fill="#FBBC05" d="M10.75 28.7c-1.13-3.36-1.13-6.98 0-10.34l-8.06-6.26C.7 16.13 0 19.97 0 24c0 4.03.7 7.87 2.69 12.44l8.06-6.26z"/><path fill="#EA4335" d="M24 48c6.7 0 12.68-2.36 17.14-6.43l-7.19-5.6c-2.01 1.35-4.6 2.13-7.95 2.13-6.26 0-11.67-3.63-13.25-8.7l-8.06 6.26C6.71 42.94 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
          Google
        </button>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 transition font-semibold text-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={() => handleOAuthSignUp('facebook')}
          disabled={loading}
        >
          <svg className="w-6 h-6" viewBox="0 0 32 32"><path fill="#1877F3" d="M32 16c0-8.837-7.163-16-16-16S0 7.163 0 16c0 7.837 5.657 14.307 13 15.742V20.844h-3.922v-4.844H13V12.5c0-3.066 1.792-4.75 4.533-4.75 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.491 0-1.954.926-1.954 1.875v2.25h3.328l-.532 4.844h-2.796v10.898C26.343 30.307 32 23.837 32 16z"/><path fill="#FFF" d="M22.468 20.844l.532-4.844h-3.328v-2.25c0-.949.463-1.875 1.954-1.875h1.513V8.985s-1.374-.235-2.686-.235C14.792 8.75 13 10.434 13 13.5v2.5H9.078v4.844H13v10.898a16.06 16.06 0 002.001.129c.682 0 1.354-.045 2.001-.129V20.844h2.796z"/></svg>
          Facebook
        </button>
              </div>
      {/* Divider */}
      <div className="w-full max-w-md flex items-center gap-2 mb-6">
        <div className="flex-grow border-t border-gray-600" />
        <span className="mx-2 text-gray-400 font-medium">or</span>
        <div className="flex-grow border-t border-gray-600" />
            </div>
      {/* Create Account button */}
              <button
        type="button"
        onClick={handleCreateAccount}
        className="w-full max-w-md py-3 rounded-2xl bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-lg transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 mb-4"
                disabled={loading}
      >
        Create Account
              </button>
      {/* Terms and sign-in */}
      <div className="w-full max-w-md text-xs text-gray-400 text-center mb-8">
        By signing up, you agree to the <a href="#" className="underline hover:text-primary">Terms of Service</a> and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
            </div>
      <div className="w-full max-w-md flex flex-col items-center gap-2">
        <span className="text-gray-200 text-base mb-1">Already have an account?</span>
        <Link href="/login" className="w-full">
          <button className="w-full py-3 rounded-2xl bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            Sign In
          </button>
        </Link>
      </div>
    </div>
  );
} 