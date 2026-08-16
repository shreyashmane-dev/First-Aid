import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  MedicalProfile,
  Hospital,
  DoctorProfile,
  Appointment,
  FirstAidArticle,
  AIChatMessage,
  AuditLog,
  NotificationItem
} from '../types';
import {
  INITIAL_MEDICAL_PROFILE,
  INITIAL_HOSPITALS,
  INITIAL_DOCTORS,
  INITIAL_FIRST_AID_ARTICLES,
  INITIAL_APPOINTMENTS
} from '../services/mockData';
import { db } from '../services/firebase';
import { collection, doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

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
    reason: string
  ) => { success: boolean; error?: string; appointment?: Appointment };
  updateAppointmentStatus: (appointmentId: string, status: Appointment['status'], notes?: string) => void;
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

      return () => {
        unsubApts();
        unsubDocs();
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

  // Double-booking prevention algorithm
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
    reason: string
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

    const newApt: Appointment = {
      appointmentId: `apt_${Date.now()}`,
      patientId,
      patientName,
      doctorId,
      doctorName,
      doctorSpecialization: specialization,
      hospitalName: docRef?.hospitalName || 'Main Hospital Facility',
      appointmentDate: date,
      startTime,
      endTime,
      type,
      status: 'confirmed',
      reason,
      meetingId: type === 'video' ? `meet_${Date.now()}` : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAppointments(prev => [newApt, ...prev]);

    // Send Real-Time Notification to Patient & Doctor
    const newNotif: NotificationItem = {
      notificationId: `notif_${Date.now()}`,
      userId: patientId,
      title: 'Appointment Confirmed',
      body: `Appointment confirmed with Dr. ${doctorName} for ${date} at ${startTime}.`,
      type: 'appointment_update',
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);

    addAuditLog('APPOINTMENT_BOOKED', 'Appointment', newApt.appointmentId, {
      doctorId,
      date,
      time: startTime
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
    setAppointments(prev =>
      prev.map(apt => {
        if (apt.appointmentId === appointmentId) {
          return {
            ...apt,
            status,
            consultationNotes: notes || apt.consultationNotes,
            updatedAt: new Date().toISOString()
          };
        }
        return apt;
      })
    );

    addAuditLog('APPOINTMENT_STATUS_UPDATED', 'Appointment', appointmentId, { status });

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
