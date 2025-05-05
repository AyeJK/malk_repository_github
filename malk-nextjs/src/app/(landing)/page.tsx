'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Lobster } from 'next/font/google';
import React, { useEffect, useState } from 'react';
import { useMotionValue, useTransform } from 'framer-motion';

const lobster = Lobster({ 
  weight: '400',
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
  const [showInviteInput, setShowInviteInput] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inputError, setInputError] = useState('');

  const handleBetaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowInviteInput(true);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setInputError('Please enter an invite code.');
      return;
    }
    // TODO: handle invite code validation or navigation
    setInputError('');
    // For now, just log
    alert(`Invite code submitted: ${inviteCode}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="flex-1 flex flex-col px-16 md:px-24 py-6 md:py-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={`${lobster.className} text-4xl md:text-5xl text-white mb-12`}>
            Malk.tv
            <span className="ml-3 text-sm font-mono bg-white/10 text-white/70 px-2 py-1 rounded align-top">
              BETA
            </span>
          </h1>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-4xl">
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
              <p className="text-2xl md:text-3xl text-white leading-relaxed">
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
                className="relative rounded-xl p-[3px]"
                style={{
                  background: 'linear-gradient(90deg, #ff8178, #ffb6b6, #ff8178)',
                  backgroundSize: '200% 200%',
                  animation: 'button-gradient-move 3s linear infinite alternate',
                  display: 'inline-block',
                }}
              >
                <Button className="bg-white hover:bg-gray-100 text-black font-semibold text-xl px-8 py-6 rounded-xl relative z-10 w-full min-w-0 flex justify-center items-center transition-all duration-300">
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
                            className="flex-1 bg-transparent outline-none text-xl text-black placeholder-gray-400 border-b border-gray-300 focus:border-[#ff8178] transition-colors px-1 py-0.5 min-w-0"
                            placeholder="Invite code"
                            value={inviteCode}
                            onChange={e => setInviteCode(e.target.value)}
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="bg-[#ff8178] hover:bg-[#ff9d47] text-white font-semibold text-base px-4 py-1.5 rounded-lg transition-colors"
                          >
                            Verify
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
                    background: '#2a0f0f',
                    display: 'inline-block',
                  }}
                >
                  <Button className="bg-[#2a0f0f] hover:bg-[#3a1f1f] text-white font-semibold text-xl px-8 py-6 rounded-xl relative z-10 w-full min-w-0 flex justify-center items-center">
                    LOGIN
                  </Button>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 