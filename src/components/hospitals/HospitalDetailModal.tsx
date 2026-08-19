import React from 'react';
import type { Hospital, DoctorProfile } from '../../types';
import { mapsTrailService } from '../../services/mapsTrailAdapter';
import { X, MapPin, Phone, Navigation, Star, Stethoscope } from 'lucide-react';

interface HospitalDetailModalProps {
  hospital: Hospital | null;
  doctors: DoctorProfile[];
  onClose: () => void;
  onBookDoctor: (doctor: DoctorProfile) => void;
}

export const HospitalDetailModal: React.FC<HospitalDetailModalProps> = ({
  hospital,
  doctors,
  onClose,
  onBookDoctor
}) => {
  if (!hospital) return null;

  const hospitalDoctors = doctors.filter(d => hospital.departments.some(dept => d.specialization.includes(dept)) || d.hospitalIds.includes(hospital.hospitalId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Hero Image */}
        <div className="relative h-48 sm:h-56 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
          <img
            src={hospital.imageUrls[0] || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80'}
            alt={hospital.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 flex items-center justify-center text-white backdrop-blur-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold">
                  Verified Hospital
                </span>
                {hospital.emergencyAvailable && (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-extrabold">
                    24/7 ER ACTIVE
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{hospital.name}</h2>
              <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{hospital.address}</span>
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700 text-amber-400 text-xs font-bold shrink-0">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{hospital.rating} / 5.0</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 text-xs">
          {/* Quick Contact & Navigation Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`tel:${hospital.emergencyPhone}`}
              className="flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-600/20 transition-all text-xs"
            >
              <Phone className="w-4 h-4" />
              <span>Call ER Helpline ({hospital.emergencyPhone})</span>
            </a>

            <button
              onClick={() => mapsTrailService.openNavigation(hospital.latitude, hospital.longitude, hospital.name)}
              className="flex items-center justify-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-slate-700 font-bold rounded-xl transition-all text-xs cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Launch GPS Navigation</span>
            </button>
          </div>

          {/* Description */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">About Facility</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">{hospital.description}</p>
          </div>

          {/* Departments & Services */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Specialized Departments</h3>
              <div className="flex flex-wrap gap-1.5">
                {hospital.departments.map((dept, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg">
                    🏥 {dept}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Key Medical Services</h3>
              <div className="flex flex-wrap gap-1.5">
                {hospital.services.map((serv, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-lg">
                    ✅ {serv}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Affiliated Doctors at Hospital */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Affiliated Doctors & Specialists</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hospitalDoctors.map((doc) => (
                <div
                  key={doc.doctorId}
                  className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={doc.photoUrl}
                      alt={doc.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-300 dark:border-slate-600"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">{doc.name}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{doc.specialization}</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">${doc.consultationFee} / session</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onBookDoctor(doc);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] transition-all cursor-pointer"
                  >
                    Book Slot
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
