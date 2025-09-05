"use client";
import { signIn } from "next-auth/react";
import { FaGoogle, FaDiscord } from "react-icons/fa";

const SignInPage = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#fdfcf8] via-white to-[#e1db92]/20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#d7a43f]/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#6a5a43]/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[#e1db92]/20 blur-2xl" />
      </div>

      {/* Main content container */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-6 px-8">
        {/* Logo and branding section */}
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          {/* Animated logo container */}
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-[#d7a43f]/20 blur-xl" />
            <h1 className="relative bg-gradient-to-r from-[#6a5a43] via-[#402e1a] to-[#6a5a43] bg-clip-text text-5xl font-bold tracking-tight text-transparent">
              WellNest
            </h1>
          </div>

          {/* Decorative divider */}
          <div className="flex items-center gap-3">
            <div className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[#d7a43f]" />
            <div className="h-2 w-2 rounded-full bg-[#d7a43f]" />
            <div className="h-[2px] w-12 bg-gradient-to-l from-transparent to-[#d7a43f]" />
          </div>

          {/* Tagline with better styling */}
          <div className="mt-2 space-y-2">
            <p className="text-lg font-medium text-[#402e1a]">
              Start taking care of your pet
            </p>
            <p className="text-base text-[#6a5a43]">
              and take care of yourself too
            </p>
          </div>

          {/* Feature badges */}
          <div className="mt-6 flex gap-3">
            <div className="rounded-full bg-[#e1db92]/50 px-3 py-1 text-xs font-semibold text-[#6a5a43]">
              🐾 Pet Care
            </div>
            <div className="rounded-full bg-[#e1db92]/50 px-3 py-1 text-xs font-semibold text-[#6a5a43]">
              💚 Wellness
            </div>
            <div className="rounded-full bg-[#e1db92]/50 px-3 py-1 text-xs font-semibold text-[#6a5a43]">
              📊 Tracking
            </div>
          </div>
        </div>

        {/* Sign in section */}
        <div className="w-full space-y-4">
          {/* Welcome message */}
          <div className="text-center">
            <p className="text-sm font-medium text-[#6a5a43]">Welcome back!</p>
            <p className="text-xs text-[#6a5a43]/70">Sign in to continue your wellness journey</p>
          </div>

          {/* Discord sign-in button */}
          <button
            onClick={() => signIn("discord", {})}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#6a5a43] to-[#7a6a53] px-6 py-4 font-semibold text-white shadow-lg shadow-[#6a5a43]/20 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <FaDiscord size={22} className="transition-transform group-hover:rotate-12" />
              <span className="text-base">Sign in with Discord</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out translate-x-[-100%] group-hover:translate-x-[100%]" />
          </button>

          {/* Alternative sign-in hint */}
          <div className="mt-6 flex items-center gap-2">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#d7a43f]/30 to-transparent" />
            <p className="text-xs font-medium text-[#6a5a43]/60">Secure authentication</p>
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[#d7a43f]/30 to-transparent" />
          </div>
        </div>

        {/* Footer section */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#6a5a43]/50">
            By signing in, you agree to nurture wellness
          </p>
          <p className="mt-1 text-xs text-[#6a5a43]/50">
            for both you and your beloved pet 🌿
          </p>
        </div>
      </div>

      {/* Bottom decorative element */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full" height="120" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            d="M0,64 C240,96 480,32 720,64 C960,96 1200,32 1440,64 L1440,120 L0,120 Z"
            fill="url(#gradient)"
            opacity="0.1"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d7a43f" />
              <stop offset="50%" stopColor="#6a5a43" />
              <stop offset="100%" stopColor="#402e1a" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default SignInPage;