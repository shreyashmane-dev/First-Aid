import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { EmergencyBanner } from './components/common/EmergencyBanner';
import { Footer } from './components/common/Footer';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { MedicalProfileModal } from './components/patient/MedicalProfileModal';
import { FirstAidLibrary } from './components/firstAid/FirstAidLibrary';
import { AIAssistant } from './components/ai/AIAssistant';
import { HospitalMap } from './components/hospitals/HospitalMap';
import { HospitalDetailModal } from './components/hospitals/HospitalDetailModal';
import { DoctorDirectory } from './components/doctors/DoctorDirectory';
import { AppointmentBookingModal } from './components/doctors/AppointmentBookingModal';
import { DoctorDashboard } from './components/doctors/DoctorDashboard';
import { VideoConsultationRoom } from './components/telemedicine/VideoConsultationRoom';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';
import { PrivacyDataModal } from './components/patient/PrivacyDataModal';
import type { DoctorProfile, Hospital } from './types';
import confetti from 'canvas-confetti';
import { Calendar, Video, Stethoscope } from 'lucide-react';

const MainContent: React.FC = () => {
  const { doctors, appointments } = useApp();

  const [activeTab, setActiveTab] = useState<string>('home');

  // Selected states for modals
  const [isMedicalProfileOpen, setIsMedicalProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPrivacyDataOpen, setIsPrivacyDataOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<DoctorProfile | null>(null);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [activeVideoMeetingId, setActiveVideoMeetingId] = useState<string | null>(null);

  const handleBookingSuccess = () => {
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    setActiveTab('appointments');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
      {/* Vertical Left Navbar Sidebar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenMedicalProfile={() => setIsMedicalProfileOpen(true)}
        onOpenPrivacyData={() => setIsPrivacyDataOpen(true)}
      />

      {/* Main View Area (Offset by left sidebar on desktop lg:pl-72) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Top Emergency Advisory Alert */}
        <EmergencyBanner onFindHospitals={() => setActiveTab('hospitals')} />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {activeTab === 'home' && (
          <PatientDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenMedicalProfile={() => setIsMedicalProfileOpen(true)}
            onSelectArticle={(articleId) => {
              setActiveArticleId(articleId);
              setActiveTab('first_aid');
            }}
            onJoinVideoCall={(meetingId) => setActiveVideoMeetingId(meetingId)}
          />
        )}

        {activeTab === 'first_aid' && (
          <FirstAidLibrary
            onFindHospitals={() => setActiveTab('hospitals')}
            selectedArticleId={activeArticleId}
          />
        )}

        {activeTab === 'ai_chat' && (
          <AIAssistant
            onFindHospitals={() => setActiveTab('hospitals')}
            onReadFirstAid={(articleId) => {
              setActiveArticleId(articleId || 'fa_cpr');
              setActiveTab('first_aid');
            }}
          />
        )}

        {activeTab === 'hospitals' && (
          <HospitalMap
            onSelectHospital={(hosp) => setSelectedHospital(hosp)}
          />
        )}

        {activeTab === 'doctors' && (
          <DoctorDirectory
            onSelectDoctor={(doc) => setSelectedDoctorForBooking(doc)}
          />
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-6 pb-12">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-6 h-6 text-rose-400" />
                <span>My Appointments History & Video Calls</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Track confirmed hospital appointments and join scheduled telemedicine video consultations.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {appointments.map((apt) => (
                <div
                  key={apt.appointmentId}
                  className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{apt.doctorName}</h3>
                      <p className="text-xs text-indigo-400 font-semibold">{apt.doctorSpecialization}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        📅 {apt.appointmentDate} at {apt.startTime} • {apt.hospitalName}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      apt.status === 'confirmed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : apt.status === 'completed'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {apt.status}
                    </span>

                    {apt.type === 'video' && apt.meetingId && (
                      <button
                        onClick={() => setActiveVideoMeetingId(apt.meetingId!)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition-all animate-pulse"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Call</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'doctor_portal' && (
          <DoctorDashboard
            onJoinVideoCall={(meetingId) => setActiveVideoMeetingId(meetingId)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Modals & Telemedicine Tele-room */}
      <MedicalProfileModal
        isOpen={isMedicalProfileOpen}
        onClose={() => setIsMedicalProfileOpen(false)}
      />

      <HospitalDetailModal
        hospital={selectedHospital}
        doctors={doctors}
        onClose={() => setSelectedHospital(null)}
        onBookDoctor={(doc) => setSelectedDoctorForBooking(doc)}
      />

      <AppointmentBookingModal
        doctor={selectedDoctorForBooking}
        onClose={() => setSelectedDoctorForBooking(null)}
        onSuccess={handleBookingSuccess}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <PrivacyDataModal
        isOpen={isPrivacyDataOpen}
        onClose={() => setIsPrivacyDataOpen(false)}
      />

      {activeVideoMeetingId && (
        <VideoConsultationRoom
          meetingId={activeVideoMeetingId}
          onEndCall={() => setActiveVideoMeetingId(null)}
        />
      )}
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
