import React from 'react';
import { emergencyHotlineService } from '../../services/emergencyHotlineService';
import {
  ShieldAlert,
  Bot,
  MapPin,
  Stethoscope,
  Video,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  Lock
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: () => void;
  onExploreFirstAid: () => void;
  onExploreHospitals: () => void;
  onExploreAI: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onExploreFirstAid,
  onExploreHospitals,
  onExploreAI
}) => {
  const hotlines = emergencyHotlineService.getHotlines();

  return (
    <div className="space-y-16 pb-20">
      {/* 🌟 HERO LANDING BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-rose-950/70 border border-slate-800 p-8 sm:p-14 shadow-2xl">
        {/* Glow FX */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-[450px] h-[450px] bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-16 w-[380px] h-[380px] bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8 max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500/20 via-amber-500/20 to-emerald-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>AI-Powered Emergency Care & Hospital Discovery Network</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Immediate First-Aid <br />
            <span className="bg-gradient-to-r from-red-400 via-rose-300 to-emerald-400 bg-clip-text text-transparent">
              When Every Second Counts.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
            First Aid Hospital reduces medical panic during acute crises. Access dual AI safety triage (Gemini + OpenAI), interactive Leaflet maps with 1-click radius hospital discovery, verified specialist doctor appointments, and WebRTC telemedicine suites.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm rounded-2xl shadow-2xl shadow-rose-600/40 hover:scale-105 transition-all cursor-pointer"
            >
              <span>Get Started / Create Free Account</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onExploreAI}
              className="flex items-center gap-3 px-6 py-4 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-bold text-sm rounded-2xl shadow-xl hover:scale-105 transition-all cursor-pointer"
            >
              <Bot className="w-5 h-5 text-emerald-400" />
              <span>Try AI Emergency Assistant</span>
            </button>

            <a
              href={`tel:${hotlines.primaryEmergencyNumber}`}
              className="flex items-center gap-2 px-5 py-4 bg-red-950/70 hover:bg-red-900/80 border border-red-500/40 text-red-300 font-bold text-xs rounded-2xl transition-all"
            >
              <PhoneCall className="w-4 h-4 text-red-400 animate-bounce" />
              <span>SOS Call ({hotlines.primaryEmergencyNumber} / {hotlines.ambulanceNumber})</span>
            </a>
          </div>
        </div>
      </div>

      {/* 📊 PLATFORM STATISTICS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-white font-mono">100+</span>
            <MapPin className="w-6 h-6 text-sky-400" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Verified 24/7 ER Hospitals</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-white font-mono">50+</span>
            <Stethoscope className="w-6 h-6 text-indigo-400" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Board-Certified Specialists</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-white font-mono">&lt; 2 min</span>
            <Bot className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-xs text-slate-400 font-medium">AI Emergency Triage Speed</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-white font-mono">24 / 7</span>
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Continuous Active Monitoring</p>
        </div>
      </div>

      {/* 🚀 CORE FEATURE SHOWCASE GRID */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Complete Emergency Medical Ecosystem</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Designed to connect patients, doctors, and hospitals seamlessly during critical healthcare events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-xl space-y-4 transition-all hover:scale-[1.02]">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Dual AI Triage Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Powered by Google Gemini & OpenAI with automated rate-limiting safety guards to triage acute symptoms (chest pain, snake bites, thermal burns, asthma attacks).
            </p>
            <button
              onClick={onExploreAI}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              Try AI Triage <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-sky-500/40 rounded-3xl p-6 shadow-xl space-y-4 transition-all hover:scale-[1.02]">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">MapsTrail Live Hospital Map</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive Leaflet maps featuring 1-click radius selection buttons (5km - 100km), live Haversine GPS distance calculation, and 24/7 ER filters.
            </p>
            <button
              onClick={onExploreHospitals}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
            >
              Explore Live Map <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-3xl p-6 shadow-xl space-y-4 transition-all hover:scale-[1.02]">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Verified Doctor Scheduling</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Search board-certified doctors by specialty, view verified licenses, and book appointments with double-booking prevention guards.
            </p>
            <button
              onClick={onOpenAuth}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
            >
              Book Specialist <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 4 */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 rounded-3xl p-6 shadow-xl space-y-4 transition-all hover:scale-[1.02]">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Telemedicine Video Rooms</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-definition WebRTC video consultation suites enabling doctors and patients to connect securely from anywhere.
            </p>
            <button
              onClick={onOpenAuth}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              Join Consultation <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 5 */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-6 shadow-xl space-y-4 transition-all hover:scale-[1.02]">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Peer-Reviewed First-Aid Guides</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Step-by-step verified procedural guides for CPR, venomous snake bites, cardiac events, choking, and thermal burns.
            </p>
            <button
              onClick={onExploreFirstAid}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              Read Guides <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 6 */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-xl space-y-4 transition-all hover:scale-[1.02]">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">HIPAA Privacy & Data Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict database privacy rules, 1-click JSON health data exporter, and account deletion governance controls.
            </p>
            <button
              onClick={onOpenAuth}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              Account Controls <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 🔐 BOTTOM CTA BOX */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/70 to-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-white">Ready for 24/7 AI Emergency Healthcare?</h2>
        <p className="text-slate-300 text-xs max-w-xl mx-auto">
          Create your patient profile or register your medical license in less than 2 minutes.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-2xl shadow-xl shadow-rose-600/30 transition-all cursor-pointer"
        >
          Sign Up / Sign In Now
        </button>
      </div>
    </div>
  );
};
