"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { BorderBeam } from "./animations/BorderBeam";
import { Magnetic } from "./animations/Magnetic";

interface LoginViewProps {
  onSignIn: () => void;
}

export default function LoginView({ onSignIn }: LoginViewProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden bg-dot-matrix">
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
          
          <div className="relative z-10 space-y-10">
            {/* Logo Section */}
            <div className="text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-block"
              >
                <div className="relative px-6 py-2">
                  <div className="absolute inset-0 bg-gold-500 blur-3xl opacity-10 animate-pulse" />
                  <h1 className="relative text-5xl md:text-6xl font-normal text-signature-gradient tracking-tight font-airstream leading-none whitespace-nowrap">
                    Easy Club
                  </h1>
                </div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                 className="text-zinc-300 text-[10px] font-black uppercase tracking-[0.3em]"
              >
                Nationwide Networking Hub
              </motion.p>
            </div>

            {/* Description Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <p className="text-zinc-200 text-sm font-medium leading-relaxed max-w-[280px] mx-auto">
                Professional club management and nationwide networking, made easy.
              </p>
            </motion.div>

            {/* Action Section */}
            <div className="space-y-6 pt-4">
              <Magnetic strength={0.2}>
                <button
                  onClick={onSignIn}
                  className="w-full group relative flex items-center justify-center gap-4 px-8 py-5 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-[1.5rem] transition-all duration-500 hover:bg-gold-500 hover:shadow-[0_20px_40px_-15px_rgba(250,164,26,0.3)] glint-effect"
                >
                  <Image 
                    src="https://www.google.com/favicon.ico" 
                    width={16} 
                    height={16} 
                    alt="Google" 
                    className="w-4 h-4 transition-transform group-hover:scale-110" 
                    unoptimized 
                  />
                  <span>Sign in with Google</span>
                </button>
              </Magnetic>
              
              <div className="flex flex-col items-center gap-4">
                <div className="h-[1px] w-12 bg-white/5" />
                <p className="text-[9px] text-zinc-200 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold-500 animate-pulse" />
                  Authorized Access Secure Connection
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer/Meta Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-[8px] text-zinc-200 font-bold uppercase tracking-widest leading-loose">
            Enterprise Grade Encryption<br />
            Powered by Gemini 3.1 Flash-Lite & Firebase Hub
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
