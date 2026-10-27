import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  MedicalProfile,
  Hospital,
  DoctorProfile,
  Appointment,
  FirstAidArticle,
  AIChatMessage,
  AuditLog,
  NotificationItem,
  User,
  UserRole
} from '../types';
import {
  INITIAL_MEDICAL_PROFILE,
  INITIAL_HOSPITALS,
  INITIAL_DOCTORS,
  INITIAL_FIRST_AID_ARTICLES,
  INITIAL_APPOINTMENTS,
  INITIAL_USERS
} from '../services/mockData';
import { db } from '../services/firebase';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

interface AppContextType {
  medicalProfile: MedicalProfile;
  updateMedicalProfile: (updated: Partial<MedicalProfile>) => void;
  hospitals: Hospital[];
  addHospital: (hospital: Omit<Hospital, 'hospitalId' | 'createdAt' | 'updatedAt'>) => void;
  doctors: DoctorProfile[];
  addRegisteredDoctor: (doctor: DoctorProfile) => void;
  verifyDoctor: (doctorId: string, status: 'verified' | 'rejected' | 'suspended') => void;
  appointments: Appointment[];
  bookAppointment: (
    patientId: string,
    patientName: string,
    doctorId: string,
    doctorName: string,
    specialization: string,
    date: string,
    startTime: string,
    endTime: string,
    type: 'in_person' | 'video',
    reason: string,
    patientCondition?: string
  ) => { success: boolean; error?: string; appointment?: Appointment };
  updateAppointmentStatus: (appointmentId: string, status: Appointment['status'], notes?: string) => void;
  users: User[];
  updateUserRole: (uid: string, role: UserRole) => void;
  updateUserStatus: (uid: string, status: 'active' | 'suspended') => void;
  updateUserDetails: (uid: string, updates: Partial<User>) => void;
  deleteUser: (uid: string) => void;
  addUser: (user: User) => void;
  firstAidArticles: FirstAidArticle[];
  activeArticle: FirstAidArticle | null;
  setActiveArticle: (article: FirstAidArticle | null) => void;
  chatMessages: AIChatMessage[];
  addChatMessage: (msg: AIChatMessage) => void;
  clearChatHistory: () => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, targetType: string, targetId: string, metadata?: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Medical Profile state
  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile>(() => {
    const saved = localStorage.getItem('first_aid_med_profile');
    return saved ? JSON.parse(saved) : INITIAL_MEDICAL_PROFILE;
  });

