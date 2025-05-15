'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Lobster, Raleway } from 'next/font/google';
import React, { useEffect, useState } from 'react';
import { useMotionValue, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { homeMetadata } from '@/lib/metadata';

const lobster = Lobster({ 
  weight: '400',
  subsets: ['latin'],
});

const raleway = Raleway({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
});

// Define color pairs for each section [text/accent color, background color]
const colorPairs = {
  discovery: ['#ff8178', '#2a0f0f'],
  shouldnt: ['#ff9d47', '#2a1505'],
  mission: ['#ffb61a', '#2a1f05'],
};

// Add type for AccentBar props
interface AccentBarProps {
  accentColor: string;
  bgColor: string;
  children: React.ReactNode;
  intensity?: number;
  gradient?: string;
  animationName?: string;
}

// Animated gradient keyframes
const gradientKeyframes = `
@keyframes gradient-move-1 {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
@keyframes gradient-move-2 {
  0% { background-position: 100% 0%; }
  100% { background-position: 0% 100%; }
}
@keyframes gradient-move-3 {
  0% { background-position: 50% 0%; }
  100% { background-position: 50% 100%; }
}
`;

// Add keyframes for button gradient border
const buttonGradientKeyframes = `
@keyframes button-gradient-move {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
`;

if (typeof window !== 'undefined') {
  // Inject keyframes only once
  if (!document.getElementById('animated-gradient-keyframes')) {
    const style = document.createElement('style');
    style.id = 'animated-gradient-keyframes';
    style.innerHTML = gradientKeyframes;
    document.head.appendChild(style);
  }
  if (!document.getElementById('button-gradient-keyframes')) {
    const style = document.createElement('style');
    style.id = 'button-gradient-keyframes';
    style.innerHTML = buttonGradientKeyframes;
    document.head.appendChild(style);
  }
}

function AccentBar({ accentColor, bgColor, children, intensity = 1, gradient, animationName }: AccentBarProps) {
  return (
    <div className="relative inline-block" style={{ perspective: 600 }}>
      <div
        className="absolute -top-1 -right-1 rounded"
        style={{
          background: gradient || accentColor,
          backgroundSize: '200% 200%',
          animation: animationName ? `${animationName} 4s linear infinite alternate` : undefined,
          height: '100%',
          width: '100%',
          zIndex: 1,
        }}
      />
      <div
        className="relative rounded"
        style={{
          background: bgColor,
          zIndex: 2,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inputError, setInputError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const handleBetaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowInviteInput(true);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setInputError('Please enter an invite code.');
      return;
    }
    setInputError('');
    setLoading(true);
    setSuccess(false);
    setRedirecting(false);
    try {
      const res = await fetch('/api/verify-invite-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode }),
      });
      const data = await res.json();
      if (data.valid) {
        setSuccess(true);
        setInputError('');
        setRedirecting(true);
        setTimeout(() => {
          router.push('/signup');
        }, 1000);
      } else {
        setInputError(data.reason || 'Invalid invite code.');
      }
    } catch (err) {
      setInputError('Error verifying invite code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className={`${lobster.className} text-4xl md:text-5xl text-white mb-12`}>
              Malk
            </h1>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="max-w-4xl mx-auto">
              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="flex flex-col gap-6"
              >
                <AccentBar
                  accentColor="#ff8178"
                  bgColor="#2a0f0f"
                  intensity={1}
                  gradient="linear-gradient(90deg, #ff8178, #ffb6b6, #ff8178)"
                  animationName="gradient-move-1"
                >
                  <h2 className="text-4xl md:text-6xl font-extrabold uppercase text-[#ff8178] px-6 py-4 tracking-tight">
                    VIDEO DISCOVERY
                  </h2>
                </AccentBar>
                <AccentBar
                  accentColor="#ff9d47"
                  bgColor="#2a1505"
                  intensity={0.8}
                  gradient="linear-gradient(120deg, #ff9d47, #ffe29a, #ff9d47)"
                  animationName="gradient-move-2"
                >
                  <h2 className="text-4xl md:text-6xl font-extrabold uppercase text-[#ff9d47] px-6 py-4 tracking-tight">
                    SHOULDNʼT BE A
                  </h2>
                </AccentBar>
                <AccentBar
                  accentColor="#ffb61a"
                  bgColor="#2a1f05"
                  intensity={0.6}
                  gradient="linear-gradient(135deg, #ffb61a, #fff6b6, #ffb61a)"
                  animationName="gradient-move-3"
                >
                  <h2 className="text-4xl md:text-6xl font-extrabold uppercase text-[#ffb61a] px-6 py-4 tracking-tight">
                    SOLO MISSION
                  </h2>
                </AccentBar>
              </motion.div>

              {/* Subtext */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-12"
              >
                <p className={`text-2xl md:text-3xl text-white leading-relaxed ${raleway.className}`}>
                  The best <span className="font-semibold">video recommendations</span> come<br />
                  from real people – not algorithms
                </p>
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="mt-12 flex gap-6"
              >
                <motion.div
                  animate={{ width: showInviteInput ? 340 : 220 }}
                  initial={false}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="relative rounded-xl p-[3px] animate-border-gradient"
                  style={{
                    background: 'linear-gradient(90deg, #ff8178, #ffb6b6, #ff8178)',
                    backgroundSize: '200% 200%',
                    display: 'inline-block',
                  }}
                >
                  <Button className="bg-[#1a1a1a] hover:bg-[#2a0f0f] text-[#ff8178] font-semibold text-xl px-8 py-6 rounded-xl relative z-10 w-full min-w-0 flex justify-center items-center transition-all duration-300 shadow-lg">
                    <AnimatePresence mode="wait" initial={false}>
                      {!showInviteInput && (
                        <motion.span
                          key="join-text"
                          initial={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 60 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, ease: 'easeInOut' }}
                          onClick={handleBetaClick}
                          className="cursor-pointer w-full block text-center"
                        >
                          JOIN THE BETA
                        </motion.span>
                      )}
                      {showInviteInput && (
                        <motion.div
                          key="invite-form"
                          initial={{ opacity: 0, x: -60 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -60 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="flex items-center gap-2 w-full justify-center"
                          style={{ minWidth: 180 }}
                        >
                          <form onSubmit={handleInviteSubmit} className="flex items-center gap-2 w-full">
                            <input
                              type="text"
                              className="flex-1 bg-[#18181b] outline-none text-xl text-[#ffb6b6] placeholder-[#ff8178] border-b-2 border-[#ff8178] focus:border-[#ffb61a] transition-colors px-1 py-0.5 min-w-0 rounded-none"
                              placeholder="Invite code"
                              value={inviteCode}
                              onChange={e => setInviteCode(e.target.value)}
                              autoFocus
                              disabled={loading || success}
                            />
                            <button
                              type="submit"
                              className="bg-[#ff8178] hover:bg-[#ff9d47] text-white font-semibold text-base px-4 py-1.5 rounded-lg transition-colors shadow-md"
                              disabled={loading || success}
                            >
                              {loading
                                ? 'Verifying...'
                                : redirecting
                                  ? (
                                      <span className="inline-block w-5 h-5 align-middle">
                                        <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
                                      </span>
                                    )
                                  : success
                                    ? '✔️'
                                    : 'Verify'}
                            </button>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                  <span className="absolute inset-0 rounded-xl pointer-events-none" style={{ boxShadow: '0 0 16px 2px #ff817880' }} />
                  {inputError && showInviteInput && (
                    <div className="text-red-500 text-sm mt-1 px-2 absolute left-0 right-0 top-full text-center">{inputError}</div>
                  )}
                </motion.div>
                <Link href="/login">
                  <div
                    className="relative rounded-xl p-[3px]"
                    style={{
                      background: 'transparent',
                      display: 'inline-block',
                    }}
                  >
                    <Button className="bg-[#18181b] hover:bg-[#232323] text-[#e5e5e5] font-semibold text-xl px-8 py-6 rounded-xl relative z-10 w-full min-w-0 flex justify-center items-center transition-all duration-300 border border-[#232323]">
                      LOGIN
                    </Button>
                  </div>
                </Link>
              </motion.div>
              {/* Waitlist message appears only when invite input is shown */}
              {showInviteInput && (
                <>
                  <motion.div
                    className="mt-4 text-left"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                  >
                    <span className="text-white/80 text-base">Don't have an invite code? </span>
                    <a
                      href="#waitlist" // TODO: Replace with actual waitlist link or mailto
                      className="text-[#ff8178] underline hover:text-[#ffb61a] transition-colors font-semibold"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get on the waitlist!
                    </a>
                  </motion.div>
                  {success && (
                    <div className="text-green-500 text-sm mt-2 px-2 text-left">Invite code accepted!</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes border-gradient-move {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-border-gradient {
          animation: border-gradient-move 4s linear infinite;
        }
      `}</style>
    </>
  );
}

// Metadata for this page is handled in 'page-metadata.ts' (server file) 