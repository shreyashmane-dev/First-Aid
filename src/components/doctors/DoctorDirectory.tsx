import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { DoctorProfile } from '../../types';
import {
  Search,
  Star,
  ShieldCheck,
  Calendar,
  Building,
  GraduationCap,
  Award
} from 'lucide-react';

interface DoctorDirectoryProps {
  onSelectDoctor: (doctor: DoctorProfile) => void;
}

export const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({ onSelectDoctor }) => {
  const { doctors } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState<string>('ALL');

  const specializations = ['ALL', 'Cardiology', 'Emergency Medicine', 'Pulmonology', 'Pediatrics'];

  const verifiedDoctors = doctors.filter(d => d.verificationStatus === 'verified');

  const filteredDoctors = verifiedDoctors.filter(doc => {
    const matchesSpec = selectedSpec === 'ALL' || doc.specialization === selectedSpec;
    const matchesQuery =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.hospitalName && doc.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSpec && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Verified Medical Practitioners
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">Specialist Directory & Appointments</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Book in-person clinic visits or encrypted video consultations with certified cardiologists, toxicologists, and emergency doctors.
            </p>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search doctor by name, cardiology, emergency, hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">Specialty:</span>
            <select
              value={selectedSpec}
              onChange={(e) => setSelectedSpec(e.target.value)}
              className="bg-transparent text-indigo-600 dark:text-indigo-400 font-bold focus:outline-none cursor-pointer w-full"
            >
              {specializations.map(s => (
                <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div
            key={doctor.doctorId}
            className="bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={doctor.photoUrl}
                    alt={doctor.name}
                    className="w-13 h-13 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                        {doctor.name}
                      </h3>
                      <span title="Verified License">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      </span>
                    </div>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{doctor.specialization}</p>
                    <p className="text-[11px] text-slate-400">{doctor.subSpecialization}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold shrink-0">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{doctor.rating}</span>
                </div>
              </div>

              {/* Bio snippet */}
              <p className="text-slate-600 dark:text-slate-300 text-xs line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {doctor.bio}
              </p>

              {/* Education & Experience */}
              <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                  <span className="truncate">{doctor.education[0]?.degree} • {doctor.education[0]?.university}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>{doctor.experienceYears} Years Clinical Experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">{doctor.hospitalName || 'City General Hospital'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions & Fee */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Consultation Fee</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">${doctor.consultationFee}</span>
              </div>

              <button
                onClick={() => onSelectDoctor(doctor)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Book Slot</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
