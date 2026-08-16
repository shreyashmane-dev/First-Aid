import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole, PatientProfile, DoctorProfile } from '../types';
import { auth, db } from '../services/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole;
  patientProfile: PatientProfile | null;
  doctorProfile: DoctorProfile | null;
  login: (email: string, password?: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  registerPatient: (email: string, password: string, name: string, phone?: string) => Promise<boolean>;
  registerDoctor: (email: string, password: string, name: string, specialization: string, licenseNumber: string) => Promise<boolean>;
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

  // Real Firebase Auth & Firestore Real-Time User Document Listener
  useEffect(() => {
    if (!auth) return;
    let unsubUserDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (unsubUserDoc) {
        unsubUserDoc();
        unsubUserDoc = null;
      }

      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);

          unsubUserDoc = onSnapshot(
            userDocRef,
            async (userSnap) => {
              let role: UserRole = 'patient';
              let displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'User';

              if (userSnap.exists()) {
                const data = userSnap.data();
                role = data.role || 'patient';
                displayName = data.displayName || displayName;
              } else {
                await setDoc(userDocRef, {
                  uid: fbUser.uid,
                  email: fbUser.email,
                  role,
                  displayName,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                });
              }

              const appUser: User = {
                uid: fbUser.uid,
                email: fbUser.email || '',
                role,
                displayName,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };

              setCurrentUser(appUser);

              if (role === 'patient') {
                const patDocRef = doc(db, 'patients', fbUser.uid);
                const patSnap = await getDoc(patDocRef);
                if (patSnap.exists()) {
                  setPatientProfile(patSnap.data() as PatientProfile);
                }
              } else if (role === 'doctor') {
                const docDocRef = doc(db, 'doctors', fbUser.uid);
                const docSnap = await getDoc(docDocRef);
                if (docSnap.exists()) {
                  setDoctorProfile(docSnap.data() as DoctorProfile);
                }
              }
            },
            (err) => {
              console.warn('Firestore user doc real-time listener note:', err.message);
            }
          );
        } catch (err) {
          console.warn('Firestore user fetch note:', err);
        }
      } else {
        setCurrentUser(null);
        setPatientProfile(null);
        setDoctorProfile(null);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, []);

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

  // Strict Firebase Auth Login
  const login = async (email: string, password?: string, role?: UserRole): Promise<boolean> => {
    const pwd = password || 'Password123!';

    if (!auth) {
      throw new Error('Firebase Authentication is not initialized.');
    }

    // Call real Firebase Authentication API
    const cred = await signInWithEmailAndPassword(auth, email, pwd);
    const fbUser = cred.user;

    const userDocRef = doc(db, 'users', fbUser.uid);
    const userSnap = await getDoc(userDocRef);
    let userRoleChoice: UserRole = role || 'patient';
    let displayName = fbUser.displayName || email.split('@')[0];

    if (userSnap.exists()) {
      userRoleChoice = userSnap.data().role || userRoleChoice;
      displayName = userSnap.data().displayName || displayName;
    }

    const newUser: User = {
      uid: fbUser.uid,
      email: fbUser.email || email,
      role: userRoleChoice,
      displayName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCurrentUser(newUser);

    if (userRoleChoice === 'patient') {
      const patDocRef = doc(db, 'patients', fbUser.uid);
      const patSnap = await getDoc(patDocRef);
      if (patSnap.exists()) {
        setPatientProfile(patSnap.data() as PatientProfile);
      }
    } else if (userRoleChoice === 'doctor') {
      const docDocRef = doc(db, 'doctors', fbUser.uid);
      const docSnap = await getDoc(docDocRef);
      if (docSnap.exists()) {
        setDoctorProfile(docSnap.data() as DoctorProfile);
      }
    }

    return true;
  };

  const logout = () => {
    if (auth) {
      firebaseSignOut(auth).catch((err) => console.warn('Firebase signOut error:', err));
    }
    setCurrentUser(null);
    setPatientProfile(null);
    setDoctorProfile(null);
    localStorage.removeItem('first_aid_user');
    localStorage.removeItem('first_aid_patient_profile');
    localStorage.removeItem('first_aid_doctor_profile');
  };

  // Strict Firebase Auth Patient Registration
  const registerPatient = async (
    email: string,
    password: string,
    name: string,
    phone?: string
  ): Promise<boolean> => {
    if (!auth) {
      throw new Error('Firebase Authentication is not initialized.');
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      role: 'patient',
      displayName: name,
      phone: phone || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const newProfile: PatientProfile = {
      uid,
      contactNumber: phone || '',
      emergencyContact: {
        name: 'Primary Emergency Contact',
        relationship: 'Family',
        phone: phone || '+1 (555) 911-0000'
      },
      shareProfileWithDoctor: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'patients', uid), newProfile);

    const newUser: User = {
      uid,
      email,
      role: 'patient',
      displayName: name,
      phone: phone || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCurrentUser(newUser);
    setPatientProfile(newProfile);
    return true;
  };

  // Strict Firebase Auth Doctor Registration
  const registerDoctor = async (
    email: string,
    password: string,
    name: string,
    specialization: string,
    licenseNumber: string
  ): Promise<boolean> => {
    if (!auth) {
      throw new Error('Firebase Authentication is not initialized.');
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const userId = cred.user.uid;
    const doctorId = `doc_${userId}`;

    await setDoc(doc(db, 'users', userId), {
      uid: userId,
      email,
      role: 'doctor',
      displayName: name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const newDocProfile: DoctorProfile = {
      doctorId,
      userId,
      name,
      photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
      specialization,
      licenseNumber,
      licenseStatus: 'verified',
      education: [{ degree: 'MD', university: 'Medical University', year: 2020 }],
      experienceYears: 6,
      hospitalIds: ['hosp_01'],
      hospitalName: 'City General Trauma Center',
      professionalEmail: email,
      professionalPhone: '+1 (555) 000-1122',
      bio: `Dr. ${name} is a board-certified specialist in ${specialization}.`,
      consultationFee: 75,
      rating: 5.0,
      reviewsCount: 1,
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'doctors', doctorId), newDocProfile);

    const newUser: User = {
      uid: userId,
      email,
      role: 'doctor',
      displayName: name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCurrentUser(newUser);
    setDoctorProfile(newDocProfile);
    return true;
  };

  const updatePatientProfile = (updated: Partial<PatientProfile>) => {
    setPatientProfile((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated, updatedAt: new Date().toISOString() };
      if (db && prev.uid) {
        updateDoc(doc(db, 'patients', prev.uid), next).catch((e) => console.warn('Firestore update note:', e));
      }
      return next;
    });
  };

  const updateDoctorProfile = (updated: Partial<DoctorProfile>) => {
    setDoctorProfile((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated, updatedAt: new Date().toISOString() };
      if (db && prev.doctorId) {
        updateDoc(doc(db, 'doctors', prev.doctorId), next).catch((e) => console.warn('Firestore update note:', e));
      }
      return next;
    });
  };

  const switchRoleDemo = (role: UserRole) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, role });
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
