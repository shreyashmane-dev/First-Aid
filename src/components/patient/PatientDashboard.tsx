import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
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
  Activity
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

  const activeUpcomingAppointment = appointments.find(
    a => a.status === 'confirmed' || a.status === 'requested'
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950/80 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              Emergency Response Active
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Good day, <span className="text-rose-400">{currentUser?.displayName || 'Sarah'}</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Get immediate first-aid instructions, chat with our dual AI assistant (Gemini + OpenAI), or locate verified 24/7 ER hospitals near you.
            </p>
          </div>

          {/* Primary Quick Action Cards */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <button
              onClick={() => onNavigate('ai_chat')}
              className="flex-1 sm:flex-none flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-xl shadow-emerald-600/30 transition-all hover:scale-105"
            >
              <Bot className="w-5 h-5" />
              <div className="text-left text-xs">
                <div className="font-extrabold text-sm">Ask AI Bot</div>
                <div className="text-emerald-100 font-normal">Symptom Checker</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('hospitals')}
              className="flex-1 sm:flex-none flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-sky-600/30 transition-all hover:scale-105"
            >
              <MapPin className="w-5 h-5" />
              <div className="text-left text-xs">
                <div className="font-extrabold text-sm">Find Hospital</div>
                <div className="text-sky-100 font-normal">Live ER Map</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Appointment & Medical Profile Badge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Upcoming Appointment Widget */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-400" />
              <h2 className="text-lg font-bold text-white">Upcoming Consultation</h2>
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
                  Mode: <strong className="text-white capitalize">{activeUpcomingAppointment.type.replace('_', ' ')}</strong>
                </div>

                {activeUpcomingAppointment.type === 'video' && activeUpcomingAppointment.meetingId && (
                  <button
                    onClick={() => onJoinVideoCall(activeUpcomingAppointment.meetingId!)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Video className="w-4 h-4 animate-pulse" />
                    <span>Join Video Consultation</span>
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
                Book a Doctor
              </button>
            </div>
          )}
        </div>

        {/* Patient Medical Profile Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-bold text-white">Medical Profile</h2>
            </div>
            <button
              onClick={onOpenMedicalProfile}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              Edit
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
                {medicalProfile.importantNotes ? 'David Jenkins (Spouse)' : 'Not set'}
              </p>
              <p className="text-emerald-400 font-mono text-[11px]">+1 (555) 876-5432</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Educational First-Aid Topics Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Essential First-Aid Guides</h2>
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
                <span className="group-hover:translate-x-1 transition-transform text-rose-400">Read &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
