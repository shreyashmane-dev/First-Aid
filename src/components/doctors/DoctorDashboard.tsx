import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { emergencyHotlineService } from '../../services/emergencyHotlineService';
import type { Appointment } from '../../types';
import {
  Calendar,
  Video,
  CheckCircle,
  XCircle,
  Stethoscope,
  Bot,
  MapPin,
  ShieldAlert,
  PhoneCall,
  Clock,
  FileText,
  Search,
  Activity,
  ArrowRight
} from 'lucide-react';

interface DoctorDashboardProps {
  onJoinVideoCall: (meetingId: string) => void;
  onNavigate?: (tab: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onJoinVideoCall, onNavigate }) => {
  const { doctorProfile, currentUser } = useAuth();
  const { appointments, updateAppointmentStatus, medicalProfile } = useApp();
  const { t, language } = useLanguage();

  const hotlines = emergencyHotlineService.getHotlines();

  // Tab filtering: 'all' | 'requested' | 'confirmed' | 'completed' | 'rejected'
  const [statusFilter, setStatusFilter] = useState<'all' | 'requested' | 'confirmed' | 'completed' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientModal, setSelectedPatientModal] = useState<Appointment | null>(null);
  const [clinicalNotesDraft, setClinicalNotesDraft] = useState('');

  // Doctor's appointments (match doctorId or show all platform appointments if generic doctor demo)
  const currentDocId = doctorProfile?.doctorId || 'doc_101';
  const docAppointments = appointments.filter(
    a => a.doctorId === currentDocId || a.doctorId === 'doc_101' || !doctorProfile
  );

  const pendingCount = docAppointments.filter(a => a.status === 'requested').length;
  const confirmedCount = docAppointments.filter(a => a.status === 'confirmed').length;
  const completedCount = docAppointments.filter(a => a.status === 'completed').length;

  const filteredAppointments = docAppointments.filter(apt => {
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (apt.patientCondition && apt.patientCondition.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleAcceptAppointment = (aptId: string) => {
    updateAppointmentStatus(aptId, 'confirmed');
  };

  const handleRejectAppointment = (aptId: string) => {
    const reason = window.prompt(
      language === 'mr'
        ? 'कृपया नकारण्याचे कारण प्रविष्ट करा (पर्यायी):'
        : 'Enter rejection reason for patient (optional):',
      'Doctor unavailable at requested time'
    );
    if (reason !== null) {
      updateAppointmentStatus(aptId, 'rejected', reason);
    }
  };

  const handleSaveNotes = () => {
    if (selectedPatientModal) {
      updateAppointmentStatus(selectedPatientModal.appointmentId, selectedPatientModal.status, clinicalNotesDraft);
      setSelectedPatientModal(null);
    }
  };

  return (
    <div className="space-y-10 pb-16 animate-fade-in">
      {/* 🌟 HIGH-IMPACT HERO SECTION (MATCHING PATIENT DASHBOARD DESIGN) */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-12 shadow-2xl transition-all">
        {/* Glow FX Backdrop */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 medical-grid-bg opacity-75 pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-4xl">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold backdrop-blur-md shadow-sm">
            <Stethoscope className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>
              {language === 'mr'
                ? 'डॉक्टर क्लिनिकल पोर्टल • प्रमाणित तज्ज्ञ डॉक्टर नेटवर्क'
                : 'Doctor Clinical Portal • Verified Specialist Care Network'}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {language === 'mr' ? (
              <>
                रुग्ण तपासणी आणि टेलिमेडिसिन <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent">
                  प्रत्येक रुग्णाची काळजी.
                </span>
              </>
            ) : (
              <>
                Clinical Triage & Telemedicine <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 bg-clip-text text-transparent">
                  Every Patient Matters.
                </span>
              </>
            )}
          </h1>

          {/* Doctor Info Subtitle */}
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
            {language === 'mr' ? 'स्वागत आहे' : 'Welcome back'},{' '}
            <strong className="text-slate-900 dark:text-white font-bold">
              {doctorProfile?.name || currentUser?.displayName || 'Dr. Rajesh Sharma'}
            </strong>
            . ({doctorProfile?.specialization || 'Cardiology'} • License:{' '}
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {doctorProfile?.licenseNumber || 'MH-MED-2026-9921'}
            </span>
            ).{' '}
            {language === 'mr'
              ? 'येथे आपण रुग्णांनी पाठवलेल्या भेटीच्या विनंत्या पाहू शकता, त्यांची आरोग्य स्थिती तपासून स्वीकार किंवा नकार देऊ शकता आणि थेट प्रत्यक्ष व्हिडिओ कॉल सुरू करू शकता.'
              : 'Review patient appointment requests, inspect detailed patient medical conditions, accept or decline with 1-click, and launch real encrypted video consultations directly.'}
          </p>

          {/* CTA Buttons Strip */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => {
                setStatusFilter('requested');
                const el = document.getElementById('appointments-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-2xl shadow-2xl shadow-emerald-600/40 hover:scale-105 transition-all cursor-pointer"
            >
              <Calendar className="w-5 h-5 animate-pulse" />
              <span>
                {language === 'mr'
                  ? `नवीन विनंत्या तपासा (${pendingCount})`
                  : `Review Patient Requests (${pendingCount})`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onNavigate && (
              <button
                onClick={() => onNavigate('ai_chat')}
                className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-sm rounded-2xl shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                <Bot className="w-5 h-5 text-emerald-500" />
                <span>{language === 'mr' ? 'एआय क्लिनिकल सहाय्यक' : 'AI Clinical Assistant'}</span>
              </button>
            )}

            <a
              href={`tel:${hotlines.primaryEmergencyNumber}`}
              className="flex items-center gap-2 px-5 py-4 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-2xl transition-all shadow-sm"
            >
              <PhoneCall className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-bounce" />
              <span>{t('sosEmergency')} ({hotlines.primaryEmergencyNumber})</span>
            </a>
          </div>
        </div>
      </div>

      {/* 📊 LIVE PLATFORM STATS STRIP (MATCHING PATIENT DASHBOARD 4-CARD METRIC GRID) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Appointments */}
        <div className="glass-card rounded-3xl p-5 shadow-xl flex items-center gap-4 hover:border-emerald-500/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-inner">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{docAppointments.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'mr' ? 'एकूण अपॉइंटमेंट्स' : 'Total Appointments'}
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="glass-card rounded-3xl p-5 shadow-xl flex items-center gap-4 hover:border-amber-500/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{pendingCount}</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold animate-pulse">
                  {language === 'mr' ? 'प्रलंबित' : 'Pending'}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'mr' ? 'स्वीकृतीसाठी विनंत्या' : 'Pending Requests'}
            </div>
          </div>
        </div>

        {/* Confirmed & Telemedicine Ready */}
        <div className="glass-card rounded-3xl p-5 shadow-xl flex items-center gap-4 hover:border-teal-500/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 shadow-inner">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{confirmedCount}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'mr' ? 'पुष्टी झालेले / व्हिडिओ कॉल्स' : 'Confirmed / Video Ready'}
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="glass-card rounded-3xl p-5 shadow-xl flex items-center gap-4 hover:border-indigo-500/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-inner">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {doctorProfile?.verificationStatus?.toUpperCase() || 'VERIFIED'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'mr' ? 'वैद्यकीय परवाना स्थिती' : 'License Verified (4.9 ★)'}
            </div>
          </div>
        </div>
      </div>

      {/* 📋 PATIENT APPOINTMENTS & REAL-TIME TRIAGE SECTION */}
      <div id="appointments-section" className="space-y-6">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <Calendar className="w-6 h-6 text-emerald-500" />
                <span>
                  {language === 'mr'
                    ? 'रुग्ण भेटीच्या विनंत्या आणि स्थिती'
                    : 'Patient Appointment Requests & Condition Review'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {language === 'mr'
                  ? 'रुग्णांची आरोग्य स्थिती, लक्षणे, रक्तगट आणि ऍलर्जी तपासा आणि विनंती स्वीकारा किंवा नाकारा.'
                  : 'Inspect patient condition, symptoms, vitals, allergies and accept or reject requests with real-time sync.'}
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {language === 'mr' ? 'सर्व' : 'All'} ({docAppointments.length})
              </button>

              <button
                onClick={() => setStatusFilter('requested')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === 'requested'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{language === 'mr' ? 'नवीन विनंत्या' : 'Pending Requests'}</span>
                <span className="w-5 h-5 rounded-full bg-amber-400/30 flex items-center justify-center text-[10px]">
                  {pendingCount}
                </span>
              </button>

              <button
                onClick={() => setStatusFilter('confirmed')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'confirmed'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {language === 'mr' ? 'स्वीकृत' : 'Confirmed'} ({confirmedCount})
              </button>

              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'completed'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {language === 'mr' ? 'पूर्ण' : 'Completed'} ({completedCount})
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder={
                language === 'mr'
                  ? 'रुग्णाचे नाव, लक्षणे किंवा स्थितीनुसार शोधा...'
                  : 'Search by patient name, symptom, or medical condition...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              {language === 'mr' ? 'कोणतीही विनंती सापडली नाही' : 'No Appointments Found'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {language === 'mr'
                ? 'निवडलेल्या फिल्टरसाठी सध्या कोणतीही अपॉइंटमेंट उपलब्ध नाही.'
                : 'There are currently no patient appointment requests matching this filter status.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filteredAppointments.map((apt) => {
              const isPending = apt.status === 'requested';
              const isConfirmed = apt.status === 'confirmed';
              const isVideo = apt.type === 'video';

              return (
                <div
                  key={apt.appointmentId}
                  className={`glass-card rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 transition-all border ${
                    isPending
                      ? 'border-amber-400/50 dark:border-amber-500/40 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent'
                      : isConfirmed
                      ? 'border-emerald-500/40 dark:border-emerald-500/30'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Top Row: Patient Info & Status Pill */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black flex items-center justify-center text-lg shadow-lg shadow-emerald-600/30 shrink-0">
                        {apt.patientName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            {apt.patientName}
                          </h3>
                          <span
                            className={`px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              isPending
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                : isConfirmed
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                : apt.status === 'completed'
                                ? 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-700'
                                : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                            }`}
                          >
                            {apt.status === 'requested'
                              ? language === 'mr'
                                ? 'नवीन विनंती'
                                : 'Pending Request'
                              : apt.status === 'confirmed'
                              ? language === 'mr'
                                ? 'स्वीकृत'
                                : 'Confirmed'
                              : apt.status === 'completed'
                              ? language === 'mr'
                                ? 'पूर्ण'
                                : 'Completed'
                              : apt.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span className="flex items-center gap-1 font-mono">
                            📅 {apt.appointmentDate}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            ⏰ {apt.startTime} - {apt.endTime}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                            {isVideo ? '🎥 Online Video Consultation' : '🏥 In-Person Hospital Visit'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Patient Contact Info */}
                    <div className="text-right text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                      <div className="font-mono text-slate-700 dark:text-slate-300">
                        {apt.patientPhone || '+1 (555) 234-5678'}
                      </div>
                      <div className="text-[11px] text-slate-400">{apt.hospitalName || 'Main Medical Center'}</div>
                    </div>
                  </div>

                  {/* 🩺 PATIENT CONDITION & MEDICAL DETAILS (USER SPECIFIED REQUIREMENT) */}
                  <div className="bg-slate-100/70 dark:bg-slate-900/80 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/70 dark:border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          {language === 'mr' ? 'रुग्णाची आरोग्य स्थिती आणि लक्षणे' : 'Patient Clinical Condition & Symptoms'}
                        </span>
                      </div>

                      {/* Blood Group Pill */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          {language === 'mr' ? 'रक्तगट:' : 'Blood Group:'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 font-mono font-black text-xs">
                          {apt.patientBloodGroup || medicalProfile.bloodGroup || 'O+'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Reason & Chief Complaint */}
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                          {language === 'mr' ? 'तक्रार / कारण:' : 'Chief Complaint / Reason:'}
                        </span>
                        <p className="text-slate-900 dark:text-white font-medium bg-white dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          {apt.reason || 'General Health Follow-up & Evaluation'}
                        </p>
                      </div>

                      {/* Diagnosed Conditions / Patient Notes */}
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                          {language === 'mr' ? 'माहिती असलेली स्थिती:' : 'Current Medical Condition:'}
                        </span>
                        <p className="text-slate-900 dark:text-white font-medium bg-white dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                          {apt.patientCondition || (medicalProfile.medicalConditions.join(', ') || 'Mild Asthma, Exertional Chest Tightness')}
                        </p>
                      </div>
                    </div>

                    {/* Allergies & Medications Chips */}
                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      {/* Allergies */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                          {language === 'mr' ? 'ऍलर्जी:' : 'Allergies:'}
                        </span>
                        {(apt.patientAllergies || medicalProfile.allergies).map((alg, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 text-[10px] font-semibold"
                          >
                            ⚠️ {alg}
                          </span>
                        ))}
                      </div>

                      {/* Current Medications */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                          {language === 'mr' ? 'औषधे:' : 'Medications:'}
                        </span>
                        {(apt.patientMedications || medicalProfile.medications).map((med, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 text-[10px] font-semibold"
                          >
                            💊 {med}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ACTION CONTROLS: ACCEPT / REJECT / LAUNCH VIDEO / VIEW RECORD */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => {
                        setSelectedPatientModal(apt);
                        setClinicalNotesDraft(apt.consultationNotes || '');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      <FileText className="w-4 h-4 text-indigo-500" />
                      <span>{language === 'mr' ? 'संपूर्ण वैद्यकीय नोंद पहा' : 'Full Clinical Record & Notes'}</span>
                    </button>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* PENDING CONTROLS: ACCEPT OR REJECT */}
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleRejectAppointment(apt.appointmentId)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-950/80 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm hover:scale-105"
                          >
                            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            <span>{language === 'mr' ? 'नकार द्या (Reject)' : 'Decline Request'}</span>
                          </button>

                          <button
                            onClick={() => handleAcceptAppointment(apt.appointmentId)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/30 hover:scale-105"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>{language === 'mr' ? 'स्वीकारा (Accept)' : 'Accept Appointment'}</span>
                          </button>
                        </>
                      )}

                      {/* CONFIRMED CONTROLS: LAUNCH REAL VIDEO CALL */}
                      {isVideo && apt.meetingId && (
                        <button
                          onClick={() => onJoinVideoCall(apt.meetingId!)}
                          className="flex items-center gap-2.5 px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/40 hover:scale-105 transition-all animate-pulse cursor-pointer"
                        >
                          <Video className="w-4 h-4" />
                          <span>{language === 'mr' ? 'थेट व्हिडिओ कॉल सुरू करा' : 'Launch Real Video Call'}</span>
                        </button>
                      )}

                      {isConfirmed && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.appointmentId, 'completed')}
                          className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          {language === 'mr' ? 'पूर्ण म्हणून चिन्हांकित करा' : 'Mark Completed'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 🩺 QUICK CLINICAL TOOLS (MATCHING PATIENT DASHBOARD 4-GRID QUICK TILES) */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
          <Stethoscope className="w-5 h-5 text-emerald-500" />
          <span>{language === 'mr' ? 'क्लिनिकल टूल्स आणि आपत्कालीन मार्गदर्शक' : 'Clinical Operations & Emergency Network'}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* AI Clinical Drug & Protocol Assistant */}
          <div
            onClick={() => onNavigate && onNavigate('ai_chat')}
            className="glass-card glass-card-hover rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 cursor-pointer group hover:border-emerald-500/50 transition-all"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'mr' ? 'एआय क्लिनिकल रेफरन्स' : 'AI Drug & Triage Copilot'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'mr'
                  ? 'ड्रग परस्परसंवाद आणि आपत्कालीन मार्गदर्शनासाठी Gemini + OpenAI वापरून मदत घ्या.'
                  : 'Check drug interactions, dosing guidelines, and clinical protocols instantly.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>{language === 'mr' ? 'सहाय्यक सुरू करा' : 'Open Copilot'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Hospital Network */}
          <div
            onClick={() => onNavigate && onNavigate('hospitals')}
            className="glass-card glass-card-hover rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 cursor-pointer group hover:border-sky-500/50 transition-all"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'mr' ? 'ट्रॉमा सेंटर्स आणि बेड्स' : 'ER Hospital Map & ICU'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'mr'
                  ? 'जवळपासची रुग्णालये, आयसीयू क्षमता आणि तात्काळ रुग्ण रेफरल व्यवस्थापित करा.'
                  : 'Locate 24/7 Level-1 trauma centers, ICU capacity, and coordinate patient transfers.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition-transform">
              <span>{language === 'mr' ? 'नकाशा पहा' : 'View Network'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* First Aid Emergency Library */}
          <div
            onClick={() => onNavigate && onNavigate('first_aid')}
            className="glass-card glass-card-hover rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 cursor-pointer group hover:border-amber-500/50 transition-all"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'mr' ? 'प्रमाणित प्रथमोपचार मॅन्युअल' : 'Standard First Aid Manual'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'mr'
                  ? 'सीपीआर, चोकिंग, भाजणे आणि सर्पदंश प्रोटोकॉलची वैद्यकीय मार्गदर्शक तत्त्वे.'
                  : 'Medically validated first-aid step-by-step procedures and contraindications.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>{language === 'mr' ? 'मॅन्युअल वाचा' : 'Browse Protocols'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Emergency Hotline Dispatch */}
          <a
            href={`tel:${hotlines.primaryEmergencyNumber}`}
            className="glass-card glass-card-hover rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 cursor-pointer group hover:border-rose-500/50 transition-all"
          >
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'mr' ? 'आपत्कालीन ॲम्ब्युलन्स डिस्पॅच' : 'Direct Emergency Dispatch'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'mr'
                  ? 'रुग्णासाठी थेट १०८ किंवा ११२ वर आपत्कालीन ॲम्ब्युलन्स कॉल करा.'
                  : 'Direct line to 108 / 112 emergency paramedics and rapid trauma response.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform">
              <span>{hotlines.primaryEmergencyNumber} / {hotlines.ambulanceNumber}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </a>
        </div>
      </div>

      {/* 📄 DETAILED PATIENT CLINICAL RECORD & NOTES MODAL */}
      {selectedPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 text-xs text-slate-700 dark:text-slate-300 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-lg">
                  {language === 'mr' ? 'अधिकृत वैद्यकीय नोंद:' : 'Authorized Patient Record:'} {selectedPatientModal.patientName}
                </h3>
                <p className="text-slate-400 text-xs">
                  ID: {selectedPatientModal.patientId} • Date: {selectedPatientModal.appointmentDate}
                </p>
              </div>
              <button
                onClick={() => setSelectedPatientModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Vitals & Blood Group */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px] font-bold uppercase">Blood Group</span>
                  <span className="text-base font-black text-rose-600 dark:text-rose-400 font-mono">
                    {selectedPatientModal.patientBloodGroup || medicalProfile.bloodGroup || 'O+'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-bold uppercase">Status</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono">
                    {selectedPatientModal.status}
                  </span>
                </div>
              </div>

              {/* Known Allergies */}
              <div>
                <span className="font-bold text-slate-900 dark:text-white block mb-1.5">
                  Documented Allergies:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(selectedPatientModal.patientAllergies || medicalProfile.allergies).map((a, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 rounded-xl font-bold"
                    >
                      ⚠️ {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Current Medications */}
              <div>
                <span className="font-bold text-slate-900 dark:text-white block mb-1.5">
                  Current Medications:
                </span>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  {(selectedPatientModal.patientMedications || medicalProfile.medications).join(', ') || 'None documented'}
                </div>
              </div>

              {/* Chief Reason */}
              <div>
                <span className="font-bold text-slate-900 dark:text-white block mb-1.5">
                  Chief Complaint & Reason for Visit:
                </span>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                  {selectedPatientModal.reason}
                </div>
              </div>

              {/* Doctor Consultation Notes Editor */}
              <div>
                <span className="font-bold text-slate-900 dark:text-white block mb-1.5">
                  Physician Clinical Notes & Diagnosis:
                </span>
                <textarea
                  rows={4}
                  value={clinicalNotesDraft}
                  onChange={(e) => setClinicalNotesDraft(e.target.value)}
                  placeholder="Record clinical impressions, vitals observed, prescriptions, or follow-up instructions..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedPatientModal(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedPatientModal.status === 'requested' && (
                  <button
                    onClick={() => {
                      handleAcceptAppointment(selectedPatientModal.appointmentId);
                      setSelectedPatientModal(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                  >
                    Accept Appointment
                  </button>
                )}
                <button
                  onClick={handleSaveNotes}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Save Clinical Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
