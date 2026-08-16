import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole, PatientProfile, DoctorProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole;
  patientProfile: PatientProfile | null;
  doctorProfile: DoctorProfile | null;
  login: (email: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  registerPatient: (email: string, name: string, phone?: string) => Promise<boolean>;
  registerDoctor: (email: string, name: string, specialization: string, licenseNumber: string) => Promise<boolean>;
  updatePatientProfile: (updated: Partial<PatientProfile>) => void;
  updateDoctorProfile: (updated: Partial<DoctorProfile>) => void;
  switchRoleDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('first_aid_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(() => {
    const saved = localStorage.getItem('first_aid_patient_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(() => {
    const saved = localStorage.getItem('first_aid_doctor_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const userRole: UserRole = currentUser?.role || 'patient';

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('first_aid_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('first_aid_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (patientProfile) {
      localStorage.setItem('first_aid_patient_profile', JSON.stringify(patientProfile));
    } else {
      localStorage.removeItem('first_aid_patient_profile');
    }
  }, [patientProfile]);

  useEffect(() => {
    if (doctorProfile) {
      localStorage.setItem('first_aid_doctor_profile', JSON.stringify(doctorProfile));
    } else {
      localStorage.removeItem('first_aid_doctor_profile');
    }
  }, [doctorProfile]);

  const login = async (email: string, role: UserRole): Promise<boolean> => {
    const nameFromEmail = email.split('@')[0];
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

    const newUser: User = {
      uid: `usr_${Date.now()}`,
      email,
      role,
      displayName: formattedName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCurrentUser(newUser);

    if (role === 'patient') {
      setPatientProfile({
        uid: newUser.uid,
        contactNumber: '+1 (555) 000-1122',
        emergencyContact: {
          name: 'Primary Contact',
          relationship: 'Family',
          phone: '+1 (555) 911-0000'
        },
        shareProfileWithDoctor: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    setPatientProfile(null);
    setDoctorProfile(null);
    localStorage.removeItem('first_aid_user');
    localStorage.removeItem('first_aid_patient_profile');
    localStorage.removeItem('first_aid_doctor_profile');
  };

  const registerPatient = async (email: string, name: string, phone?: string): Promise<boolean> => {
    const newUser: User = {
      uid: `pat_${Date.now()}`,
      email,
      role: 'patient',
      displayName: name,
      phone: phone || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newProfile: PatientProfile = {
      uid: newUser.uid,
      contactNumber: phone || '',
      emergencyContact: {
        name: 'Primary Contact',
        relationship: 'Family',
        phone: phone || '+1 (555) 911-0000'
      },
      shareProfileWithDoctor: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCurrentUser(newUser);
    setPatientProfile(newProfile);
    return true;
  };

  const registerDoctor = async (
    email: string,
    name: string,
    specialization: string,
    licenseNumber: string
  ): Promise<boolean> => {
    const userId = `doc_${Date.now()}_user`;
    const doctorId = `doc_${Date.now()}`;
    const newUser: User = {
      uid: userId,
      email,
      role: 'doctor',
      displayName: name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newDocProfile: DoctorProfile = {
      doctorId,
      userId,
      name,
      photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
      specialization,
      licenseNumber,
      licenseStatus: 'pending',
      education: [{ degree: 'MD', university: 'Medical University', year: 2020 }],
      experienceYears: 5,
      hospitalIds: ['hosp_01'],
      hospitalName: 'City General Trauma Center',
      professionalEmail: email,
      professionalPhone: '+1 (555) 000-1122',
      bio: `Dr. ${name} is a specialist in ${specialization}.`,
      consultationFee: 75,
      rating: 5.0,
      reviewsCount: 1,
      verificationStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCurrentUser(newUser);
    setDoctorProfile(newDocProfile);
    return true;
  };

  const updatePatientProfile = (updated: Partial<PatientProfile>) => {
    setPatientProfile((prev) => (prev ? { ...prev, ...updated, updatedAt: new Date().toISOString() } : null));
  };

  const updateDoctorProfile = (updated: Partial<DoctorProfile>) => {
    setDoctorProfile((prev) => (prev ? { ...prev, ...updated, updatedAt: new Date().toISOString() } : null));
  };

  const switchRoleDemo = (role: UserRole) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
    } else {
      login(`demo.${role}@firstaidhospital.org`, role);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole,
        patientProfile,
        doctorProfile,
        login,
        logout,
        registerPatient,
        registerDoctor,
        updatePatientProfile,
        updateDoctorProfile,
        switchRoleDemo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
