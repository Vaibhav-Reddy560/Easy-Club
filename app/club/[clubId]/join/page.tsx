"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

// Add Razorpay type for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function JoinClubPage() {
  const params = useParams();
  const clubId = params.clubId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clubName, setClubName] = useState("");
  const [feeAmount, setFeeAmount] = useState(0);
  const [razorpayKeyId, setRazorpayKeyId] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  const [step, setStep] = useState<'landing' | 'processing' | 'result'>('landing');
  const [result, setResult] = useState<{ passed: boolean, message: string } | null>(null);

  useEffect(() => {
    // Load Razorpay script
    const loadScript = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    };
    loadScript();

    // Fetch club details
    const fetchClub = async () => {
      try {
        const res = await fetch(`/api/join/${clubId}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Failed to fetch club details");
        
        setClubName(data.clubName);
        setFeeAmount(data.feeAmount);
        setRazorpayKeyId(data.razorpayKeyId || "");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [clubId]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert("Please enter your name and email.");
      return;
    }

    if (!razorpayKeyId) {
      setResult({ passed: false, message: "This club has not configured its payment gateway properly." });
      setStep('result');
      return;
    }

    setStep('processing');

    try {
      // 1. Create order on backend
      const orderRes = await fetch(`/api/join/${clubId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initiate payment");
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: razorpayKeyId, 
        amount: orderData.amount,
        currency: orderData.currency,
        name: clubName,
        description: "Club Membership Fee",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // 3. Verify payment on backend
            const verifyRes = await fetch(`/api/join/${clubId}/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                name,
                email
              })
            });
            const verifyData = await verifyRes.json();

            if (verifyRes.ok) {
              setResult({ passed: true, message: "Payment successful! You are now a member." });
            } else {
              setResult({ passed: false, message: verifyData.error || "Payment verification failed." });
            }
          } catch (err: any) {
            setResult({ passed: false, message: err.message || "Something went wrong during verification." });
          } finally {
            setStep('result');
          }
        },
        prefill: {
          name: name,
          email: email,
        },
        theme: {
          color: "#eab308", // gold-500
        },
        modal: {
          ondismiss: function() {
            setStep('landing');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setResult({ passed: false, message: response.error.description || "Payment failed." });
        setStep('result');
      });
      rzp.open();

    } catch (err: any) {
      setResult({ passed: false, message: err.message || "Error starting payment process." });
      setStep('result');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] font-destrubia">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (error && step !== 'result') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] font-destrubia p-4">
        <div className="bg-[#121212] rounded-2xl p-8 max-w-md w-full shadow-2xl text-center border border-white/10">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-astronomus text-white mb-2">Unavailable</h2>
          <p className="text-zinc-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] font-destrubia text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-gold-500/30">
      <div className="max-w-xl mx-auto">
        
        {step === 'landing' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#121212] rounded-3xl shadow-2xl overflow-hidden border border-white/10 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative px-8 py-12 text-center border-b border-white/5">
              <h1 className="text-4xl md:text-5xl font-astronomus text-signature-gradient mb-3">{clubName}</h1>
              <p className="text-zinc-400 text-sm uppercase tracking-widest font-bold">Official Membership Application</p>
            </div>
            
            <div className="p-8 relative">
              <div className="bg-black/50 border border-gold-500/20 rounded-2xl p-6 text-center mb-8">
                <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-2">Membership Fee</p>
                <div className="text-4xl font-astronomus text-gold-400">₹{feeAmount}</div>
              </div>
              
              <form onSubmit={handlePay} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Full Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:border-gold-500/50 outline-none transition-all text-white font-sans"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Email Address</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl focus:border-gold-500/50 outline-none transition-all text-white font-sans"
                    placeholder="john@example.com"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gold-gradient text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-xl mt-4 flex items-center justify-center"
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Payment
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {step === 'processing' && (
           <div className="flex flex-col items-center justify-center py-20">
             <Loader2 className="w-12 h-12 animate-spin text-gold-500 mb-6" />
             <h2 className="text-xl font-astronomus text-white">Awaiting Payment...</h2>
             <p className="text-zinc-400 text-sm mt-2">Please complete the payment in the secure popup.</p>
           </div>
        )}

        {step === 'result' && result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#121212] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            
            <div className="p-12 text-center relative border-b border-white/5">
              <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 bg-black border border-white/10 shadow-2xl">
                {result.passed ? (
                  <CheckCircle className="w-10 h-10 text-gold-500" />
                ) : (
                  <XCircle className="w-10 h-10 text-red-500" />
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-astronomus text-signature-gradient mb-3">
                {result.passed ? 'Welcome to the Club!' : 'Payment Failed'}
              </h1>
              <p className="text-zinc-400 font-sans">
                {result.message}
              </p>
            </div>
            
            {result.passed && (
              <div className="p-8 md:p-12 bg-black/40">
                <div className="p-6 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex items-start">
                  <CheckCircle className="w-5 h-5 mr-4 flex-shrink-0 mt-0.5 text-gold-500" />
                  <div>
                    <h4 className="font-bold text-white mb-1 uppercase tracking-wider text-xs">You are now a member!</h4>
                    <p className="text-zinc-400 text-sm font-sans leading-relaxed">
                      Your profile has been automatically added to the club roster. You can now access all member privileges and resources.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!result.passed && (
               <div className="p-8 bg-black/40 text-center">
                 <button onClick={() => setStep('landing')} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors font-sans text-sm font-bold">
                   Try Again
                 </button>
               </div>
            )}
          </motion.div>
        )}

      </div>
    </div>
  );
}
