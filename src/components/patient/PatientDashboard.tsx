import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
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
  const { t, language } = useLanguage();

  const hotlines = emergencyHotlineService.getHotlines();

  const activeUpcomingAppointment = appointments.find(
    a => a.status === 'confirmed' || a.status === 'requested'
  );

  return (
    <div className="space-y-10 pb-16">
      {/* 🌟 CLINICAL WELCOME HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm dark:shadow-2xl transition-all">
        <div className="absolute inset-0 medical-grid-bg opacity-70 pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-4xl">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>
              {language === 'mr'
                ? 'आपत्कालीन वैद्यकीय सेवा आणि रुग्णालय नेटवर्क'
                : 'Emergency Care & Hospital Discovery Network'}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {language === 'mr' ? (
              <>
                तात्काळ वैद्यकीय मार्गदर्शन <br className="hidden sm:inline" />
                <span className="text-rose-600 dark:text-rose-400">प्रत्येक सेकंद महत्त्वाचा असतो.</span>
              </>
            ) : (
              <>
                Clinical Medical Care & Triage <br className="hidden sm:inline" />
                <span className="text-rose-600 dark:text-rose-400">When Seconds Count.</span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            {t('welcomeBack')}{' '}
            <strong className="text-slate-900 dark:text-white font-bold">{currentUser?.displayName || 'Patient'}</strong>.{' '}
            {language === 'mr'
              ? 'फर्स्ट एड हॉस्पिटल आपल्याला दुहेरी एआय आणीबाणी तपासणी (Gemini + OpenAI), परस्पर नकाशावर जवळपासची रुग्णालये, तज्ज्ञ डॉक्टर आणि सुरक्षित व्हिडिओ कन्सल्टेशन प्रदान करते.'
              : 'Connect to verified first-aid guidance, GPS hospital discovery, certified specialist doctor consultations, and secure telemedicine video suites.'}
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('ai_chat')}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>{t('askAiAssistant')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('hospitals')}
              className="flex items-center gap-2 px-5 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>{t('findHospitalNearby')}</span>
            </button>

            <a
              href={`tel:${hotlines.primaryEmergencyNumber}`}
              className="flex items-center gap-2 px-4 py-3.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              <span>{t('sosEmergency')} ({hotlines.primaryEmergencyNumber})</span>
            </a>
          </div>
        </div>
      </div>

      {/* 📊 LIVE PLATFORM STATS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">100+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'mr' ? 'प्रमाणित आपत्कालीन रुग्णालये' : 'Verified ER Hospitals'}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">50+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'mr' ? 'तज्ज्ञ डॉक्टर' : 'Specialist Doctors'}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">&lt; 2s</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'mr' ? 'एआय तपासणी गती' : 'AI Triage Speed'}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">24 / 7</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'mr' ? 'आपत्कालीन मॉनिटरिंग' : 'Emergency Monitoring'}
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 QUICK AI PROMPT SUGGESTIONS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              {language === 'mr' ? 'त्वरित एआय आणीबाणी सूचना व प्रश्न' : 'Instant AI Emergency Safety Prompts'}
            </span>
          </h3>
          <span className="text-xs text-slate-400">
            {language === 'mr' ? 'विचारण्यासाठी क्लिक करा' : 'Click any prompt to ask'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {(language === 'mr' ? [
            '🐍 विषारी साप चावल्यावर तात्काळ प्रथमोपचार काय करावेत?',
            '❤️ बेशुद्ध व्यक्तीवर सीपीआर (CPR) कसा करावा?',
            '🔥 हाताला भाजल्यावर काय उपचार करावेत?',
            '🌬️ दम्याचा झटका आल्यावर काय प्रथमोपचार करावेत?'
          ] : [
            '🐍 What is the immediate first-aid for a venomous snake bite?',
            '❤️ How do I perform CPR compressions on an unconscious person?',
            '🔥 How to treat a 2nd degree burn on hands?',
            '🌬️ What are the steps for acute asthma attack breathlessness?'
          ]).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate('ai_chat')}
              className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all font-medium text-left cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* 🏥 UPCOMING APPOINTMENT & MEDICAL BACKGROUND ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Upcoming Appointment Widget */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('myActiveAppointments')}</h2>
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              {language === 'mr' ? 'सर्व पहा' : 'View All'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {activeUpcomingAppointment ? (
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-lg border border-slate-200 dark:border-slate-600 shadow-sm">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{activeUpcomingAppointment.doctorName}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{activeUpcomingAppointment.doctorSpecialization}</p>
                    <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-0.5">{activeUpcomingAppointment.hospitalName}</p>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    {activeUpcomingAppointment.status === 'confirmed' ? t('confirmed') : activeUpcomingAppointment.status.toUpperCase()}
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                    📅 {activeUpcomingAppointment.appointmentDate} at {activeUpcomingAppointment.startTime}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'mr' ? 'सल्ला प्रकार:' : 'Consultation Mode:'}{' '}
                  <strong className="text-slate-900 dark:text-white capitalize">{activeUpcomingAppointment.type.replace('_', ' ')}</strong>
                </div>

                {activeUpcomingAppointment.type === 'video' && activeUpcomingAppointment.meetingId && (
                  <button
                    onClick={() => onJoinVideoCall(activeUpcomingAppointment.meetingId!)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>{t('joinVideoCall')}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-6 text-center border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
              <p className="text-slate-500 dark:text-slate-400 text-xs">{t('noActiveAppointments')}</p>
              <button
                onClick={() => onNavigate('doctors')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                {t('bookSpecialist')}
              </button>
            </div>
          )}
        </div>

        {/* Patient Medical Background & Privacy Badge */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-600 dark:text-rose-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{t('medicalProfileSummary')}</h2>
            </div>
            <button
              onClick={onOpenMedicalProfile}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer"
            >
              {t('viewEditProfile')}
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">{t('bloodGroup')}</span>
              <span className="px-2.5 py-0.5 bg-red-50 dark:bg-red-600/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/40 rounded-lg font-black text-sm">
                {medicalProfile.bloodGroup}
              </span>
            </div>

            <div>
              <span className="text-slate-500 dark:text-slate-400 block mb-1">{t('knownAllergies')}:</span>
              <div className="flex flex-wrap gap-1.5">
                {medicalProfile.allergies.length > 0 ? (
                  medicalProfile.allergies.map((allergy, i) => (
                    <span key={i} className="px-2 py-0.5 bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 rounded-md text-[11px] font-semibold">
                      ⚠️ {allergy}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 italic">{language === 'mr' ? 'काहीही नाही' : 'None listed'}</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-500 dark:text-slate-400 block mb-1">{t('emergencyContactName')}:</span>
              <p className="text-slate-900 dark:text-white font-medium">
                {medicalProfile.importantNotes ? 'Primary Contact' : 'Emergency Contact'}
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">+91 98765 43210</p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Lock className="w-3.5 h-3.5" /> HIPAA Encrypted
              </span>
              <span>{language === 'mr' ? 'सुरक्षित प्रवेश' : 'Controlled Access'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 📚 ESSENTIAL FIRST AID GUIDES GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('verifiedGuides')}</h2>
          </div>
          <button
            onClick={() => onNavigate('first_aid')}
            className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            {language === 'mr' ? `सर्व ${firstAidArticles.length} मार्गदर्शिका पहा` : `Browse All ${firstAidArticles.length} Guides`} <ChevronRight className="w-4 h-4" />
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
              className="bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 cursor-pointer transition-all shadow-sm group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400">
                    {article.articleId === 'fa_cpr' && <HeartPulse className="w-5 h-5" />}
                    {article.articleId === 'fa_snake_bite' && <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                    {article.articleId === 'fa_heart_attack' && <Activity className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
                    {article.articleId === 'fa_burns' && <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
                    {article.articleId === 'fa_asthma' && <Wind className="w-5 h-5 text-sky-600 dark:text-sky-400" />}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    article.emergencyLevel === 'Critical' ? 'bg-red-50 dark:bg-red-600/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/40' : 'bg-amber-50 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40'
                  }`}>
                    {article.emergencyLevel}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-1">
                  {article.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 leading-normal">
                  {article.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                  <UserCheck className="w-3.5 h-3.5" /> {language === 'mr' ? 'तपासलेले' : 'Reviewed'}
                </span>
                <span className="group-hover:translate-x-1 transition-transform text-rose-600 dark:text-rose-400 font-bold">
                  {language === 'mr' ? 'वाचा' : 'Read'} &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
