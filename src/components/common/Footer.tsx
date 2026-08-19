import React from 'react';
import { HeartPulse, ShieldAlert, Lock, Phone, MapPin, Stethoscope, Bot, ShieldCheck, Globe, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { emergencyHotlineService } from '../../services/emergencyHotlineService';

interface FooterProps {
  onNavigate?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const hotlines = emergencyHotlineService.getHotlines();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 text-xs mt-auto">
      {/* 🌟 TOP CRITICAL HOTLINES BAR */}
      <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-rose-950/80 border-b border-red-900/30 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 animate-pulse">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-white font-black text-sm block">Emergency Response Network 24/7</span>
              <span className="text-slate-400 text-[11px]">Instant 1-Click Dial to Emergency Services & Trauma Units</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`tel:${hotlines.primaryEmergencyNumber}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs shadow-md shadow-red-600/30 transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Ambulance: {hotlines.primaryEmergencyNumber}</span>
            </a>

            <a
              href="tel:112"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs border border-slate-700 transition-all"
            >
              <span>National ER: 112</span>
            </a>

            <a
              href={`tel:${hotlines.poisonControlNumber}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/60 hover:bg-amber-900 text-amber-300 font-bold rounded-xl text-xs border border-amber-600/40 transition-all"
            >
              <span>Poison Control: {hotlines.poisonControlNumber}</span>
            </a>

            <a
              href={`tel:${hotlines.toxicologyHelpline}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 font-bold rounded-xl text-xs border border-emerald-600/40 transition-all"
            >
              <span>Snake Bite Line: {hotlines.toxicologyHelpline}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 🏢 MAIN FOOTER COLUMNS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Col 1: Brand & Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
                <HeartPulse className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="font-black text-white text-lg bg-gradient-to-r from-red-400 via-rose-300 to-emerald-400 bg-clip-text text-transparent">
                  First Aid Hospital
                </span>
                <span className="block text-[10px] text-emerald-400 font-mono">Emergency Clinical Infrastructure</span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              An AI-powered emergency clinical response system delivering rapid symptom triage, verified hospital GPS discovery, board-certified physician appointments, and encrypted WebRTC telemedicine consultations.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>HIPAA Encrypted</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[11px] font-mono">
                <Lock className="w-3.5 h-3.5" />
                <span>Zero Data Selling</span>
              </div>
            </div>
          </div>

          {/* Col 2: Core Platform Services */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span>Platform Services</span>
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate?.('ai_chat')}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Bot className="w-3 h-3 text-emerald-400" />
                  <span>AI Emergency Triage</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('hospitals')}
                  className="hover:text-sky-400 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <MapPin className="w-3 h-3 text-sky-400" />
                  <span>Hospital ER GPS Map</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('doctors')}
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <Stethoscope className="w-3 h-3 text-indigo-400" />
                  <span>Specialist Directory</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('first_aid')}
                  className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                >
                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                  <span>First-Aid Protocols</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Verified Emergency Guides */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>First-Aid Guides</span>
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onNavigate?.('first_aid')} className="hover:text-rose-300 transition-colors cursor-pointer text-left">
                  ❤️ CPR & Resuscitation
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('first_aid')} className="hover:text-amber-300 transition-colors cursor-pointer text-left">
                  🐍 Snake Bite ASV Protocol
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('first_aid')} className="hover:text-rose-300 transition-colors cursor-pointer text-left">
                  🫀 Heart Attack Triage
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('first_aid')} className="hover:text-orange-300 transition-colors cursor-pointer text-left">
                  🔥 Thermal & Chemical Burns
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('first_aid')} className="hover:text-sky-300 transition-colors cursor-pointer text-left">
                  🌬️ Acute Asthma & Choking
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Controls & Theme */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">
              Quick Preferences
            </h4>

            {/* Theme Toggle Pill in Footer */}
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span>Display Theme:</span>
                <span className="text-sky-400 font-mono uppercase text-[10px]">{theme}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`py-1 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    theme === 'light' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-3 h-3" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`py-1 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    theme === 'dark' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-3 h-3" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Language Switcher in Footer */}
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-indigo-400" /> Language:</span>
                <span className="text-indigo-300 font-mono uppercase text-[10px]">{language}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === 'en' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('mr')}
                  className={`py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === 'mr' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  मराठी
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ⚠️ MEDICAL DISCLAIMER BOX */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start gap-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h5 className="font-extrabold text-amber-400 text-xs uppercase tracking-wider">
              Official Medical Triage Disclaimer
            </h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              First Aid Hospital is an emergency decision support and educational reference system. The AI triage and library articles do not replace emergency medical personnel or clinical physician diagnosis. In any life-threatening acute condition, immediately call <strong>108 / 112</strong> or proceed to the nearest emergency room.
            </p>
          </div>
        </div>

        {/* 📜 BOTTOM COPYRIGHT BAR */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-4 text-xs">
          <p>© {new Date().getFullYear()} First Aid Hospital Inc. Powered by Gemini & OpenAI Medical Triage Orchestrator.</p>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <span className="text-slate-800">•</span>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <span className="text-slate-800">•</span>
            <a href="#" className="hover:text-slate-300 transition-colors">HIPAA Scoped Compliance</a>
            <span className="text-slate-800">•</span>
            <a href="#" className="hover:text-slate-300 transition-colors">Security Audit</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
