"use client";

import React, { useState } from "react";
import { 
  auth, 
  signInWithEmail, 
  signUpWithEmail 
} from "@/lib/firebase";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  ChevronRight,
  UserPlus,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginView() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden selection:bg-purple-500/30">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/20 rotate-12"
          >
            <Zap className="w-10 h-10 text-white fill-white" />
          </motion.div>
          <h1 className="text-6xl font-bold text-white mb-2 font-airstream tracking-wider whitespace-nowrap">Easy Club</h1>
          <p className="text-gray-400 font-medium tracking-tight">The ultimate operating system for student organizations.</p>
        </div>

        <div className="glass-morphism rounded-[2.5rem] p-8 md:p-10 border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <ShieldCheck className="w-5 h-5 text-purple-500/30" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="Official Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="Security Code"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-[#020617] font-bold py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-white/5"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Access Terminal" : "Initialize Account"}
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-400 hover:text-white transition-colors text-sm font-bold flex items-center justify-center gap-2 mx-auto"
            >
              {isLogin ? (
                <>
                  <UserPlus className="w-4 h-4" /> New here? Request Access
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Existing operative? Log in
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-8 text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">
          <span className="hover:text-gray-300 cursor-pointer">Protocol</span>
          <span className="hover:text-gray-300 cursor-pointer">Security</span>
          <span className="hover:text-gray-300 cursor-pointer">Network</span>
        </div>
      </motion.div>
    </div>
  );
}
