import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { emergencyHotlineService } from '../../services/emergencyHotlineService';
import { ThemeToggle } from './ThemeToggle';
import {
  HeartPulse,
  ShieldAlert,
  Bot,
  MapPin,
  Stethoscope,
  Calendar,
  UserCheck,
  LogOut,
  Sliders,
  ShieldCheck,
  User,
  Lock,
  Menu,
  X,
  PhoneCall,
  Globe,
  SunMoon
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenMedicalProfile: () => void;
  onOpenPrivacyData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
  onOpenMedicalProfile,
  onOpenPrivacyData
}) => {
  const { currentUser, userRole, logout, switchRoleDemo } = useAuth();
  const { notifications } = useApp();
  const { language, setLanguage, t } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const hotlines = emergencyHotlineService.getHotlines();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const navItems = [
    {
      group: t('coreServices'),
      items: [
        { id: 'home', label: t('homeTriage'), icon: HeartPulse, badge: null, color: 'text-rose-500 dark:text-rose-400' },
        { id: 'first_aid', label: t('firstAidGuides'), icon: ShieldAlert, badge: language === 'mr' ? 'प्रमाणित' : 'Verified', color: 'text-amber-600 dark:text-amber-400' },
        { id: 'ai_chat', label: t('aiEmergencyAssistant'), icon: Bot, badge: '24/7 AI', color: 'text-emerald-600 dark:text-emerald-400' }
      ]
    },
    {
      group: t('clinicalNetwork'),
      items: [
        { id: 'hospitals', label: t('nearbyHospitalsMap'), icon: MapPin, badge: 'Leaflet', color: 'text-sky-600 dark:text-sky-400' },
        { id: 'doctors', label: t('findSpecialistDoctors'), icon: Stethoscope, badge: null, color: 'text-indigo-600 dark:text-indigo-400' },
        { id: 'appointments', label: t('appointmentsConsults'), icon: Calendar, badge: unreadCount > 0 ? `${unreadCount}` : null, color: 'text-purple-600 dark:text-purple-400' }
      ]
    }
  ];

  if (userRole === 'doctor') {
    navItems.push({
      group: t('professional'),
      items: [
        { id: 'doctor_portal', label: t('doctorClinicalPortal'), icon: UserCheck, badge: language === 'mr' ? 'डॉक्टर' : 'Doctor', color: 'text-emerald-600 dark:text-emerald-300' }
      ]
    });
  }

  if (userRole === 'admin') {
    navItems.push({
      group: t('systemOperations'),
      items: [
        { id: 'admin', label: t('adminOperationsConsole'), icon: ShieldCheck, badge: language === 'mr' ? 'प्रशासक' : 'Admin', color: 'text-amber-600 dark:text-amber-300' }
      ]
    });
  }

  return (
    <>
      {/* 📱 MOBILE TOP BAR (Visible on small screens) */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between text-slate-800 dark:text-white shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabChange('home')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-600/20">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              {t('appName')}
            </span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">{t('pwaApp')}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Theme Toggle on Mobile */}
          <ThemeToggle variant="compact" />

          {/* Quick Language Toggle Pill on Mobile */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'mr' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-200 text-xs font-bold rounded-xl transition-all"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>{language === 'en' ? 'EN' : 'मराठी'}</span>
          </button>

          <a
            href={`tel:${hotlines.primaryEmergencyNumber}`}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-sm"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>SOS</span>
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 🖥️ VERTICAL LEFT SIDEBAR (Desktop Fixed, Mobile Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white flex flex-col justify-between transition-all duration-300 shadow-lg dark:shadow-2xl ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Sidebar Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabChange('home')}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-600/20">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  {t('appName')}
                </h1>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Clinical Portal</span>
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Location Hotline Call Ribbon */}
          <a
            href={`tel:${hotlines.primaryEmergencyNumber}`}
            className="flex items-center justify-between p-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition-all border border-red-500/40"
          >
            <div className="flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 text-white" />
              <div className="text-left text-xs">
                <div className="font-extrabold">{t('sosEmergencyCall')}</div>
                <div className="text-[10px] text-red-100 font-mono">{hotlines.primaryEmergencyNumber} / {hotlines.ambulanceNumber}</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-mono font-bold uppercase">{t('available247')}</span>
          </a>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-none">
          {navItems.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider px-3">
                {section.group}
              </span>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isActive
                          ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 shadow-sm'
                          : 'bg-transparent border-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-rose-600 dark:text-rose-400' : item.color}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Theme, Language, Privacy & Demo Role Switcher */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider px-3">
              {t('settingsAndPrivacy')}
            </span>

            {/* 🎨 THEME TOGGLE SWITCHER */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold">
                <div className="flex items-center gap-2">
                  <SunMoon className="w-4 h-4 text-amber-500 dark:text-sky-400" />
                  <span>Theme:</span>
                </div>
              </div>
              <ThemeToggle variant="segmented" />
            </div>

            {/* 🌐 LANGUAGE TOGGLE */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-bold">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{t('language')}:</span>
                </div>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-300 uppercase font-mono font-bold">
                  {language === 'en' ? 'EN' : 'MR'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-900/90 rounded-xl border border-slate-300/80 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === 'en'
                      ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-sm border border-slate-200 dark:border-transparent'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('mr')}
                  className={`py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === 'mr'
                      ? 'bg-white dark:bg-rose-600 text-rose-700 dark:text-white shadow-sm border border-slate-200 dark:border-transparent'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  मराठी
                </button>
              </div>
            </div>

            <button
              onClick={onOpenPrivacyData}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('privacyHipaa')}</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-400" />
            </button>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                <Sliders className="w-3.5 h-3.5" />
                <span>{t('role')}</span>
              </div>
              <select
                value={userRole}
                onChange={(e) => switchRoleDemo(e.target.value as any)}
                className="bg-transparent text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none cursor-pointer"
              >
                <option value="patient" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('patient')}</option>
                <option value="doctor" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('doctor')}</option>
                <option value="admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t('admin')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Sidebar User Account Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
          {currentUser ? (
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={onOpenMedicalProfile}
                className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-left transition-colors flex-1 overflow-hidden cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.displayName}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize truncate">
                    {userRole === 'doctor' ? t('doctorAccount') : userRole === 'admin' ? t('adminAccount') : t('patientAccount')}
                  </div>
                </div>
              </button>

              <button
                onClick={logout}
                className="w-9 h-9 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-slate-300 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-600/50 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all shrink-0 cursor-pointer"
                title={t('signOut')}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>{t('signInRegister')}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
