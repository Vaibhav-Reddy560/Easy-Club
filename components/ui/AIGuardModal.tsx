import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Settings, X } from 'lucide-react';

interface AIGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoSettings: () => void;
}

export default function AIGuardModal({ isOpen, onClose, onGoSettings }: AIGuardModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div 
             initial={{ scale: 0.95, opacity: 0, y: 20 }}
             animate={{ scale: 1, opacity: 1, y: 0 }}
             exit={{ scale: 0.95, opacity: 0, y: 20 }}
             className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl relative"
          >
             <div className="absolute top-4 right-4 z-10">
               <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
                 <X className="w-4 h-4" />
               </button>
             </div>
             
             <div className="p-8 space-y-6 text-center">
               <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto border border-gold-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)] relative overflow-hidden group">
                 <div className="absolute inset-0 bg-signature-gradient opacity-0 group-hover:opacity-20 transition-opacity" />
                 <Key className="w-10 h-10 text-gold-500 relative z-10" />
               </div>
               
               <div className="space-y-3">
                 <h2 className="text-2xl font-bold text-white tracking-tight">API Key Required</h2>
                 <p className="text-sm text-white/60 leading-relaxed px-4">
                   To use Easy Club's advanced AI features, you need to configure your own Gemini or OpenAI API Key. 
                 </p>
               </div>
               
               <div className="pt-4 flex flex-col gap-3">
                 <button onClick={onGoSettings} className="w-full h-12 bg-signature-gradient text-black font-bold uppercase tracking-widest text-xs rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(250,164,26,0.3)]">
                   <Settings className="w-4 h-4" />
                   Configure in Settings
                 </button>
                 <button onClick={onClose} className="w-full h-12 bg-white/5 text-white font-bold uppercase tracking-widest text-xs rounded-2xl hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center">
                   Maybe Later
                 </button>
               </div>
             </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
