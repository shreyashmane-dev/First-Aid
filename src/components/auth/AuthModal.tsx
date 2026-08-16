import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import type { BloodGroup, DoctorProfile } from '../../types';
import { X, HeartPulse, Lock, Mail, User, Stethoscope, Building2, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, registerPatient, registerDoctor } = useAuth();
  const { addRegisteredDoctor } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'medical_staff'>('patient');

  // Common Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Patient Fields
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [allergies, setAllergies] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // Doctor Fields
  const [specialization, setSpecialization] = useState('Cardiology');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hospitalName, setHospitalName] = useState('City General Hospital');
  const [bio, setBio] = useState('');

  // Medical Staff Fields
  const [staffDepartment, setStaffDepartment] = useState('Emergency ER');
  const [staffBadgeNumber, setStaffBadgeNumber] = useState('');

  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    try {
      if (mode === 'login') {
        await login(email, password, selectedRole);
        setFeedback('Signed in successfully via Firebase Auth!');
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        if (selectedRole === 'patient') {
          await registerPatient(email, password, fullName || 'Registered Patient', phone);
        } else if (selectedRole === 'doctor') {
          const docName = fullName.startsWith('Dr.') ? fullName : `Dr. ${fullName || 'Specialist'}`;
          await registerDoctor(email, password, docName, specialization, licenseNumber || 'MD-LIC-8891');
          
          const newDoc: DoctorProfile = {
            doctorId: `doc_${Date.now()}`,
            userId: `usr_${Date.now()}`,
            name: docName,
            photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
            specialization,
            licenseNumber: licenseNumber || 'MD-LIC-8891',
            licenseStatus: 'verified',
            education: [{ degree: 'MD', university: 'Medical University', year: 2020 }],
            experienceYears: 6,
            hospitalIds: ['hosp_01'],
            hospitalName: hospitalName || 'City General Hospital',
            professionalEmail: email,
            professionalPhone: phone || '+1 (555) 000-1122',
            bio: bio || `Dr. ${fullName} is a board-certified specialist in ${specialization}.`,
            consultationFee: 80,
            rating: 5.0,
            reviewsCount: 1,
            verificationStatus: 'verified',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          addRegisteredDoctor(newDoc);
        } else if (selectedRole === 'medical_staff') {
          await login(email, password, 'medical_staff');
        }

        setFeedback(`Account registered successfully as ${selectedRole.replace('_', ' ').toUpperCase()} in Firebase!`);
        setTimeout(() => {
          onClose();
        }, 600);
      }
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      let msg = err?.message || 'Authentication failed.';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
        msg = 'Invalid email or password. Please check your credentials or click Sign Up to register.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email address already exists. Please click Sign In.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password must be at least 6 characters long.';
      }
      setErrorMessage(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-none">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-emerald-500 flex items-center justify-center text-white shadow-md">
              <HeartPulse className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                {mode === 'signup' ? 'Create Account' : 'Sign In'}
              </h2>
              <p className="text-xs text-slate-400">First Aid Hospital Identity Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sign In vs Sign Up Toggle */}
        <div className="flex items-center bg-slate-800 p-1 rounded-2xl border border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
              mode === 'signup' ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up (Register)
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
              mode === 'login' ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-950/70 border border-red-500/50 rounded-2xl text-red-300 text-xs font-bold flex items-center gap-2">
            <span className="text-red-400">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs flex items-center gap-2 font-bold animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Role Selector Cards (Only for Sign Up or Login Role Selection) */}
        <div className="space-y-2">
          <label className="block text-slate-300 font-bold text-xs">
            Select Your Role:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedRole('patient')}
              className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
                selectedRole === 'patient'
                  ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-md ring-1 ring-rose-500'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-5 h-5 mx-auto text-rose-400" />
              <div className="font-extrabold text-[11px]">Patient</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('doctor')}
              className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
                selectedRole === 'doctor'
                  ? 'bg-sky-950/60 border-sky-500 text-sky-300 shadow-md ring-1 ring-sky-500'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Stethoscope className="w-5 h-5 mx-auto text-sky-400" />
              <div className="font-extrabold text-[11px]">Doctor</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('medical_staff')}
              className={`p-3 rounded-2xl border text-center space-y-1 transition-all ${
                selectedRole === 'medical_staff'
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-5 h-5 mx-auto text-emerald-400" />
              <div className="font-extrabold text-[11px]">Medical Staff</div>
            </button>
          </div>
        </div>

        {/* Dynamic Role Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'signup' && (
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                {selectedRole === 'doctor' ? 'Doctor Full Name' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder={selectedRole === 'doctor' ? 'Dr. Rajesh Sharma' : 'Sarah Connor'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-bold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder={
                  selectedRole === 'doctor'
                    ? 'dr.sharma@hospital.org'
                    : selectedRole === 'medical_staff'
                    ? 'staff@hospital.org'
                    : 'patient@email.com'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* PATIENT ROLE SPECIFIC DETAILS */}
          {mode === 'signup' && selectedRole === 'patient' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-rose-500"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg} className="bg-slate-900 text-white">{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Known Allergies (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Peanuts, Latex..."
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    placeholder="Spouse / Parent..."
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    placeholder="108 / +91 91100..."
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* DOCTOR ROLE SPECIFIC DETAILS */}
          {mode === 'signup' && selectedRole === 'doctor' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Specialization</label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-sky-500"
                  >
                    {['Cardiology', 'Toxicology', 'Pulmonology', 'Pediatrics', 'Emergency Medicine', 'Neurology', 'Orthopedics'].map(spec => (
                      <option key={spec} value={spec} className="bg-slate-900 text-white">{spec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Medical License No.</label>
                  <input
                    type="text"
                    required
                    placeholder="MD-CARDIO-881"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Hospital / Clinic Affiliation</label>
                <input
                  type="text"
                  placeholder="City General Trauma & ER Center"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Professional Phone</label>
                <input
                  type="text"
                  placeholder="+91 (555) 000-1122"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Professional Bio (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Specialist background, certifications, experience..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </>
          )}

          {/* MEDICAL STAFF ROLE SPECIFIC DETAILS */}
          {mode === 'signup' && selectedRole === 'medical_staff' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Staff Department</label>
                  <input
                    type="text"
                    required
                    placeholder="ER Triage / Ambulance Dispatch"
                    value={staffDepartment}
                    onChange={(e) => setStaffDepartment(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Staff Badge ID</label>
                  <input
                    type="text"
                    required
                    placeholder="STAFF-8902"
                    value={staffBadgeNumber}
                    onChange={(e) => setStaffBadgeNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Hospital Facility</label>
                <input
                  type="text"
                  placeholder="Apex Health Center"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-red-600/30 transition-all mt-2 cursor-pointer"
          >
            {mode === 'login'
              ? `Sign In as ${selectedRole.replace('_', ' ').toUpperCase()}`
              : `Register as ${selectedRole.replace('_', ' ').toUpperCase()}`}
          </button>
        </form>
      </div>
    </div>
  );
};
