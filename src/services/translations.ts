export type Language = 'en' | 'mr';

export interface Translations {
  // Common & Branding
  appName: string;
  pwaApp: string;
  sosEmergency: string;
  sosEmergencyCall: string;
  available247: string;
  signInRegister: string;
  signOut: string;
  settingsAndPrivacy: string;
  privacyHipaa: string;
  role: string;
  patient: string;
  doctor: string;
  admin: string;
  patientAccount: string;
  doctorAccount: string;
  adminAccount: string;
  language: string;
  english: string;
  marathi: string;

  // Nav Groups & Tabs
  coreServices: string;
  clinicalNetwork: string;
  professional: string;
  systemOperations: string;
  homeTriage: string;
  firstAidGuides: string;
  aiEmergencyAssistant: string;
  nearbyHospitalsMap: string;
  findSpecialistDoctors: string;
  appointmentsConsults: string;
  doctorClinicalPortal: string;
  adminOperationsConsole: string;

  // Emergency Banner
  emergencyBannerTitle: string;
  emergencyBannerText: string;
  findEmergencyCare: string;

  // Profile Modal
  patientMedicalProfile: string;
  profileModalSubtitle: string;
  languagePreference: string;
  bloodGroup: string;
  knownAllergies: string;
  addAllergyPlaceholder: string;
  medicalConditions: string;
  addConditionPlaceholder: string;
  currentMedications: string;
  addMedicationPlaceholder: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  doctorAccessAuth: string;
  doctorAccessDesc: string;
  addBtn: string;
  cancelBtn: string;
  saveProfileBtn: string;
  profileSavedSuccess: string;

  // Dashboard / Quick Actions
  welcomeBack: string;
  patientPortalTitle: string;
  emergencyTriagePrompt: string;
  quickActions: string;
  callAmbulance: string;
  findHospitalNearby: string;
  askAiAssistant: string;
  bookSpecialist: string;
  myActiveAppointments: string;
  verifiedGuides: string;
  medicalProfileSummary: string;
  viewEditProfile: string;
  noActiveAppointments: string;
  joinVideoCall: string;
  consultationHistory: string;

  // Appointments
  appointmentHistoryTitle: string;
  appointmentHistoryDesc: string;
  confirmed: string;
  completed: string;
  pending: string;
  cancelled: string;

  // AI Assistant
  aiTitle: string;
  aiSubtitle: string;
  aiPlaceholder: string;
  aiDisclaimer: string;
  sendBtn: string;
  clearChat: string;
  criticalAlert: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Common & Branding
    appName: 'First Aid Hospital',
    pwaApp: 'PWA Emergency App',
    sosEmergency: 'SOS Emergency',
    sosEmergencyCall: 'SOS Emergency Call',
    available247: '24/7',
    signInRegister: 'Sign In / Register',
    signOut: 'Sign Out',
    settingsAndPrivacy: 'Settings & Privacy',
    privacyHipaa: 'Privacy & HIPAA Export',
    role: 'Role:',
    patient: 'Patient',
    doctor: 'Doctor',
    admin: 'Admin',
    patientAccount: 'Patient Account',
    doctorAccount: 'Doctor Account',
    adminAccount: 'Admin Account',
    language: 'Language',
    english: 'English',
    marathi: 'मराठी (Marathi)',

    // Nav Groups & Tabs
    coreServices: 'Core Services',
    clinicalNetwork: 'Clinical Network',
    professional: 'Professional',
    systemOperations: 'System Operations',
    homeTriage: 'Home & Triage',
    firstAidGuides: 'First Aid Guides',
    aiEmergencyAssistant: 'AI Emergency Assistant',
    nearbyHospitalsMap: 'Nearby Hospitals Map',
    findSpecialistDoctors: 'Find Specialist Doctors',
    appointmentsConsults: 'Appointments & Consults',
    doctorClinicalPortal: 'Doctor Clinical Portal',
    adminOperationsConsole: 'Admin Operations Console',

    // Emergency Banner
    emergencyBannerTitle: 'Critical Emergency Advisory',
    emergencyBannerText: 'If you or someone nearby is experiencing a life-threatening medical emergency (cardiac arrest, severe trauma, unconsciousness), call 112 / 108 immediately.',
    findEmergencyCare: 'Find 24/7 Emergency ER',

    // Profile Modal
    patientMedicalProfile: 'Patient Medical Profile',
    profileModalSubtitle: 'Update blood group, allergies, conditions & language preferences',
    languagePreference: 'Preferred Language / भाषा निवड',
    bloodGroup: 'Blood Group (Critical)',
    knownAllergies: 'Known Allergies (Drug / Food / Environmental)',
    addAllergyPlaceholder: 'e.g. Penicillin, Peanuts, Latex...',
    medicalConditions: 'Medical Conditions & Illnesses',
    addConditionPlaceholder: 'e.g. Mild Asthma, Hypertension...',
    currentMedications: 'Current Medications',
    addMedicationPlaceholder: 'e.g. Albuterol Inhaler, Insulin...',
    emergencyContactName: 'Emergency Contact Name',
    emergencyContactPhone: 'Emergency Contact Phone',
    doctorAccessAuth: 'Doctor Access Authorization',
    doctorAccessDesc: 'Allow booked doctors to view blood group, allergies, and emergency contact during consultations.',
    addBtn: 'Add',
    cancelBtn: 'Cancel',
    saveProfileBtn: 'Save Medical Profile',
    profileSavedSuccess: 'Medical profile saved successfully!',

