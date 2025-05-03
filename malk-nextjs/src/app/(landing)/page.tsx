import Link from 'next/link';

export default function LandingPage() {
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
      <div className="w-full max-w-3xl text-center mb-16">
        <h2 className="italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-200 lowercase tracking-wide" style={{ fontStyle: 'italic' }}>
          watch what the world is watching
        </h2>
      </div>
      {/* Buttons */}
      <div className="flex flex-row gap-6 w-full max-w-xs">
        <Link href="/signup" className="w-1/2">
          <button className="w-full py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-lg transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            Sign Up
          </button>
        </Link>
        <Link href="/login" className="w-1/2">
          <button className="w-full py-3 rounded-2xl bg-zinc-700 hover:bg-zinc-600 text-white font-bold text-lg transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            Log In
          </button>
        </Link>
      </div>
    </div>
  );
} 