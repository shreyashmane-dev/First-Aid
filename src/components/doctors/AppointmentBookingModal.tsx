import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import type { DoctorProfile, ConsultationType } from '../../types';
import { X, Video, Building, AlertCircle, CheckCircle } from 'lucide-react';

interface AppointmentBookingModalProps {
  doctor: DoctorProfile | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AVAILABLE_SLOTS = [
  { start: '09:00', end: '09:30' },
  { start: '10:00', end: '10:30' },
  { start: '11:00', end: '11:30' },
  { start: '14:00', end: '14:30' },
  { start: '15:00', end: '15:30' },
  { start: '16:00', end: '16:30' }
];

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  doctor,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const { bookAppointment } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string }>(AVAILABLE_SLOTS[0]);
  const [consultationType, setConsultationType] = useState<ConsultationType>('video');
  const [reason, setReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!doctor) return null;

  const handleConfirm = () => {
    setErrorMsg(null);

    const result = bookAppointment(
      currentUser?.uid || 'pat_001',
      currentUser?.displayName || 'Sarah Jenkins',
      doctor.doctorId,
      doctor.name,
      doctor.specialization,
      selectedDate,
      selectedSlot.start,
      selectedSlot.end,
      consultationType,
      reason || 'General Health Consultation'
    );

    if (!result.success) {
      setErrorMsg(result.error || 'Booking failed.');
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={doctor.photoUrl}
              alt={doctor.name}
              className="w-12 h-12 rounded-xl object-cover border border-indigo-200 dark:border-indigo-500/40 shadow-sm"
            />
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">Book Appointment with {doctor.name}</h2>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{doctor.specialization} • ${doctor.consultationFee}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 dark:text-slate-300 text-xs">
          {/* Double booking error alert */}
          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-500/50 rounded-xl p-4 flex items-start gap-3 text-red-700 dark:text-red-300">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="font-bold text-red-800 dark:text-red-200">Scheduling Notice</strong>
                <p className="text-xs leading-normal">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Consultation Type Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider">
              Consultation Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConsultationType('video')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                  consultationType === 'video'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Online Video Call</span>
              </button>

              <button
                type="button"
                onClick={() => setConsultationType('in_person')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                  consultationType === 'in_person'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>In-Person Hospital Visit</span>
              </button>
            </div>
          </div>

          {/* Date Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider">
              Select Appointment Date
            </label>
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Available Slots */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider">
              Available Time Slots
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_SLOTS.map((slot) => {
                const isSelected = selectedSlot.start === slot.start;
                return (
                  <button
                    type="button"
                    key={slot.start}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 rounded-lg font-mono text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    ⏰ {slot.start} - {slot.end}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason for Visit */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider">
              Reason for Visit / Symptoms
            </label>
            <textarea
              rows={3}
              placeholder="Describe symptoms or reason for appointment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-slate-500 dark:text-slate-400 block">Total Payable</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">${doctor.consultationFee}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirm Booking</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
