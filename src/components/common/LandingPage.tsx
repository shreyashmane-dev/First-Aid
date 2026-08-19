import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
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
  Lock,
  Sparkles,
  Zap,
  HeartPulse
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
  const { language } = useLanguage();
  const hotlines = emergencyHotlineService.getHotlines();

  return (
    <div className="space-y-12 pb-16 animate-fade-in">
      {/* 🌟 HIGH-IMPACT HERO BANNER WITH AMBIENT GLOW & GLASSMORPHISM */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-14 transition-all">
        {/* Glow FX and Mesh */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-gradient-to-br from-rose-500/20 to-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-16 w-96 h-96 bg-gradient-to-tr from-emerald-500/15 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 medical-grid-bg opacity-80 pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-3xl">
          {/* Clinical Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 text-xs font-extrabold tracking-wide backdrop-blur-md shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span>
              {language === 'mr'
                ? '२४/७ प्रमाणित आपत्कालीन क्लिनिकल ट्रायज सिस्टीम'
                : '24/7 Certified Clinical Emergency & Triage System'}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
            {language === 'mr' ? (
              <>
                तात्काळ प्रथमोपचार व मदत <br />
                <span className="bg-gradient-to-r from-red-500 via-rose-500 to-emerald-500 bg-clip-text text-transparent">
                  प्रत्येक सेकंद महत्त्वाचा असतो.
                </span>
              </>
            ) : (
              <>
                Immediate First-Aid <br />
                <span className="bg-gradient-to-r from-red-500 via-rose-500 to-emerald-500 bg-clip-text text-transparent">
                  When Every Second Counts.
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            {language === 'mr'
              ? 'फर्स्ट एड हॉस्पिटल आपत्कालीन परिस्थितीत वैद्यकीय भीती दूर करते. त्वरित एआय ट्रायज, नकाशावर २४/७ रुग्णालये, तज्ज्ञ डॉक्टर आणि सुरक्षित टेलिमेडिसिन व्हिडिओ कन्सल्टेशन मिळवा.'
              : 'First Aid Hospital reduces medical panic during acute crises. Access certified emergency triage guides, interactive Leaflet hospital GPS maps, verified specialist consultations, and encrypted telemedicine video suites.'}
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-rose-600/30 hover:scale-105 transition-all cursor-pointer"
            >
              <span>{language === 'mr' ? 'सुरू करा / खाते तयार करा' : 'Get Started / Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreAI}
              className="flex items-center gap-2 px-5 py-3.5 bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:scale-105 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-emerald-500" />
              <span>{language === 'mr' ? 'एआय ट्रायज सहाय्यक' : 'AI Triage Assistant'}</span>
            </button>

            <a
              href={`tel:${hotlines.primaryEmergencyNumber}`}
              className="flex items-center gap-2 px-4 py-3.5 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-2xl transition-all shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-bounce" />
              <span>SOS {hotlines.primaryEmergencyNumber}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 📊 PLATFORM STATISTICS BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 space-y-1 hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">100+</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/60">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {language === 'mr' ? 'प्रमाणित २४/७ आपत्कालीन रुग्णालये' : 'Verified 24/7 ER Hospitals'}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-1 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">50+</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {language === 'mr' ? 'तज्ज्ञ व प्रमाणित डॉक्टर' : 'Board-Certified Specialists'}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-1 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">&lt; 2s</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {language === 'mr' ? 'एआय ट्रायज प्रतिसाद गती' : 'AI Emergency Triage Speed'}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-1 hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">24 / 7</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {language === 'mr' ? 'सतत आपत्कालीन मॉनिटरिंग' : 'Continuous Active Monitoring'}
          </p>
        </div>
      </div>

      {/* 🚀 CORE FEATURE SHOWCASE GRID */}
      <div className="space-y-6">
        <div className="text-left sm:text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-800/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'सर्वसमावेशक आरोग्य सेवा' : 'Comprehensive Healthcare Suite'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {language === 'mr' ? 'एकात्मिक आपत्कालीन वैद्यकीय परिसंस्था' : 'Integrated Emergency Medical Ecosystem'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {language === 'mr'
              ? 'रुग्ण, तज्ज्ञ डॉक्टर आणि आपत्कालीन रुग्णालयांना जोडण्यासाठी तयार केलेली प्रगत प्रणाली.'
              : 'Designed to connect patients, verified physicians, and emergency hospital facilities seamlessly.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <div className="glass-card glass-card-hover rounded-3xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'mr' ? 'एआय क्लिनिकल ट्रायज सहाय्यक' : 'AI Clinical Triage Assistant'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'mr'
                ? 'त्वरित लक्षणांचे विश्लेषण, आणीबाणी गंभीरता पातळी आणि प्रथमोपचाराच्या पायऱ्या (Gemini आणि OpenAI द्वारे).'
                : 'Provides immediate symptom assessment, urgency severity grading, and step-by-step emergency instructions for acute events.'}
            </p>
            <button
              onClick={onExploreAI}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'mr' ? 'एआय ट्रायज सुरू करा' : 'Launch AI Triage'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 2 */}
          <div className="glass-card glass-card-hover rounded-3xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-inner">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'mr' ? 'रुग्णालय व आपत्कालीन नकाशा' : 'Hospital & ER Locator'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'mr'
                ? 'परस्पर नकाशावर १-क्लिक त्रिज्येनुसार (५ किमी - १०० किमी) जवळची रुग्णालये, अंतर आणि आयसीयू सुविधा शोधा.'
                : 'Interactive Leaflet maps with 1-click radius filters (5km - 100km), GPS distance calculation, and emergency facility capabilities.'}
            </p>
            <button
              onClick={onExploreHospitals}
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'mr' ? 'नकाशा पहा' : 'Explore ER Map'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 3 */}
          <div className="glass-card glass-card-hover rounded-3xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'mr' ? 'तज्ज्ञ डॉक्टर व अपॉइंटमेंट्स' : 'Doctor Directory & Scheduling'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'mr'
                ? 'हृदयरोगतज्ज्ञ, बालरोगतज्ज्ञ आणि सामान्य डॉक्टरांची प्रोफाईल तपासा आणि थेट अपॉइंटमेंट बुक करा.'
                : 'Find and book consultations with board-certified physicians, cardiologists, toxicologists, and general practitioners.'}
            </p>
            <button
              onClick={onOpenAuth}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'mr' ? 'डॉक्टर शोधा' : 'Find Specialists'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 4 */}
          <div className="glass-card glass-card-hover rounded-3xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'mr' ? 'टेलिमेडिसिन व्हिडिओ सल्ला' : 'Telemedicine Consultations'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'mr'
                ? 'घरबसल्या डॉक्टरांशी थेट आणि सुरक्षित WebRTC व्हिडिओ/ऑडिओ सल्लामसलत करा.'
                : 'Encrypted WebRTC audio/video consultations for follow-ups, remote triage, and medication advisory sessions.'}
            </p>
            <button
              onClick={onOpenAuth}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'mr' ? 'टेलिहेल्थ सुट' : 'Telehealth Suite'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 5 */}
          <div className="glass-card glass-card-hover rounded-3xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'mr' ? 'प्रथमोपचार मार्गदर्शिका' : 'First-Aid Guide Protocols'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'mr'
                ? 'सीपीआर, साप चावणे, हृदयविकार, गुदमरणे आणि भाजल्यावरील सविस्तर प्रमाणित मार्गदर्शिका.'
                : 'Step-by-step clinical guides for CPR, snake bites, cardiac emergencies, choking, thermal burns, and shock treatment.'}
            </p>
            <button
              onClick={onExploreFirstAid}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'mr' ? 'मार्गदर्शिका वाचा' : 'Read Guides'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feature 6 */}
          <div className="glass-card glass-card-hover rounded-3xl p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {language === 'mr' ? 'HIPAA डेटा गोपनीयता व सुरक्षा' : 'HIPAA & Privacy Standards'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {language === 'mr'
                ? 'आपला वैद्यकीय डेटा पूर्णपणे सुरक्षित, एनक्रिप्टेड आणि आपल्या नियंत्रणात असतो.'
                : 'Patient data isolation, authenticated access guards, and full JSON health data export capabilities.'}
            </p>
            <button
              onClick={onOpenAuth}
              className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'mr' ? 'सुरक्षा तपशील' : 'Security Details'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 🔐 BOTTOM CTA BOX */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-red-600 via-rose-500 to-emerald-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-rose-500/20">
          <HeartPulse className="w-8 h-8 animate-pulse" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          {language === 'mr' ? '२४/७ आपत्कालीन आरोग्य सेवेसाठी सज्ज व्हा' : 'Ready for 24/7 Clinical Emergency Healthcare?'}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          {language === 'mr'
            ? 'आपली वैयक्तिक वैद्यकीय प्रोफाईल तयार करा किंवा वैद्यकीय प्रदाता म्हणून काही मिनिटांत नोंदणी करा.'
            : 'Create your personal medical emergency profile or register as a medical provider in just minutes.'}
        </p>
        <button
          onClick={onOpenAuth}
          className="px-8 py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-rose-600/30 hover:scale-105 transition-all cursor-pointer"
        >
          {language === 'mr' ? 'साइन इन / नोंदणी करा' : 'Sign Up / Sign In Now'}
        </button>
      </div>
    </div>
  );
};
