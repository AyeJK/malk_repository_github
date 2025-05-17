"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lobster, Raleway } from "next/font/google";
import { auth } from '@/lib/firebase';
import { verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";

const lobster = Lobster({ weight: "400", subsets: ["latin"] });
const raleway = Raleway({ weight: ["400", "500", "700"], subsets: ["latin"] });

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = searchParams.get("oobCode") || "";
  const mode = searchParams.get("mode") || "";

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [codeChecked, setCodeChecked] = useState(false);

  useEffect(() => {
    if (mode === "resetPassword" && oobCode) {
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          setEmail(email);
          setCodeChecked(true);
        })
        .catch((err) => {
          setError("Invalid or expired password reset link.");
          setCodeChecked(true);
        });
    } else {
      setError("Invalid password reset link.");
      setCodeChecked(true);
    }
  }, [mode, oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess("Your password has been reset. You can now log in with your new password.");
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
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
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
          <motion.div
            className="w-full flex justify-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <h2 className={`${raleway.className} text-4xl sm:text-5xl md:text-6xl font-light text-white lowercase tracking-wide whitespace-nowrap text-center drop-shadow-[0_2px_16px_rgba(255,255,255,0.15)]`}>
              Reset Password
            </h2>
          </motion.div>
          {codeChecked && !success && (
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
              {email && (
                <div className="text-gray-300 text-lg mb-2">Resetting password for <span className="font-bold">{email}</span></div>
              )}
              <input
                id="new-password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full py-3 px-4 rounded-xl bg-zinc-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                placeholder="New password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-black text-[#ffe29a] font-extrabold text-xl px-8 py-4 rounded-xl uppercase transition-all duration-300 hover:bg-[#181818] focus:outline-none focus:ring-2 focus:ring-[#ffe29a] focus:ring-offset-2"
              >
                {loading ? "Saving..." : "Save New Password"}
              </button>
            </motion.form>
          )}
          {success && (
            <div className="rounded-md bg-green-900/30 p-4 mb-2 w-full max-w-lg text-center">
              <div className="flex flex-col items-center">
                <svg className="h-8 w-8 text-green-400 mb-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-medium text-green-400 mb-2">Success</h3>
                <div className="mt-2 text-green-300">
                  <p>{success}</p>
                </div>
                <Link href="/login" className="underline text-gray-400 hover:text-primary text-lg mt-4">Back to Login</Link>
              </div>
            </div>
          )}
        </div>
        {/* Terms at the bottom */}
        <motion.div
          className="fixed bottom-0 left-0 w-full text-xs text-gray-400 text-center pb-4 bg-transparent z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0 }}
        >
          By resetting your password, you agree to the <a href="#" className="underline hover:text-primary">Terms of Service</a> and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
        </motion.div>
      </div>
    </div>
  );
} 