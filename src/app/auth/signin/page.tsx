"use client";
import { signIn } from "next-auth/react";
import { FaGoogle, FaDiscord } from "react-icons/fa";

const SignInPage = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-4 bg-white p-8">
      <h1 className="text-primary text-center text-3xl font-bold">WellNest.</h1>
      <p>Start taking care of your pet, and take care of yourself too.</p>

      <button
        onClick={() => signIn("discord", {})}
        className="flex w-full cursor-pointer items-center justify-center gap-4 rounded-lg bg-indigo-400 py-3 font-bold text-white transition-all hover:bg-indigo-500"
      >
        <FaDiscord size={20} />
        Sign in with Discord
      </button>
    </div>
  );
};

export default SignInPage;
