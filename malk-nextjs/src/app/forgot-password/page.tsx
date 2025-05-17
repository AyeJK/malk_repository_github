"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lobster, Raleway } from "next/font/google";
import { sendResetPassword } from '@/lib/firebase';

const lobster = Lobster({ weight: "400", subsets: ["latin"] });
const raleway = Raleway({ weight: ["400", "500", "700"], subsets: ["latin"] });

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    const result = await sendResetPassword(email);
    if (result.success) {
      setSuccess("If an account with that email exists, a password reset link has been sent.");
    } else {
      setError(result.error || "Failed to send reset email.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 w-full h-full z-0"
        style={{
          background:
            "linear-gradient(120deg, #181818 0%, #2a0f0f 40%, #ff8178 70%, #000000 100%)",
          backgroundSize: "200% 200%",
          backgroundPosition: "100% 50%",
          opacity: 0.25,
          pointerEvents: "none",
        }}
      />
      <div className="flex-1 flex flex-col px-16 md:px-24 py-6 md:py-8 relative z-10">
        {/* Logo in top left */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/">
            <h1 className={`${lobster.className} text-4xl md:text-5xl text-white mb-12 cursor-pointer`}>Malk</h1>
          </Link>
        </motion.div>
        {/* Main content centered as before */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
          <motion.div
            className="w-full flex justify-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className={`${raleway.className} text-4xl sm:text-5xl md:text-6xl font-light text-white lowercase tracking-wide whitespace-nowrap text-center drop-shadow-[0_2px_16px_rgba(255,255,255,0.15)]`}>
              Forgot Password
            </h2>
          </motion.div>
          <motion.form
            className="w-full max-w-lg space-y-4"
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
            {success && (
              <div className="rounded-md bg-green-900/30 p-4 mb-2">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-400">Success</h3>
                    <div className="mt-2 text-sm text-green-300">
                      <p>{success}</p>
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
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-black text-[#ffe29a] font-extrabold text-xl px-8 py-4 rounded-xl uppercase transition-all duration-300 hover:bg-[#181818] focus:outline-none focus:ring-2 focus:ring-[#ffe29a] focus:ring-offset-2"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </motion.form>
          <motion.div
            className="w-full flex justify-center mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            <Link href="/login" className="underline text-gray-400 hover:text-primary text-lg">Back to Login</Link>
          </motion.div>
        </div>
        {/* Terms at the bottom */}
        <motion.div
          className="fixed bottom-0 left-0 w-full text-xs text-gray-400 text-center pb-4 bg-transparent z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0 }}
        >
          By requesting a reset, you agree to the <a href="#" className="underline hover:text-primary">Terms of Service</a> and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
        </motion.div>
      </div>
    </div>
  );
} 