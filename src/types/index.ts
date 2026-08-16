export type UserRole = 'patient' | 'doctor' | 'medical_staff' | 'admin';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type EmergencySeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';

export type LicenseStatus = 'pending' | 'under_review' | 'verified' | 'rejected' | 'suspended';

export type AppointmentStatus = 'requested' | 'confirmed' | 'rejected' | 'cancelled' | 'completed' | 'no_show';

export type ConsultationType = 'in_person' | 'video';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  photoUrl?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface PatientProfile {
  uid: string;
  dateOfBirth?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  contactNumber?: string;
  address?: string;
  emergencyContact: EmergencyContact;
  profilePhoto?: string;
  shareProfileWithDoctor: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalProfile {
  patientUid: string;
  bloodGroup: BloodGroup;
  allergies: string[];
  medicalConditions: string[];
  medications: string[];
  surgeries: string[];
  importantNotes?: string;
  updatedAt: string;
}

export interface DoctorProfile {
  doctorId: string;
  userId: string;
  name: string;
  photoUrl: string;
  specialization: string;
  subSpecialization?: string;
  licenseNumber: string;
  licenseStatus: LicenseStatus;
  education: {
    degree: string;
    university: string;
    year: number;
  }[];
  experienceYears: number;
  hospitalIds: string[];
  hospitalName?: string;
  professionalEmail: string;
  professionalPhone: string;
  bio: string;
  consultationFee: number;
  rating: number;
  reviewsCount: number;
  verificationDocumentUrl?: string;
  verificationStatus: LicenseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Hospital {
  hospitalId: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  emergencyPhone: string;
  emergencyAvailable: boolean;
  services: string[];
  departments: string[];
  imageUrls: string[];
  rating: number;
  distanceKm?: number;
  verificationStatus: 'verified' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  slotId: string;
  doctorId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:00"
  consultationType: ConsultationType;
  active: boolean;
}

export interface Appointment {
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  hospitalId?: string;
  hospitalName?: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string;      // HH:mm
  endTime: string;        // HH:mm
  type: ConsultationType;
  reason: string;
  status: AppointmentStatus;
  meetingId?: string;
  consultationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirstAidArticle {
  articleId: string;
  title: string;
  slug: string;
  category: 'Emergency' | 'Injury' | 'Environmental' | 'Animal/Bite';
  emergencyLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  summary: string;
  warningSigns: string[];
  immediateSteps: string[];
  doNot: string[];
  whenToSeekHelp: string[];
  reviewedBy: string;
  reviewStatus: 'Medically Reviewed' | 'Pending Review';
  version: string;
  iconName: string;
  updatedAt: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  message: string;
  model?: 'Gemini' | 'OpenAI';
  severity?: EmergencySeverity;
  emergency?: boolean;
  suggestedActions?: {
    label: string;
    action: 'call_emergency' | 'find_hospital' | 'call_contact' | 'read_first_aid';
    target?: string;
  }[];
  steps?: string[];
  avoid?: string[];
  timestamp: string;
}

export interface AIChatConversation {
  conversationId: string;
  userId: string;
  title: string;
  emergencyLevel: EmergencySeverity;
  modelProvider: 'Gemini' | 'OpenAI';
  messages: AIChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  logId: string;
  actorId: string;
  actorRole: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface NotificationItem {
  notificationId: string;
  userId: string;
  type: 'appointment_update' | 'doctor_verified' | 'ai_safety_warning' | 'general';
  title: string;
  body: string;
  referenceId?: string;
  read: boolean;
  createdAt: string;
}
