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
    <div className="space-y-12 pb-16">
      {/* 🌟 CLINICAL HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm dark:shadow-2xl transition-all">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 medical-grid-bg opacity-70 pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-3xl">
          {/* Clinical Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>24/7 Clinical Emergency & Triage System</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Immediate First-Aid <br />
            <span className="text-rose-600 dark:text-rose-400">When Every Second Counts.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            First Aid Hospital reduces medical panic during acute crises. Access certified emergency triage guides, interactive hospital GPS maps, verified specialist consultations, and secure telemedicine video suites.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              <span>Get Started / Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreAI}
              className="flex items-center gap-2 px-5 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>AI Triage Assistant</span>
            </button>

            <a
              href={`tel:${hotlines.primaryEmergencyNumber}`}
              className="flex items-center gap-2 px-4 py-3.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>SOS {hotlines.primaryEmergencyNumber}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 📊 PLATFORM STATISTICS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">100+</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verified 24/7 ER Hospitals</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">50+</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Board-Certified Specialists</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">&lt; 2s</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">AI Emergency Triage Speed</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">24 / 7</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Continuous Active Monitoring</p>
        </div>
      </div>

      {/* 🚀 CORE FEATURE SHOWCASE GRID */}
      <div className="space-y-6">
        <div className="text-left sm:text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Integrated Emergency Medical Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Designed to connect patients, doctors, and hospital emergency facilities seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Clinical Triage Assistant</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Provides immediate symptom assessment, urgency severity grading, and step-by-step emergency instructions for acute events.
            </p>
            <button
              onClick={onExploreAI}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Launch AI Triage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Hospital & ER Locator</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Interactive Leaflet maps with 1-click radius filters (5km - 100km), GPS distance calculation, and emergency facility capabilities.
            </p>
            <button
              onClick={onExploreHospitals}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Explore ER Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Doctor Directory & Scheduling</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Find and book consultations with board-certified physicians, cardiologists, toxicologists, and general practitioners.
            </p>
            <button
              onClick={onOpenAuth}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Find Specialists</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 4 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Telemedicine Consultations</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Encrypted WebRTC audio/video consultations for follow-ups, remote triage, and medication advisory sessions.
            </p>
            <button
              onClick={onOpenAuth}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Telehealth Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 5 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">First-Aid Guide Protocols</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Step-by-step clinical guides for CPR, snake bites, cardiac emergencies, choking, thermal burns, and shock treatment.
            </p>
            <button
              onClick={onExploreFirstAid}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Read Guides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 6 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">HIPAA & Privacy Standards</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Patient data isolation, authenticated access guards, and full JSON health data export capabilities.
            </p>
            <button
              onClick={onOpenAuth}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Security Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 🔐 BOTTOM CTA BOX */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-sm dark:shadow-xl">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ready for 24/7 Clinical Emergency Healthcare?</h2>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Create your personal medical emergency profile or register as a medical provider in just minutes.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer"
        >
          Sign Up / Sign In Now
        </button>
      </div>
    </div>
  );
};
