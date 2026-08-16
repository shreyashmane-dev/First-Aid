import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { emergencyHotlineService } from '../../services/emergencyHotlineService';
import {
  HeartPulse,
  ShieldAlert,
  Bot,
  MapPin,
  Stethoscope,
  Calendar,
  Video,
  UserCheck,
  ChevronRight,
  Flame,
  Wind,
  Activity,
  Sparkles,
  PhoneCall,
  Lock,
  ArrowRight
} from 'lucide-react';

interface PatientDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenMedicalProfile: () => void;
  onSelectArticle: (articleId: string) => void;
  onJoinVideoCall: (meetingId: string) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onNavigate,
  onOpenMedicalProfile,
  onSelectArticle,
  onJoinVideoCall
}) => {
  const { currentUser } = useAuth();
  const { medicalProfile, appointments, firstAidArticles } = useApp();

  const hotlines = emergencyHotlineService.getHotlines();

  const activeUpcomingAppointment = appointments.find(
    a => a.status === 'confirmed' || a.status === 'requested'
  );

  return (
    <div className="space-y-10 pb-16">
      {/* 🌟 HIGH-IMPACT HERO LANDING SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-rose-950/60 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        {/* Glow FX Backdrop */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-4xl">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500/20 via-amber-500/20 to-emerald-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>AI-Powered Emergency Care & Hospital Discovery Network</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Immediate Medical Guidance <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-red-400 via-rose-300 to-emerald-400 bg-clip-text text-transparent">
              When Seconds Count.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            Welcome, <strong className="text-white font-bold">{currentUser?.displayName || 'Sarah'}</strong>. First Aid Hospital connects you to instantaneous dual AI triage (Gemini + OpenAI), interactive Leaflet maps with 1-click radius filters, verified doctor directories, and secure WebRTC video consultation suites.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('ai_chat')}
              className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-sm rounded-2xl shadow-2xl shadow-rose-600/40 hover:scale-105 transition-all"
            >
              <Bot className="w-5 h-5 animate-pulse" />
              <span>Launch AI Symptom Triage</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('hospitals')}
              className="flex items-center gap-3 px-6 py-4 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white font-bold text-sm rounded-2xl shadow-xl hover:scale-105 transition-all"
            >
              <MapPin className="w-5 h-5 text-sky-400" />
              <span>Locate 24/7 ER Hospitals</span>
            </button>

            <a
              href={`tel:${hotlines.primaryEmergencyNumber}`}
              className="flex items-center gap-2 px-5 py-4 bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-bold text-xs rounded-2xl transition-all"
            >
              <PhoneCall className="w-4 h-4 text-red-400 animate-bounce" />
              <span>Call SOS ({hotlines.primaryEmergencyNumber} / {hotlines.ambulanceNumber})</span>
            </a>
          </div>
        </div>
      </div>

      {/* 📊 LIVE PLATFORM STATS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">100+</div>
            <div className="text-xs text-slate-400">Verified ER Hospitals</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">50+</div>
            <div className="text-xs text-slate-400">Specialist Doctors</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">&lt; 2 min</div>
            <div className="text-xs text-slate-400">AI Triage Speed</div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white font-mono">24 / 7</div>
            <div className="text-xs text-slate-400">Emergency Monitoring</div>
          </div>
        </div>
      </div>

      {/* 🚀 QUICK AI PROMPT SUGGESTIONS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Instant AI Emergency Safety Prompts</span>
          </h3>
          <span className="text-xs text-slate-400">Click any prompt to ask AI assistant</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            '🐍 What is the immediate first-aid for a venomous snake bite?',
            '❤️ How do I perform CPR compressions on an unconscious person?',
            '🔥 How to treat a 2nd degree burn on hands?',
            '🌬️ What are the steps for acute asthma attack breathlessness?'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate('ai_chat')}
              className="px-3.5 py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 hover:text-emerald-400 transition-all font-medium text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* 🏥 UPCOMING APPOINTMENT & MEDICAL BACKGROUND ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Upcoming Appointment Widget */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-400" />
              <h2 className="text-lg font-bold text-white">Upcoming Doctor Consultations</h2>
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {activeUpcomingAppointment ? (
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-rose-400 font-bold text-lg border border-slate-600">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{activeUpcomingAppointment.doctorName}</h3>
                    <p className="text-slate-400 text-xs">{activeUpcomingAppointment.doctorSpecialization}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">{activeUpcomingAppointment.hospitalName}</p>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {activeUpcomingAppointment.status.toUpperCase()}
                  </span>
                  <p className="text-xs text-slate-300 font-medium mt-1">
                    📅 {activeUpcomingAppointment.appointmentDate} at {activeUpcomingAppointment.startTime}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Consultation Mode: <strong className="text-white capitalize">{activeUpcomingAppointment.type.replace('_', ' ')}</strong>
                </div>

                {activeUpcomingAppointment.type === 'video' && activeUpcomingAppointment.meetingId && (
                  <button
                    onClick={() => onJoinVideoCall(activeUpcomingAppointment.meetingId!)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Video className="w-4 h-4 animate-pulse" />
                    <span>Join Video Call Suite</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/40 rounded-2xl p-6 text-center border border-dashed border-slate-700 space-y-3">
              <p className="text-slate-400 text-xs">No active appointments scheduled today.</p>
              <button
                onClick={() => onNavigate('doctors')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-md"
              >
                Schedule Specialist Doctor
              </button>
            </div>
          )}
        </div>

        {/* Patient Medical Background & Privacy Badge */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-bold text-white">Medical Background</h2>
            </div>
            <button
              onClick={onOpenMedicalProfile}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              Update
            </button>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <span className="text-slate-400">Blood Group</span>
              <span className="px-2.5 py-1 bg-red-600/20 text-red-400 border border-red-500/40 rounded-lg font-extrabold text-sm">
                {medicalProfile.bloodGroup}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Known Allergies:</span>
              <div className="flex flex-wrap gap-1.5">
                {medicalProfile.allergies.length > 0 ? (
                  medicalProfile.allergies.map((allergy, i) => (
                    <span key={i} className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md text-[11px]">
                      ⚠️ {allergy}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 italic">None listed</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Emergency Contact:</span>
              <p className="text-white font-medium">
                {medicalProfile.importantNotes ? 'David Jenkins (Spouse)' : 'David Jenkins'}
              </p>
              <p className="text-emerald-400 font-mono text-[11px]">+1 (555) 876-5432</p>
            </div>

            <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <Lock className="w-3.5 h-3.5" /> HIPAA Encrypted
              </span>
              <span>Controlled Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* 📚 ESSENTIAL FIRST AID GUIDES GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Verified First-Aid Procedures</h2>
          </div>
          <button
            onClick={() => onNavigate('first_aid')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            Browse All {firstAidArticles.length} Guides <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {firstAidArticles.slice(0, 4).map(article => (
            <div
              key={article.articleId}
              onClick={() => {
                onSelectArticle(article.articleId);
                onNavigate('first_aid');
              }}
              className="bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.02] shadow-lg group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-500/30 flex items-center justify-center text-red-400">
                    {article.articleId === 'fa_cpr' && <HeartPulse className="w-5 h-5" />}
                    {article.articleId === 'fa_snake_bite' && <ShieldAlert className="w-5 h-5 text-amber-400" />}
                    {article.articleId === 'fa_heart_attack' && <Activity className="w-5 h-5 text-rose-400" />}
                    {article.articleId === 'fa_burns' && <Flame className="w-5 h-5 text-orange-400" />}
                    {article.articleId === 'fa_asthma' && <Wind className="w-5 h-5 text-sky-400" />}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    article.emergencyLevel === 'Critical' ? 'bg-red-600/20 text-red-400 border border-red-500/40' : 'bg-amber-600/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {article.emergencyLevel}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm group-hover:text-rose-400 transition-colors line-clamp-1">
                  {article.title}
                </h3>
                <p className="text-slate-400 text-xs line-clamp-2 leading-normal">
                  {article.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" /> Reviewed
                </span>
                <span className="group-hover:translate-x-1 transition-transform text-rose-400 font-bold">Read &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