    // Dashboard / Quick Actions
    welcomeBack: 'Welcome back,',
    patientPortalTitle: 'Emergency Care & Health Dashboard',
    emergencyTriagePrompt: 'Need instant medical guidance? Choose an emergency action below or chat with our 24/7 AI.',
    quickActions: 'Emergency Quick Actions',
    callAmbulance: 'Call Ambulance 108',
    findHospitalNearby: 'Find Nearest ER Hospital',
    askAiAssistant: 'Ask AI Emergency Assistant',
    bookSpecialist: 'Book Verified Specialist',
    myActiveAppointments: 'My Upcoming Consultations',
    verifiedGuides: 'Verified First Aid Guides',
    medicalProfileSummary: 'Emergency Medical ID',
    viewEditProfile: 'Edit Medical Profile',
    noActiveAppointments: 'No upcoming appointments scheduled.',
    joinVideoCall: 'Join Video Call',
    consultationHistory: 'Consultation History',

    // Appointments
    appointmentHistoryTitle: 'My Appointments History & Video Calls',
    appointmentHistoryDesc: 'Track confirmed hospital appointments and join scheduled telemedicine video consultations.',
    confirmed: 'Confirmed',
    completed: 'Completed',
    pending: 'Pending',
    cancelled: 'Cancelled',

