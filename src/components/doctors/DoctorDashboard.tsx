import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import type { Appointment } from '../../types';
import {
  Calendar,
  Video,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react';

interface DoctorDashboardProps {
  onJoinVideoCall: (meetingId: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ onJoinVideoCall }) => {
  const { doctorProfile } = useAuth();
  const { appointments, updateAppointmentStatus, medicalProfile } = useApp();

  const [selectedPatientModal, setSelectedPatientModal] = useState<Appointment | null>(null);

  const docAppointments = appointments.filter(a => a.doctorId === doctorProfile?.doctorId || true);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={doctorProfile?.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'}
              alt={doctorProfile?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{doctorProfile?.name || 'Dr. Rajesh Sharma'}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  doctorProfile?.verificationStatus === 'verified'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {doctorProfile?.verificationStatus?.toUpperCase() || 'VERIFIED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {doctorProfile?.specialization} • License No: <span className="font-mono text-emerald-300">{doctorProfile?.licenseNumber}</span>
              </p>
              <p className="text-[11px] text-slate-400">{doctorProfile?.hospitalName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-3 rounded-2xl border border-slate-700 text-xs">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-slate-400 block text-[10px]">Today's Appointments:</span>
              <span className="text-white font-bold text-sm">{docAppointments.length} Booked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Requests & Schedule */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-rose-400" />
          <span>Patient Appointment Requests & Telemedicine Schedule</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {docAppointments.map((apt) => (
            <div
              key={apt.appointmentId}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-400 font-bold">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{apt.patientName}</h3>
                    <p className="text-xs text-slate-400">Reason: {apt.reason}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      📅 {apt.appointmentDate} • ⏰ {apt.startTime} - {apt.endTime}
                    </p>
                  </div>
                </div>

                {/* Status & Mode */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    apt.status === 'confirmed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : apt.status === 'requested'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {apt.status}
                  </span>

                  <button
                    onClick={() => setSelectedPatientModal(apt)}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    View Authorized Record
                  </button>

                  {apt.type === 'video' && apt.meetingId && apt.status === 'confirmed' && (
                    <button
                      onClick={() => onJoinVideoCall(apt.meetingId!)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all animate-pulse"
                    >
                      <Video className="w-4 h-4" />
                      <span>Launch Video Call</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Accept / Reject controls for pending requests */}
              {apt.status === 'requested' && (
                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    onClick={() => updateAppointmentStatus(apt.appointmentId, 'rejected')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-600/40 text-xs font-bold rounded-xl transition-all"
                  >
                    <XCircle className="w-4 h-4" /> Decline
                  </button>
                  <button
                    onClick={() => updateAppointmentStatus(apt.appointmentId, 'confirmed')}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                  >
                    <CheckCircle className="w-4 h-4" /> Accept Appointment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Patient Medical Record Authorized View Modal */}
      {selectedPatientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 text-xs text-slate-300 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Authorized Medical Context for {selectedPatientModal.patientName}</h3>
              <button
                onClick={() => setSelectedPatientModal(null)}
                className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Blood Group:</span>
                <span className="px-2.5 py-0.5 bg-red-600/20 text-red-400 font-extrabold border border-red-500/40 rounded-lg">
                  {medicalProfile.bloodGroup}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Known Allergies:</span>
                <div className="flex flex-wrap gap-1.5">
                  {medicalProfile.allergies.map((a, i) => (
                    <span key={i} className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg">
                      ⚠️ {a}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Current Medications:</span>
                <p className="text-white bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                  {medicalProfile.medications.join(', ')}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Emergency Contact:</span>
                <p className="text-emerald-400 font-mono font-bold">+1 (555) 876-5432 (David Jenkins)</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-right">
              <button
                onClick={() => setSelectedPatientModal(null)}
                className="px-4 py-2 bg-slate-800 text-white font-bold rounded-xl"
              >
                Close File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
