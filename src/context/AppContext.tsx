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
        severity: 'LOW',
        model: 'Gemini',
        suggestedActions: [
          { label: '❤️ CPR Instructions', action: 'read_first_aid', target: 'fa_cpr' },
          { label: '🐍 Snake Bite Protocol', action: 'read_first_aid', target: 'fa_snake_bite' },
          { label: '🔥 Thermal Burns', action: 'read_first_aid', target: 'fa_burns' },
          { label: '📍 Find Nearby ER', action: 'find_hospital' }
        ],
        timestamp: new Date().toISOString()
      }
    ];
  });

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      notificationId: 'notif_1',
      userId: 'pat_001',
      type: 'appointment_update',
      title: 'Appointment Confirmed',
      body: 'Your video consultation with Dr. Rajesh Sharma is confirmed for today at 3:00 PM.',
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

  const updateMedicalProfile = (updated: Partial<MedicalProfile>) => {
    setMedicalProfile(prev => ({
      ...prev,
      ...updated,
      updatedAt: new Date().toISOString()
    }));
    addAuditLog('MEDICAL_PROFILE_UPDATED', 'MedicalProfile', medicalProfile.patientUid);
  };

  const addRegisteredDoctor = (doctor: DoctorProfile) => {
    setDoctors((prev) => [doctor, ...prev.filter(d => d.doctorId !== doctor.doctorId)]);
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
  };

  const verifyDoctor = (doctorId: string, status: 'verified' | 'rejected' | 'suspended') => {
    setDoctors(prev =>
      prev.map(d => (d.doctorId === doctorId ? { ...d, verificationStatus: status, licenseStatus: status } : d))
    );
    addAuditLog('DOCTOR_VERIFICATION_CHANGED', 'DoctorProfile', doctorId, { status });
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
    // Check if slot is already booked for this doctor
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

    const doc = doctors.find(d => d.doctorId === doctorId);

    const newApt: Appointment = {
      appointmentId: `apt_${Date.now()}`,
      patientId,
      patientName,
      doctorId,
      doctorName,
      doctorSpecialization: specialization,
      hospitalName: doc?.hospitalName || 'Main Hospital',
      appointmentDate: date,
      startTime,
      endTime,
      type,
      reason,
      status: 'confirmed',
      meetingId: type === 'video' ? `meet_room_${Date.now().toString(36)}` : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAppointments(prev => [newApt, ...prev]);

    // Send Notification to patient
    setNotifications(prev => [
      {
        notificationId: `notif_${Date.now()}`,
        userId: patientId,
        type: 'appointment_update',
        title: 'Appointment Booked Successfully',
        body: `Your ${type === 'video' ? 'Video' : 'In-Person'} appointment with ${doctorName} is confirmed for ${date} at ${startTime}.`,
        referenceId: newApt.appointmentId,
        read: false,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);

    addAuditLog('APPOINTMENT_CREATED', 'Appointment', newApt.appointmentId, {
      patientId,
      doctorId,
      date,
      startTime
    });

    return { success: true, appointment: newApt };
  };

  const updateAppointmentStatus = (appointmentId: string, status: Appointment['status'], notes?: string) => {
    setAppointments(prev =>
      prev.map(apt => (apt.appointmentId === appointmentId ? {
        ...apt,
        status,
        consultationNotes: notes !== undefined ? notes : apt.consultationNotes,
        updatedAt: new Date().toISOString()
      } : apt))
    );
    addAuditLog('APPOINTMENT_STATUS_CHANGED', 'Appointment', appointmentId, { status });
  };

  const addChatMessage = (msg: AIChatMessage) => {
    setChatMessages(prev => [...prev, msg]);
  };

  const clearChatHistory = () => {
    setChatMessages([]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.notificationId === id ? { ...n, read: true } : n)));
  };

  const addAuditLog = (action: string, targetType: string, targetId: string, metadata?: any) => {
    const newLog: AuditLog = {
      logId: `log_${Date.now()}`,
      actorId: 'system_user',
      actorRole: 'patient',
      action,
      targetType,
      targetId,
      timestamp: new Date().toISOString(),
      metadata
    };
    setAuditLogs(prev => [newLog, ...prev]);
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
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
