import React, { useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';

interface IncomingVideoCallProps {
  callerName: string;
  callerRole: string;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingVideoCall: React.FC<IncomingVideoCallProps> = ({
  callerName,
  callerRole,
  onAccept,
  onDecline
}) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    const ring = () => {
      try {
        const ctx = audioCtxRef.current || new AudioContext();
        audioCtxRef.current = ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.value = 0.05;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } catch {
        // Autoplay may block until the user interacts with the page.
      }
    };

    ring();
    intervalRef.current = window.setInterval(ring, 1400);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      audioCtxRef.current?.close().catch(() => undefined);
    };
  }, []);

  const label = callerRole === 'doctor' ? 'Doctor' : 'Patient';

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl shadow-emerald-900/40 p-8 text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-600/40 animate-pulse">
          <Video className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-widest font-black text-emerald-400">Incoming video call</p>
          <h2 className="text-2xl font-black text-white">{callerName}</h2>
          <p className="text-sm text-slate-400">{label} is waiting in the consultation room</p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onDecline}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            Join Call
          </button>
        </div>
      </div>
    </div>
  );
};
