import React from 'react';
import { HeartPulse, ShieldAlert, Lock, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-emerald-500 flex items-center justify-center text-white">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-base">First Aid Hospital</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              AI-driven emergency response, verified hospital discovery, and telemedicine appointment platform.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
              <Lock className="w-3.5 h-3.5" />
              <span>Firebase Auth & HIPAA-Scoped Security</span>
            </div>
          </div>

          {/* Emergency Crisis Numbers */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>Emergency Hotlines</span>
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-rose-400" />
                <span>Ambulance & ER: <strong className="text-white">108 / 911</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Poison Control: <strong className="text-white">1-800-222-1222</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Snake Bite ASV Line: <strong className="text-white">+1 (555) 911-TOXIC</strong></span>
              </li>
            </ul>
          </div>

          {/* First Aid Categories */}
          <div>
            <h4 className="font-semibold text-white mb-3 text-sm">Educational Guides</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>CPR & Resuscitation</li>
              <li>Snake Bite Venom Management</li>
              <li>Heart Attack Triage</li>
              <li>Severe Choking & Heimlich</li>
              <li>Thermal & Chemical Burns</li>
              <li>Acute Asthma Attacks</li>
            </ul>
          </div>

          {/* Medical Disclaimer */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider">Medical Disclaimer</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              First Aid Hospital provides educational information and AI assistance. It is NOT a substitute for professional medical advice, diagnosis, or treatment. In life-threatening emergencies, immediately contact local emergency services.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} First Aid Hospital Platform. Built with Google Gemini & OpenAI AI Orchestrator.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <a href="#" className="hover:text-slate-300">Data Retention & Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