    // AI Assistant
    aiTitle: 'AI Emergency Medical Assistant',
    aiSubtitle: 'Instant first-aid triage, symptom guidance & emergency steps (Gemini & OpenAI supported)',
    aiPlaceholder: 'Describe symptoms or emergency (e.g. "Severe burn on arm", "Snake bite first aid")...',
    aiDisclaimer: 'AI guidance is for informational and emergency first-aid support. In life-threatening emergencies, call emergency services immediately.',
    sendBtn: 'Send',
    clearChat: 'Clear Chat',
    criticalAlert: 'Critical Alert'
  },
  mr: {
    // Common & Branding
    appName: 'फर्स्ट एड हॉस्पिटल (First Aid)',
    pwaApp: 'आपत्कालीन आरोग्य ॲप',
    sosEmergency: 'एसओएस आणीबाणी (SOS)',
    sosEmergencyCall: 'एसओएस आणीबाणी कॉल',
    available247: '२४/७ सेवा',
    signInRegister: 'साइन इन / नोंदणी करा',
    signOut: 'बाहेर पडा (Sign Out)',
    settingsAndPrivacy: 'सेटिंग्ज आणि गोपनीयता',
    privacyHipaa: 'गोपनीयता आणि डेटा सुरक्षा',
    role: 'भूमिका (Role):',
    patient: 'रुग्ण (Patient)',
    doctor: 'डॉक्टर (Doctor)',
    admin: 'प्रशासक (Admin)',
    patientAccount: 'रुग्ण खाते',
    doctorAccount: 'डॉक्टर खाते',
    adminAccount: 'प्रशासक खाते',
    language: 'भाषा (Language)',
    english: 'English (इंग्रजी)',
    marathi: 'मराठी (Marathi)',

    // Nav Groups & Tabs
    coreServices: 'मुख्य सेवा',
    clinicalNetwork: 'वैद्यकीय नेटवर्क',
    professional: 'व्यावसायिक',
    systemOperations: 'प्रणाली व्यवस्थापन',
    homeTriage: 'मुख्यपृष्ठ आणि तपासणी',
    firstAidGuides: 'प्रथमोपचार मार्गदर्शिका',
    aiEmergencyAssistant: 'एआय आणीबाणी सहाय्यक',
    nearbyHospitalsMap: 'जवळपासची रुग्णालये नकाशा',
    findSpecialistDoctors: 'तज्ज्ञ डॉक्टर शोधा',
    appointmentsConsults: 'अपॉइंटमेंट्स आणि सल्ला',
    doctorClinicalPortal: 'डॉक्टर क्लिनिकल पोर्टल',
    adminOperationsConsole: 'प्रशासक ऑपरेशन्स',

    // Emergency Banner
    emergencyBannerTitle: 'महत्त्वाची आणीबाणी सूचना',
    emergencyBannerText: 'आपण किंवा आपल्या जवळ कोणीही जीवघेण्या वैद्यकीय आणीबाणीत असल्यास (हृदयविकाराचा झटका, गंभीर दुखापत, बेशुद्धी), त्वरित 112 / 108 वर कॉल करा.',
    findEmergencyCare: '२४/७ आपत्कालीन रुग्णालय शोधा',

    // Profile Modal
    patientMedicalProfile: 'रुग्णाची वैद्यकीय प्रोफाईल',
    profileModalSubtitle: 'रक्तगट, ॲलर्जी, आजार आणि भाषा प्राधान्ये अद्ययावत करा',
    languagePreference: 'पसंतीची भाषा (Preferred Language)',
    bloodGroup: 'रक्तगट (Blood Group - अत्यंत महत्त्वाचे)',
    knownAllergies: 'ज्ञात ॲलर्जी (औषधे / अन्न / इतर)',
    addAllergyPlaceholder: 'उदा. पेनिसिलिन, शेंगदाणे, लेटेक्स...',
    medicalConditions: 'दीर्घकालीन आजार आणि स्थिती',
    addConditionPlaceholder: 'उदा. दमा (Asthma), उच्च रक्तदाब (BP)...',
    currentMedications: 'सध्या चालू असलेली औषधे',
    addMedicationPlaceholder: 'उदा. इनहेलर, इन्सुलिन...',
    emergencyContactName: 'आपत्कालीन संपर्क व्यक्तीचे नाव',
    emergencyContactPhone: 'आपत्कालीन संपर्क फोन नंबर',
    doctorAccessAuth: 'डॉक्टर प्रवेश परवानगी',
    doctorAccessDesc: 'तपासणी दरम्यान डॉक्टरांना आपला रक्तगट, ॲलर्जी आणि आपत्कालीन संपर्क पाहण्याची परवानगी द्या.',
    addBtn: 'जोडा (+)',
    cancelBtn: 'रद्द करा',
    saveProfileBtn: 'प्रोफाईल जतन करा',
    profileSavedSuccess: 'वैद्यकीय प्रोफाईल यशस्वीरित्या जतन केली!',

    // Dashboard / Quick Actions
    welcomeBack: 'स्वागत आहे,',
    patientPortalTitle: 'आपत्कालीन मदत आणि आरोग्य डॅशबोर्ड',
    emergencyTriagePrompt: 'त्वरित वैद्यकीय मार्गदर्शनाची गरज आहे का? खालीलपैकी एक पर्याय निवडा किंवा २४/७ एआय सोबत बोला.',
    quickActions: 'त्वरित आपत्कालीन कृती',
    callAmbulance: 'रुग्णवाहिका बोलवा (108)',
    findHospitalNearby: 'जवळचे आपत्कालीन रुग्णालय शोधा',
    askAiAssistant: 'एआय आणीबाणी सहाय्यक',
    bookSpecialist: 'तज्ज्ञ डॉक्टरांची अपॉइंटमेंट घ्या',
    myActiveAppointments: 'माझ्या आगामी अपॉइंटमेंट्स',
    verifiedGuides: 'प्रमाणित प्रथमोपचार मार्गदर्शिका',
    medicalProfileSummary: 'आपत्कालीन वैद्यकीय ओळख (Medical ID)',
    viewEditProfile: 'प्रोफाईल संपादित करा',
    noActiveAppointments: 'कोणत्याही आगामी अपॉइंटमेंट्स नाहीत.',
    joinVideoCall: 'व्हिडिओ कॉल सुरू करा',
    consultationHistory: 'मागील सल्ला इतिहास',

    // Appointments
    appointmentHistoryTitle: 'माझ्या अपॉइंटमेंट्स आणि व्हिडिओ कॉल्स',
    appointmentHistoryDesc: 'निश्चित केलेल्या रुग्णालयातील भेटींचा मागोवा घ्या आणि टेलिमेडिसिन व्हिडिओ सल्ला घ्या.',
    confirmed: 'निश्चित (Confirmed)',
    completed: 'पूर्ण (Completed)',
    pending: 'प्रलंबित (Pending)',
    cancelled: 'रद्द (Cancelled)',

    // AI Assistant
    aiTitle: 'एआय आणीबाणी वैद्यकीय सहाय्यक',
    aiSubtitle: 'त्वरित प्रथमोपचार, लक्षणांचे विश्लेषण आणि आपत्कालीन मार्गदर्शन (Gemini आणि OpenAI द्वारे)',
    aiPlaceholder: 'लक्षणे किंवा आणीबाणीचे वर्णन करा (उदा. "हाताला भाजले आहे", "साप चावल्यावर प्रथमोपचार")...',
    aiDisclaimer: 'एआय मार्गदर्शन केवळ प्रथमोपचार मदतीसाठी आहे. गंभीर आणीबाणीत तात्काळ डॉक्टरांशी किंवा 108 वर संपर्क साधा.',
    sendBtn: 'पाठवा',
    clearChat: 'चॅट साफ करा',
    criticalAlert: 'अतिमहत्त्वाची आणीबाणी सूचना'
  }
};
