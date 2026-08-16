import React, { useState } from 'react';
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
  UserCheck,
  LogOut,
  Sliders,
  ShieldCheck,
  User,
  Lock,
  Menu,
  X,
  PhoneCall
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const hotlines = emergencyHotlineService.getHotlines();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  const navItems = [
    {
      group: 'Core Services',
      items: [
        { id: 'home', label: 'Home & Triage', icon: HeartPulse, badge: null, color: 'text-rose-400' },
        { id: 'first_aid', label: 'First Aid Guides', icon: ShieldAlert, badge: 'Verified', color: 'text-amber-400' },
        { id: 'ai_chat', label: 'AI Emergency Assistant', icon: Bot, badge: '24/7 AI', color: 'text-emerald-400' }
      ]
    },
    {
      group: 'Clinical Network',
      items: [
        { id: 'hospitals', label: 'Nearby Hospitals Map', icon: MapPin, badge: 'Leaflet', color: 'text-sky-400' },
        { id: 'doctors', label: 'Find Specialist Doctors', icon: Stethoscope, badge: null, color: 'text-indigo-400' },
        { id: 'appointments', label: 'Appointments & Consults', icon: Calendar, badge: unreadCount > 0 ? `${unreadCount}` : null, color: 'text-purple-400' }
      ]
    }
  ];

  if (userRole === 'doctor') {
    navItems.push({
      group: 'Professional',
      items: [
        { id: 'doctor_portal', label: 'Doctor Clinical Portal', icon: UserCheck, badge: 'Doctor', color: 'text-emerald-300' }
      ]
    });
  }

  if (userRole === 'admin') {
    navItems.push({
      group: 'System Operations',
      items: [
        { id: 'admin', label: 'Admin Operations Console', icon: ShieldCheck, badge: 'Admin', color: 'text-amber-300' }
      ]
    });
  }

  return (
    <>
      {/* 📱 MOBILE TOP BAR (Visible on small screens) */}
      <header className="lg:hidden sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between text-white shadow-xl">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabChange('home')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-emerald-500 flex items-center justify-center shadow-lg">
            <HeartPulse className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-base font-extrabold bg-gradient-to-r from-red-400 via-rose-300 to-emerald-400 bg-clip-text text-transparent">
              First Aid Hospital
            </span>
            <span className="block text-[10px] text-slate-400">PWA Emergency App</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${hotlines.primaryEmergencyNumber}`}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl animate-pulse"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>SOS {hotlines.primaryEmergencyNumber}</span>
          </a>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 🖥️ VERTICAL LEFT SIDEBAR (Desktop Fixed, Mobile Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 text-white flex flex-col justify-between transition-transform duration-300 shadow-2xl ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Sidebar Header */}
        <div className="p-6 border-b border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTabChange('home')}>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-red-600/30">
                <HeartPulse className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-black bg-gradient-to-r from-red-400 via-rose-300 to-emerald-400 bg-clip-text text-transparent">
                  First Aid Hospital
                </h1>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>PWA Emergency App</span>
                </div>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Location Hotline Call Ribbon */}
          <a
            href={`tel:${hotlines.primaryEmergencyNumber}`}
            className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-red-600/90 to-rose-600/90 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/30 transition-all border border-red-400/40"
          >
            <div className="flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <div className="text-left text-xs">
                <div className="font-extrabold">SOS Emergency Call</div>
                <div className="text-[10px] text-red-100 font-mono">{hotlines.primaryEmergencyNumber} / {hotlines.ambulanceNumber}</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-mono font-bold uppercase">24/7</span>
          </a>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-none">
          {navItems.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider px-3">
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
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all border ${
                        isActive
                          ? 'bg-gradient-to-r from-rose-600 to-red-600 border-rose-500 text-white shadow-lg shadow-rose-600/30'
                          : 'bg-slate-900 border-transparent text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
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

          {/* Quick Privacy & Demo Role Switcher */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider px-3">
              Settings & Privacy
            </span>

            <button
              onClick={onOpenPrivacyData}
              className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-2xl border border-slate-700 text-xs font-bold text-slate-300 hover:text-emerald-400 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Privacy & HIPAA Export</span>
              </div>
              <ChevronRightIcon className="w-4 h-4 text-slate-500" />
            </button>

            <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Sliders className="w-3.5 h-3.5" />
                <span>Role:</span>
              </div>
              <select
                value={userRole}
                onChange={(e) => switchRoleDemo(e.target.value as any)}
                className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer"
              >
                <option value="patient" className="bg-slate-900 text-white">Patient</option>
                <option value="doctor" className="bg-slate-900 text-white">Doctor</option>
                <option value="admin" className="bg-slate-900 text-white">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bottom Sidebar User Account Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          {currentUser ? (
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={onOpenMedicalProfile}
                className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-800 text-left transition-colors flex-1 overflow-hidden"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0 font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-white truncate">{currentUser.displayName}</div>
                  <div className="text-[10px] text-slate-400 capitalize truncate">{userRole} Account</div>
                </div>
              </button>

              <button
                onClick={logout}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-600/50 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-all shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>Sign In / Register</span>
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