  // Users state (for Admin management)
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('first_aid_all_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Hospitals state
  const [hospitals, setHospitals] = useState<Hospital[]>(() => {
    const saved = localStorage.getItem('first_aid_hospitals');
    return saved ? JSON.parse(saved) : INITIAL_HOSPITALS;
  });

  // Doctors state
  const [doctors, setDoctors] = useState<DoctorProfile[]>(() => {
    const saved = localStorage.getItem('first_aid_doctors');
    return saved ? JSON.parse(saved) : INITIAL_DOCTORS;
  });

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('first_aid_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  // First Aid articles state
  const [firstAidArticles] = useState<FirstAidArticle[]>(INITIAL_FIRST_AID_ARTICLES);
  const [activeArticle, setActiveArticle] = useState<FirstAidArticle | null>(null);

  // Chat Messages state
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>(() => {
    return [
      {
        id: 'msg_welcome',
        sender: 'ai',
        message: 'Hello! I am First Aid Hospital AI Assistant (supported by Gemini & OpenAI). Describe any medical situation or first-aid question to get immediate safety steps.',
        timestamp: new Date().toISOString()
      }
    ];
  });

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      notificationId: 'notif_welcome',
      userId: 'all',
      title: 'Welcome to First Aid Hospital',
      body: 'Explore our AI safety assistant, 24/7 hospital discovery map, and verified doctors.',
      type: 'general',
      read: false,
      createdAt: new Date().toISOString()
    }
  ]);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      logId: 'log_01',
      actorId: 'admin_001',
      actorRole: 'admin',
      action: 'DOCTOR_VERIFIED',
      targetType: 'DoctorProfile',
      targetId: 'doc_101',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      metadata: { doctorName: 'Dr. Rajesh Sharma', verifiedBy: 'System Admin' }
    }
  ]);

  // Firestore Real-Time Listener Sync
  useEffect(() => {
    if (!db) return;

    // Sync appointments from Firestore
    try {
      const unsubApts = onSnapshot(
        collection(db, 'appointments'),
        (snap) => {
          if (!snap.empty) {
            const list: Appointment[] = [];
            snap.forEach(docSnap => list.push(docSnap.data() as Appointment));
            setAppointments(prev => {
              const merged = [...list];
              prev.forEach(p => {
                if (!merged.some(m => m.appointmentId === p.appointmentId)) {
                  merged.push(p);
                }
              });
              return merged;
            });
          }
        },
        (err) => {
          console.warn('Firestore appointments listener note:', err.message);
        }
      );

      // Sync doctors from Firestore
      const unsubDocs = onSnapshot(
        collection(db, 'doctors'),
        (snap) => {
          if (!snap.empty) {
            const list: DoctorProfile[] = [];
            snap.forEach(docSnap => list.push(docSnap.data() as DoctorProfile));
            setDoctors(prev => {
              const merged = [...list];
              prev.forEach(p => {
                if (!merged.some(m => m.doctorId === p.doctorId)) {
                  merged.unshift(p);
                }
              });
              return merged;
            });
          }
        },
        (err) => {
          console.warn('Firestore doctors listener note:', err.message);
        }
      );

      // Sync users from Firestore
      const unsubUsers = onSnapshot(
        collection(db, 'users'),
        (snap) => {
          if (!snap.empty) {
            const list: User[] = [];
            snap.forEach(docSnap => list.push(docSnap.data() as User));
            setUsers(prev => {
              const merged = [...list];
              prev.forEach(p => {
                if (!merged.some(m => m.uid === p.uid)) {
                  merged.push(p);
                }
              });
              return merged;
            });
          }
        },
        (err) => {
          console.warn('Firestore users listener note:', err.message);
        }
      );

      return () => {
        unsubApts();
        unsubDocs();
        unsubUsers();
      };
    } catch (err) {
      console.warn('Firestore real-time sync listener note:', err);
    }
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('first_aid_med_profile', JSON.stringify(medicalProfile));
  }, [medicalProfile]);

  useEffect(() => {
    localStorage.setItem('first_aid_hospitals', JSON.stringify(hospitals));
  }, [hospitals]);

  useEffect(() => {
    localStorage.setItem('first_aid_doctors', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('first_aid_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('first_aid_all_users', JSON.stringify(users));
  }, [users]);

  // Admin User Account Management Handlers
  const updateUserRole = (uid: string, role: UserRole) => {
    setUsers(prev =>
      prev.map(u => (u.uid === uid ? { ...u, role, updatedAt: new Date().toISOString() } : u))
    );
    addAuditLog('USER_ROLE_UPDATED', 'User', uid, { role });
    if (db) {
      updateDoc(doc(db, 'users', uid), { role, updatedAt: new Date().toISOString() }).catch(e =>
        console.warn('Firestore user role update note:', e)
      );
    }
  };

  const updateUserStatus = (uid: string, status: 'active' | 'suspended') => {
    setUsers(prev =>
      prev.map(u => (u.uid === uid ? { ...u, status, updatedAt: new Date().toISOString() } : u))
    );
    addAuditLog('USER_STATUS_UPDATED', 'User', uid, { status });
    if (db) {
      updateDoc(doc(db, 'users', uid), { status, updatedAt: new Date().toISOString() }).catch(e =>
        console.warn('Firestore user status update note:', e)
      );
    }
  };

  const updateUserDetails = (uid: string, updates: Partial<User>) => {
    setUsers(prev =>
      prev.map(u => (u.uid === uid ? { ...u, ...updates, updatedAt: new Date().toISOString() } : u))
    );
    addAuditLog('USER_DETAILS_UPDATED', 'User', uid, updates);
    if (db) {
      updateDoc(doc(db, 'users', uid), { ...updates, updatedAt: new Date().toISOString() }).catch(e =>
        console.warn('Firestore user details update note:', e)
      );
    }
  };

  const deleteUser = (uid: string) => {
    setUsers(prev => prev.filter(u => u.uid !== uid));
    addAuditLog('USER_DELETED', 'User', uid);
    if (db) {
      deleteDoc(doc(db, 'users', uid)).catch(e => console.warn('Firestore delete user note:', e));
    }
  };

  const addUser = (newUser: User) => {
    setUsers(prev => [newUser, ...prev.filter(u => u.uid !== newUser.uid)]);
    addAuditLog('USER_CREATED', 'User', newUser.uid, { email: newUser.email, role: newUser.role });
    if (db) {
      setDoc(doc(db, 'users', newUser.uid), newUser).catch(e => console.warn('Firestore add user note:', e));
    }
  };

  const addAuditLog = (action: string, targetType: string, targetId: string, metadata?: any) => {
    const newLog: AuditLog = {
      logId: `log_${Date.now()}`,
      actorId: 'current_user',
      actorRole: 'patient',
      action,
      targetType,
      targetId,
      timestamp: new Date().toISOString(),
      metadata
    };
    setAuditLogs(prev => [newLog, ...prev]);

    if (db) {
      setDoc(doc(db, 'auditLogs', newLog.logId), newLog).catch((e) => console.warn('Firestore log write note:', e));
    }
  };

  const updateMedicalProfile = (updated: Partial<MedicalProfile>) => {
    setMedicalProfile(prev => {
      const next = { ...prev, ...updated, updatedAt: new Date().toISOString() };
      if (db && next.patientUid) {
        setDoc(doc(db, 'medicalProfiles', next.patientUid), next).catch((e) => console.warn('Firestore profile write note:', e));
      }
      return next;
    });
    addAuditLog('MEDICAL_PROFILE_UPDATED', 'MedicalProfile', medicalProfile.patientUid);
  };

  const addRegisteredDoctor = (doctor: DoctorProfile) => {
    setDoctors((prev) => [doctor, ...prev.filter(d => d.doctorId !== doctor.doctorId)]);
    if (db) {
      setDoc(doc(db, 'doctors', doctor.doctorId), doctor).catch((e) => console.warn('Firestore doctor write note:', e));
    }
  };

  const addHospital = (hospitalData: Omit<Hospital, 'hospitalId' | 'createdAt' | 'updatedAt'>) => {
    const newHosp: Hospital = {
      ...hospitalData,
      hospitalId: `hosp_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setHospitals(prev => [newHosp, ...prev]);
    addAuditLog('HOSPITAL_ADDED', 'Hospital', newHosp.hospitalId, { name: newHosp.name });

    if (db) {
      setDoc(doc(db, 'hospitals', newHosp.hospitalId), newHosp).catch((e) => console.warn('Firestore hospital write note:', e));
    }
  };

  const verifyDoctor = (doctorId: string, status: 'verified' | 'rejected' | 'suspended') => {
    setDoctors(prev =>
      prev.map(d => (d.doctorId === doctorId ? { ...d, verificationStatus: status, licenseStatus: status } : d))
    );
    addAuditLog('DOCTOR_VERIFICATION_CHANGED', 'DoctorProfile', doctorId, { status });

    if (db) {
      updateDoc(doc(db, 'doctors', doctorId), { verificationStatus: status, licenseStatus: status }).catch((e) => console.warn('Firestore doctor update note:', e));
    }
  };

  // Double-booking prevention algorithm & Patient Condition attachment
  const bookAppointment = (
    patientId: string,
    patientName: string,
    doctorId: string,
    doctorName: string,
    specialization: string,
    date: string,
    startTime: string,
    endTime: string,
    type: 'in_person' | 'video',
    reason: string,
    patientCondition?: string
  ): { success: boolean; error?: string; appointment?: Appointment } => {
    const existingConflict = appointments.find(apt =>
      apt.doctorId === doctorId &&
      apt.appointmentDate === date &&
      apt.startTime === startTime &&
      apt.status !== 'cancelled' &&
      apt.status !== 'rejected'
    );

    if (existingConflict) {
      return {
        success: false,
        error: `Double-Booking Prevented: Dr. ${doctorName} already has an active appointment at ${startTime} on ${date}. Please select a different time slot.`
      };
    }

    const docRef = doctors.find(d => d.doctorId === doctorId);

    const conditionText = patientCondition || (medicalProfile.medicalConditions.length > 0
      ? medicalProfile.medicalConditions.join(', ')
      : 'General Consultation');

    const newApt: Appointment = {
      appointmentId: `apt_${Date.now()}`,
      patientId,
      patientName,
      patientCondition: conditionText,
      patientBloodGroup: medicalProfile.bloodGroup,
      patientAllergies: medicalProfile.allergies,
      patientMedications: medicalProfile.medications,
      doctorId,
      doctorName,
      doctorSpecialization: specialization,
      hospitalName: docRef?.hospitalName || 'Main Hospital Facility',
      appointmentDate: date,
      startTime,
      endTime,
      type,
      status: 'requested', // Sent to doctor for approval!
      reason,
      meetingId: type === 'video' ? `meet_aid_${Date.now().toString(36)}` : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAppointments(prev => [newApt, ...prev]);

    // Send Real-Time Notification to Patient & Doctor
    const newNotif: NotificationItem = {
      notificationId: `notif_${Date.now()}`,
      userId: patientId,
      title: 'Appointment Request Submitted',
      body: `Your request with Dr. ${doctorName} for ${date} at ${startTime} has been sent and is awaiting approval.`,
      type: 'appointment_update',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    addAuditLog('APPOINTMENT_REQUESTED', 'Appointment', newApt.appointmentId, {
      doctorId,
      date,
      time: startTime,
      condition: conditionText
    });

    if (db) {
      setDoc(doc(db, 'appointments', newApt.appointmentId), newApt).catch((e) => console.warn('Firestore appointment write note:', e));
      setDoc(doc(db, 'notifications', newNotif.notificationId), newNotif).catch((e) => console.warn('Firestore notif write note:', e));
    }

    return { success: true, appointment: newApt };
  };

  const updateAppointmentStatus = (
    appointmentId: string,
    status: Appointment['status'],
    notes?: string
  ) => {
    let affectedAppointment: Appointment | undefined;

    setAppointments(prev =>
      prev.map(apt => {
        if (apt.appointmentId === appointmentId) {
          affectedAppointment = {
            ...apt,
            status,
            consultationNotes: notes || apt.consultationNotes,
            updatedAt: new Date().toISOString()
          };
          return affectedAppointment;
        }
        return apt;
      })
    );

    // If accepted or rejected, create an alert notification for the patient
    if (status === 'confirmed' || status === 'rejected') {
      const statusText = status === 'confirmed' ? 'Accepted & Confirmed' : 'Declined';
      const notifBody = status === 'confirmed'
        ? `Dr. has confirmed your appointment for ${affectedAppointment?.appointmentDate || 'scheduled date'}. ${affectedAppointment?.type === 'video' ? 'Video consultation room is ready!' : ''}`
        : `Your appointment request was declined: ${notes || 'Doctor unavailable at that time slot'}.`;

      const notifItem: NotificationItem = {
        notificationId: `notif_${Date.now()}`,
        userId: affectedAppointment?.patientId || 'patient',
        title: `Appointment ${statusText}`,
        body: notifBody,
        type: 'appointment_update',
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications(prev => [notifItem, ...prev]);

      if (db) {
        setDoc(doc(db, 'notifications', notifItem.notificationId), notifItem).catch(() => null);
      }
    }

    addAuditLog('APPOINTMENT_STATUS_UPDATED', 'Appointment', appointmentId, { status, notes });

    if (db) {
      updateDoc(doc(db, 'appointments', appointmentId), {
        status,
        consultationNotes: notes || '',
        updatedAt: new Date().toISOString()
      }).catch((e) => console.warn('Firestore apt status update note:', e));
    }
  };

  const addChatMessage = (msg: AIChatMessage) => {
    setChatMessages(prev => [...prev, msg]);
  };

  const clearChatHistory = () => {
    setChatMessages([
      {
        id: 'msg_welcome',
        sender: 'ai',
        message: 'Chat history cleared. How can I assist you with first-aid or medical guidance today?',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.notificationId === id ? { ...n, read: true } : n)));
  };

  return (
    <AppContext.Provider
      value={{
        medicalProfile,
        updateMedicalProfile,
        hospitals,
        addHospital,
        doctors,
        addRegisteredDoctor,
        verifyDoctor,
        appointments,
        bookAppointment,
        updateAppointmentStatus,
        users,
        updateUserRole,
        updateUserStatus,
        updateUserDetails,
        deleteUser,
        addUser,
        firstAidArticles,
        activeArticle,
        setActiveArticle,
        chatMessages,
        addChatMessage,
        clearChatHistory,
        notifications,
        markNotificationRead,
        auditLogs,
        addAuditLog
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
