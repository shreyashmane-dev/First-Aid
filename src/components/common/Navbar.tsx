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
  UserCheck,
  Bell,
  LogOut,
  Sliders,
  ShieldCheck,
  User,
  Lock
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

  const hotlines = emergencyHotlineService.getHotlines();
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleTabChange('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-red-400 via-rose-300 to-emerald-400 bg-clip-text text-transparent">
                First Aid Hospital
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>AI Emergency Companion</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/60 p-1.5 rounded-2xl border border-slate-700/60">
            <button
              onClick={() => handleTabChange('home')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => handleTabChange('first_aid')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'first_aid'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>First Aid</span>
            </button>

            <button
              onClick={() => handleTabChange('ai_chat')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'ai_chat'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>AI Assistant</span>
            </button>

            <button
              onClick={() => handleTabChange('hospitals')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'hospitals'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Hospitals Map</span>
            </button>

            <button
              onClick={() => handleTabChange('doctors')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'doctors'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-indigo-400" />
              <span>Find Doctors</span>
            </button>

            <button
              onClick={() => handleTabChange('appointments')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'appointments'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Appointments</span>
            </button>

            {userRole === 'doctor' && (
              <button
                onClick={() => handleTabChange('doctor_portal')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'doctor_portal'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-emerald-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Doctor Portal</span>
              </button>
            )}

            {userRole === 'admin' && (
              <button
                onClick={() => handleTabChange('admin')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                    : 'text-amber-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Console</span>
              </button>
            )}
          </nav>

          {/* Action Buttons Right */}
          <div className="flex items-center gap-3">
            {/* Location-Aware Emergency Call */}
            <a
              href={`tel:${hotlines.primaryEmergencyNumber}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/40 animate-pulse border border-red-400/50"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>SOS {hotlines.primaryEmergencyNumber} / {hotlines.ambulanceNumber}</span>
            </a>

            {/* Privacy Controls Modal Trigger */}
            <button
              onClick={onOpenPrivacyData}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-emerald-400 transition-colors"
              title="Privacy & Data Controls"
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Quick Role Switcher */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-xl border border-slate-700 text-[11px]">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Role:</span>
              <select
                value={userRole}
                onChange={(e) => switchRoleDemo(e.target.value as any)}
                className="bg-transparent text-emerald-400 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="patient" className="bg-slate-900 text-white">Patient</option>
                <option value="doctor" className="bg-slate-900 text-white">Doctor</option>
                <option value="admin" className="bg-slate-900 text-white">Admin</option>
                <option value="medical_staff" className="bg-slate-900 text-white">Medical Staff</option>
              </select>
            </div>

            {/* Notification Bell */}
            <div className="relative cursor-pointer" onClick={() => handleTabChange('appointments')}>
              <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>

            {/* User Profile / Auth */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenMedicalProfile}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all"
                  title="Manage Medical Profile"
                >
                  <User className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-medium text-slate-200 hidden sm:inline">
                    {currentUser.displayName}
                  </span>
                </button>

                <button
                  onClick={logout}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-600/50 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
