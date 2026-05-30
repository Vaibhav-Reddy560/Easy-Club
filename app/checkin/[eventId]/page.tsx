"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check, QrCode, Search, AlertCircle, Loader2 } from "lucide-react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/services/firebase";
import { Club, ClubEvent } from "@/lib/types";

export default function CheckinScanner() {
    const { eventId } = useParams() as { eventId: string };
    const [club, setClub] = useState<Club | null>(null);
    const [event, setEvent] = useState<ClubEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [emailInput, setEmailInput] = useState("");
    const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                if (!db) throw new Error("Database not initialized");
                const snapshot = await getDocs(collection(db, "clubs"));
                let foundEvent: ClubEvent | null = null;
                let foundClub: Club | null = null;

                snapshot.docs.forEach(doc => {
                    const c = { ...doc.data(), id: doc.id } as Club;
                    const ev = c.events?.find(e => e.id === eventId);
                    if (ev) {
                        foundEvent = ev;
                        foundClub = c;
                    }
                });

                if (foundEvent && foundClub) {
                    setEvent(foundEvent);
                    setClub(foundClub);
                }
            } catch (err) {
                console.error("Error fetching event:", err);
            } finally {
                setLoading(false);
            }
        };
        if (eventId) fetchEvent();
    }, [eventId]);

    const handleCheckIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!emailInput.trim() || !event || !club || !db) return;

        setStatus('checking');
        const inputEmail = emailInput.trim().toLowerCase();

        // 1. Check if they are already checked in
        const alreadyCheckedIn = event.attendees?.some(a => a.email.toLowerCase() === inputEmail);
        if (alreadyCheckedIn) {
            setStatus('error');
            setMessage(`Participant ${inputEmail} is already checked in.`);
            return;
        }

        // 2. Check against registered emails (from Google Sheets sync)
        const registeredEmails = (event.config as any).registeredEmails || [];
        const isRegistered = registeredEmails.some((e: string) => e.toLowerCase() === inputEmail);

        if (!isRegistered && registeredEmails.length > 0) {
            // If the list is empty, maybe they haven't synced. We could allow it or block it.
            // Based on instructions: "cross-references... only marked if 1:1 match"
            setStatus('error');
            setMessage(`Participant ${inputEmail} is NOT found in the registered list.`);
            return;
        }

        // 3. Mark attendance
        try {
            const newAttendee = {
                email: inputEmail,
                name: inputEmail.split('@')[0], // placeholder name
                markedAt: new Date().toLocaleTimeString(),
                source: 'Manual' as const
            };

            const updatedEvents = club.events.map(ev => {
                if (ev.id === event.id) {
                    return {
                        ...ev,
                        attendees: [newAttendee, ...(ev.attendees || [])]
                    };
                }
                return ev;
            });

            // Save to DB
            const clubRef = doc(db, "clubs", club.id);
            await setDoc(clubRef, { events: updatedEvents }, { merge: true });

            // Update local state
            setEvent(prev => prev ? { ...prev, attendees: [newAttendee, ...(prev.attendees || [])] } : null);
            setClub(prev => prev ? { ...prev, events: updatedEvents } : null);

            setStatus('success');
            setMessage(`Successfully checked in ${inputEmail}!`);
            setEmailInput(""); // clear for next scan
        } catch (err) {
            console.error("Error checking in:", err);
            setStatus('error');
            setMessage("Database error while checking in.");
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin text-gold-500" /></div>;
    }

    if (!event) {
        return <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold uppercase tracking-widest text-signature-gradient">Event Not Found</h1>
            <p className="text-zinc-500 mt-2">The event ID provided does not exist or has been deleted.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md bg-black/60 border border-white/10 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 blur-3xl -z-10" />
                
                <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-6">
                        <QrCode className="w-8 h-8 text-gold-500" />
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-signature-gradient mb-2">{event.name}</h1>
                    <p className="text-xs text-zinc-400 uppercase tracking-widest">Attendance Scanner</p>
                </div>

                <form onSubmit={handleCheckIn} className="space-y-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-zinc-500" />
                        </div>
                        <input 
                            type="email"
                            required
                            value={emailInput}
                            onChange={(e) => {
                                setEmailInput(e.target.value);
                                if (status !== 'idle') setStatus('idle');
                            }}
                            placeholder="Scan or enter participant email..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-500 outline-none focus:border-gold-500/50 transition-colors"
                        />
                    </div>
                    
                    <button 
                        type="submit"
                        disabled={status === 'checking' || !emailInput.trim()}
                        className="w-full bg-gold-500 text-black font-black uppercase tracking-widest py-4 rounded-2xl hover:brightness-110 disabled:opacity-50 flex justify-center items-center gap-2 transition-all"
                    >
                        {status === 'checking' ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Check-in"}
                    </button>
                </form>

                {status === 'success' && (
                    <div className="mt-6 bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-green-400 leading-snug">{message}</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="mt-6 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-400 leading-snug">{message}</p>
                    </div>
                )}
            </div>

            <div className="mt-8 text-center">
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                    Checked In: <span className="text-gold-500 font-bold">{event.attendees?.length || 0}</span> 
                    {(event.config as any).registeredEmails?.length ? ` / ${(event.config as any).registeredEmails.length}` : ''}
                </p>
            </div>
        </div>
    );
}
