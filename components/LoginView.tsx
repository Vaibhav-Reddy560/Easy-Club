"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { BorderBeam } from "./animations/BorderBeam";
import { Magnetic } from "./animations/Magnetic";

import { resetAuth } from "@/lib/firebase";

interface LoginViewProps {
  onSignIn: () => void;
}

export default function LoginView({ onSignIn }: LoginViewProps) {
  const [error, setError] = React.useState<string | null>(null);

  const handleSafeSignIn = async () => {
    try {
      setError(null);
      await onSignIn();
    } catch (e: any) {
      console.error("Login failed:", e);
      setError(e.message || "Sign in failed. Try resetting.");
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute top-1/4 -left-20 ambient-glow opacity-40" />
      <div className="absolute bottom-1/4 -right-20 ambient-glow opacity-30" style={{ animationDelay: "-10s" }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md z-10"
      >
        {/* Main Login Card */}
        <div className="glass-panel rounded-[3rem] p-12 relative overflow-hidden group shadow-[0_0_50px_-12px_rgba(255,165,0,0.1)]">
          <BorderBeam size={400} duration={15} delay={2} />
          
          <div className="relative z-10 space-y-12">
            {/* Logo & Header Section */}
            <div className="text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="relative w-20 h-20">
                   <div className="absolute inset-0 bg-gold-500 blur-2xl opacity-20 animate-pulse" />
                   <Image 
                    src="/Logo.png" 
                    alt="Easy Club Logo" 
                    fill 
                    className="object-contain relative z-10"
                    priority
                   />
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-5xl md:text-6xl font-normal text-signature-gradient tracking-normal font-airstream leading-[1.2] py-2 px-4">
                    Easy Club
                  </h1>
                  <p className="text-zinc-300 text-[10px] font-black uppercase tracking-[0.3em]">
                    Club operations made easy.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Action Section */}
            <div className="space-y-6">
              <Magnetic strength={0.2}>
                <button
                  onClick={handleSafeSignIn}
                  className="w-full group relative flex items-center justify-center gap-4 px-8 py-5 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-[1.5rem] transition-all duration-500 hover:bg-gold-500 hover:shadow-[0_20px_40px_-15px_rgba(250,164,26,0.3)] glint-effect"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" className="w-5 h-5 transition-transform group-hover:scale-110">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                    <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957C.347 6.177 0 7.551 0 9s.347 2.823.957 4.038l3.007-2.332z"/>
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </Magnetic>

              {error && (
                <div className="space-y-4">
                  <p className="text-[10px] text-red-400 text-center uppercase tracking-widest font-bold px-4">{error}</p>
                  <button 
                    onClick={resetAuth}
                    className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-all"
                  >
                    Stuck? Emergency Reset Cache
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

