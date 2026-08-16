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
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole;
  patientProfile: PatientProfile | null;
  doctorProfile: DoctorProfile | null;
  login: (email: string, role: UserRole, password?: string) => Promise<boolean>;
  logout: () => void;
  registerPatient: (email: string, name: string, password?: string, phone?: string) => Promise<boolean>;
  registerDoctor: (email: string, name: string, specialization: string, licenseNumber: string, password?: string) => Promise<boolean>;
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

  // Real Firebase Auth listener
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          // Fetch real user metadata from Firestore
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);

          let role: UserRole = 'patient';
          let displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'User';

          if (userSnap.exists()) {
            const data = userSnap.data();
            role = data.role || 'patient';
            displayName = data.displayName || displayName;
          } else {
            // Save initial user doc to Firestore
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

          // Fetch patient or doctor profile from Firestore
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
        } catch (err) {
          console.warn('Firestore user fetch note:', err);
        }
      }
    });

    return () => unsubscribe();
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

  const login = async (email: string, role: UserRole, password?: string): Promise<boolean> => {
    const pwd = password || 'Password123!';

    if (auth) {
      try {
        const cred = await signInWithEmailAndPassword(auth, email, pwd);
        const fbUser = cred.user;

        const userDocRef = doc(db, 'users', fbUser.uid);
        const userSnap = await getDoc(userDocRef);
        let userRoleChoice = role;
        let displayName = fbUser.displayName || email.split('@')[0];

        if (userSnap.exists()) {
          userRoleChoice = userSnap.data().role || role;
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
        return true;
      } catch (err) {
        console.warn('Firebase Auth sign-in fallback:', err);
      }
    }

    // Fallback local sign-in
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
      const patProfile: PatientProfile = {
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
      };
      setPatientProfile(patProfile);
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

  const registerPatient = async (email: string, name: string, password?: string, phone?: string): Promise<boolean> => {
    const pwd = password || 'Password123!';
    let uid = `pat_${Date.now()}`;

    if (auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pwd);
        uid = cred.user.uid;

        // Save real user document into Firestore
        await setDoc(doc(db, 'users', uid), {
          uid,
          email,
          role: 'patient',
          displayName: name,
          phone: phone || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Save real patient profile into Firestore
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
        setPatientProfile(newProfile);
      } catch (err) {
        console.warn('Firebase registerPatient fallback:', err);
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
      uid: newUser.uid,
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

    setCurrentUser(newUser);
    setPatientProfile(newProfile);
    return true;
  };

  const registerDoctor = async (
    email: string,
    name: string,
    specialization: string,
    licenseNumber: string,
    password?: string
  ): Promise<boolean> => {
    const pwd = password || 'Password123!';
    let userId = `doc_${Date.now()}_user`;
    const doctorId = `doc_${Date.now()}`;

    if (auth) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, pwd);
        userId = cred.user.uid;

        await setDoc(doc(db, 'users', userId), {
          uid: userId,
          email,
          role: 'doctor',
          displayName: name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Firebase registerDoctor fallback:', err);
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

    if (db) {
      try {
        await setDoc(doc(db, 'doctors', doctorId), newDocProfile);
      } catch (e) {
        console.warn('Firestore doctor doc write note:', e);
      }
    }

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
