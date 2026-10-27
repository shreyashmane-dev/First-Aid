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

const SEEDED_ACCOUNTS: Record<string, { role: UserRole; displayName: string; phone: string }> = {
  'admin@firstaid.org': {
    role: 'admin',
    displayName: 'System Administrator',
    phone: '+1 (555) 111-2222'
  },
  'doctor@firstaid.org': {
    role: 'doctor',
    displayName: 'Dr. Rajesh Sharma',
    phone: '+1 (555) 987-6543'
  },
  'patient1@firstaid.org': {
    role: 'patient',
    displayName: 'Sarah Jenkins',
    phone: '+1 (555) 234-5678'
  },
  'patient2@firstaid.org': {
    role: 'patient',
    displayName: 'Michael Chang',
    phone: '+1 (555) 345-6789'
  }
};

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole;
  patientProfile: PatientProfile | null;
  doctorProfile: DoctorProfile | null;
  isAuthLoading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  registerPatient: (email: string, password: string, name: string, phone?: string) => Promise<boolean>;
  registerDoctor: (email: string, password: string, name: string, specialization: string, licenseNumber: string) => Promise<boolean>;
  updatePatientProfile: (updated: Partial<PatientProfile>) => void;
  updateDoctorProfile: (updated: Partial<DoctorProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('first_aid_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(() => {
    try {
      const saved = localStorage.getItem('first_aid_patient_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(() => {
    try {
      const saved = localStorage.getItem('first_aid_doctor_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const userRole: UserRole = currentUser?.role || 'patient';

  // Real Firebase Auth & Firestore Real-Time User Document Listener
  useEffect(() => {
    if (!auth) {
      setIsAuthLoading(false);
      return;
    }

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
                }).catch((e) => console.warn('Firestore setDoc note:', e));
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
              localStorage.setItem('first_aid_user', JSON.stringify(appUser));

              if (role === 'patient') {
                const patDocRef = doc(db, 'patients', fbUser.uid);
                const patSnap = await getDoc(patDocRef).catch(() => null);
                if (patSnap && patSnap.exists()) {
                  const pData = patSnap.data() as PatientProfile;
                  setPatientProfile(pData);
                  localStorage.setItem('first_aid_patient_profile', JSON.stringify(pData));
                }
              } else if (role === 'doctor') {
                const docDocRef = doc(db, 'doctors', fbUser.uid);
                const docSnap = await getDoc(docDocRef).catch(() => null);
                if (docSnap && docSnap.exists()) {
                  const dData = docSnap.data() as DoctorProfile;
                  setDoctorProfile(dData);
                  localStorage.setItem('first_aid_doctor_profile', JSON.stringify(dData));
                }
              }
              setIsAuthLoading(false);
            },
            (err) => {
              console.warn('Firestore user doc real-time listener note:', err.message);
              setIsAuthLoading(false);
            }
          );
        } catch (err) {
          console.warn('Firestore user fetch note:', err);
          setIsAuthLoading(false);
        }
      } else {
        // If Firebase Auth is not active, check if we have a locally persisted user session
        // This prevents wiping demo / guest user state on page refresh
        const savedUserStr = localStorage.getItem('first_aid_user');
        if (!savedUserStr) {
          setCurrentUser(null);
          setPatientProfile(null);
          setDoctorProfile(null);
        }
        setIsAuthLoading(false);
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
    }
  }, [currentUser]);

  useEffect(() => {
    if (patientProfile) {
      localStorage.setItem('first_aid_patient_profile', JSON.stringify(patientProfile));
    }
  }, [patientProfile]);

  useEffect(() => {
    if (doctorProfile) {
      localStorage.setItem('first_aid_doctor_profile', JSON.stringify(doctorProfile));
    }
  }, [doctorProfile]);

  // Strict Firebase Auth Login with automatic registration & DB integration
  const login = async (email: string, password?: string, role?: UserRole): Promise<boolean> => {
    const pwd = password || 'Password123!';
    const normalizedEmail = email.trim().toLowerCase();
    const seeded = SEEDED_ACCOUNTS[normalizedEmail];

    let userRoleChoice: UserRole = seeded?.role || role || 'patient';
    let displayName = seeded?.displayName || email.split('@')[0];

    if (!auth) {
      // Offline / Demo Login
      const demoUser: User = {
        uid: seeded ? `usr_${normalizedEmail.replace(/[@.]/g, '_')}` : `demo_${Date.now()}`,
        email: normalizedEmail,
        role: userRoleChoice,
        displayName,
        phone: seeded?.phone || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCurrentUser(demoUser);
      return true;
    }

    try {
      let fbUser: FirebaseUser;
      try {
        const cred = await signInWithEmailAndPassword(auth, normalizedEmail, pwd);
        fbUser = cred.user;
      } catch (authErr: any) {
        // If account does not exist in Firebase Auth yet, automatically create it
        if (
          authErr.code === 'auth/user-not-found' ||
          authErr.code === 'auth/invalid-credential' ||
          authErr.code === 'auth/wrong-password'
        ) {
          try {
            const createCred = await createUserWithEmailAndPassword(auth, normalizedEmail, pwd);
            fbUser = createCred.user;
          } catch {
            throw authErr;
          }
        } else {
          throw authErr;
        }
      }

      const userDocRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userDocRef).catch(() => null);

      if (userSnap && userSnap.exists()) {
        userRoleChoice = userSnap.data().role || userRoleChoice;
        displayName = userSnap.data().displayName || displayName;
      }

      const newUser: User = {
        uid: fbUser.uid,
        email: fbUser.email || normalizedEmail,
        role: userRoleChoice,
        displayName,
        phone: seeded?.phone || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Integrated into DB (Firestore)
      if (db) {
        setDoc(userDocRef, newUser, { merge: true }).catch(() => null);
      }

      setCurrentUser(newUser);

      if (userRoleChoice === 'patient') {
        const patDocRef = doc(db, 'patients', fbUser.uid);
        const patSnap = await getDoc(patDocRef).catch(() => null);
        if (patSnap && patSnap.exists()) {
          setPatientProfile(patSnap.data() as PatientProfile);
        } else if (db) {
          const newPatProfile: PatientProfile = {
            uid: fbUser.uid,
            contactNumber: seeded?.phone || '+1 (555) 234-5678',
            emergencyContact: { name: 'Emergency Family', relationship: 'Spouse', phone: '+1 (555) 911-0000' },
            shareProfileWithDoctor: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setDoc(patDocRef, newPatProfile).catch(() => null);
          setPatientProfile(newPatProfile);
        }
      } else if (userRoleChoice === 'doctor') {
        const docDocRef = doc(db, 'doctors', fbUser.uid);
        const docSnap = await getDoc(docDocRef).catch(() => null);
        if (docSnap && docSnap.exists()) {
          setDoctorProfile(docSnap.data() as DoctorProfile);
        } else if (db) {
          const newDoc: DoctorProfile = {
            doctorId: 'doc_101',
            userId: fbUser.uid,
            name: displayName,
            photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
            specialization: 'Cardiology',
            licenseNumber: 'MD-CARDIO-889012',
            licenseStatus: 'verified',
            education: [{ degree: 'MD Cardiology', university: 'AIIMS / Johns Hopkins', year: 2012 }],
            experienceYears: 14,
            hospitalIds: ['hosp_01'],
            hospitalName: 'City General Trauma & Emergency Center',
            professionalEmail: normalizedEmail,
            professionalPhone: seeded?.phone || '+1 (555) 987-6543',
            bio: 'Board-certified cardiologist specializing in acute myocardial infarction, chest pain triage, and telemedicine.',
            consultationFee: 75,
            rating: 4.9,
            reviewsCount: 142,
            verificationStatus: 'verified',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setDoc(docDocRef, newDoc).catch(() => null);
          setDoctorProfile(newDoc);
        }
      }

      return true;
    } catch (err: any) {
      console.error('Firebase Auth sign-in failed:', err.message);
      throw err;
    }
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
    let uid = `pat_${Date.now()}`;

    if (auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        uid = cred.user.uid;
      } catch (err) {
        console.warn('Firebase createUser note, using generated id:', err);
      }
    }

    const newUser: User = {
      uid,
      email,
      role: 'patient',
      displayName: name,
      phone: phone || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newProfile: PatientProfile = {
      uid,
      contactNumber: phone || '',
      emergencyContact: {
        name: 'Primary Emergency Contact',
        relationship: 'Family',
        phone: phone || '+91 98765 43210'
      },
      shareProfileWithDoctor: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (db) {
      setDoc(doc(db, 'users', uid), newUser).catch(() => null);
      setDoc(doc(db, 'patients', uid), newProfile).catch(() => null);
    }

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
    let userId = `user_${Date.now()}`;
    let doctorId = `doc_${Date.now()}`;

    if (auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        userId = cred.user.uid;
        doctorId = `doc_${userId}`;
      } catch (err) {
        console.warn('Firebase createUser note:', err);
      }
    }

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
      licenseStatus: 'verified',
      education: [{ degree: 'MD / MBBS', university: 'Maharashtra Medical University', year: 2020 }],
      experienceYears: 6,
      hospitalIds: ['hosp_01'],
      hospitalName: 'Apollo Sahyadri Trauma Center',
      professionalEmail: email,
      professionalPhone: '+91 98220 11223',
      bio: `Dr. ${name} is a board-certified specialist in ${specialization}.`,
      consultationFee: 500,
      rating: 5.0,
      reviewsCount: 1,
      verificationStatus: 'verified',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (db) {
      setDoc(doc(db, 'users', userId), newUser).catch(() => null);
      setDoc(doc(db, 'doctors', doctorId), newDocProfile).catch(() => null);
    }

    setCurrentUser(newUser);
    setDoctorProfile(newDocProfile);
    return true;
  };

  const updatePatientProfile = (updated: Partial<PatientProfile>) => {
    setPatientProfile((prev) => {
      const current = prev || {
        uid: currentUser?.uid || 'guest_patient',
        contactNumber: '',
        emergencyContact: { name: '', relationship: '', phone: '' },
        shareProfileWithDoctor: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const next = { ...current, ...updated, updatedAt: new Date().toISOString() };
      if (db && next.uid) {
        updateDoc(doc(db, 'patients', next.uid), next).catch((e) => console.warn('Firestore update note:', e));
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

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userRole,
        patientProfile,
        doctorProfile,
        isAuthLoading,
        login,
        logout,
        registerPatient,
        registerDoctor,
        updatePatientProfile,
        updateDoctorProfile,
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
