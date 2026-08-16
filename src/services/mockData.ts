import type { Hospital, DoctorProfile, FirstAidArticle, Appointment, PatientProfile, MedicalProfile, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    uid: 'pat_001',
    email: 'patient@firstaidhospital.org',
    role: 'patient',
    displayName: 'Sarah Jenkins',
    phone: '+1 (555) 234-5678',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z'
  },
  {
    uid: 'doc_101_user',
    email: 'dr.sharma@firstaidhospital.org',
    role: 'doctor',
    displayName: 'Dr. Rajesh Sharma',
    phone: '+1 (555) 987-6543',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-10T09:00:00Z'
  },
  {
    uid: 'admin_001',
    email: 'admin@firstaidhospital.org',
    role: 'admin',
    displayName: 'System Admin',
    phone: '+1 (555) 111-2222',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_PATIENT_PROFILE: PatientProfile = {
  uid: 'pat_001',
  dateOfBirth: '1992-05-14',
  age: 34,
  gender: 'female',
  contactNumber: '+1 (555) 234-5678',
  address: '742 Evergreen Terrace, Sector 4, Metro City',
  emergencyContact: {
    name: 'David Jenkins (Husband)',
    relationship: 'Spouse',
    phone: '+1 (555) 876-5432'
  },
  profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  shareProfileWithDoctor: true,
  createdAt: '2026-01-15T08:00:00Z',
  updatedAt: '2026-02-10T10:00:00Z'
};

export const INITIAL_MEDICAL_PROFILE: MedicalProfile = {
  patientUid: 'pat_001',
  bloodGroup: 'O+',
  allergies: ['Penicillin', 'Peanuts', 'Latex'],
  medicalConditions: ['Mild Asthma', 'Seasonal Rhinitis'],
  medications: ['Albuterol Inhaler (as needed)', 'Cetirizine 10mg'],
  surgeries: ['Appendectomy (2018)'],
  importantNotes: 'Patient wears medical alert bracelet for Penicillin allergy. Carries epi-pen.',
  updatedAt: '2026-02-10T10:00:00Z'
};

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    hospitalId: 'hosp_01',
    name: 'City General Trauma & Emergency Center',
    description: 'Premier 24/7 level 1 trauma hospital with advanced ICU, cardiac catheterization lab, and specialized burn unit.',
    address: '100 Medical Center Blvd, Downtown',
    latitude: 28.6139,
    longitude: 77.2090,
    phone: '+1 (555) 911-0001',
    emergencyPhone: '108 / +1 (555) 911-0911',
    emergencyAvailable: true,
    services: ['24/7 Trauma Care', 'Cardiac ICU', 'Burn Unit', 'Pediatric ER', 'Snake Bite Antivenom Hub'],
    departments: ['Emergency Medicine', 'Cardiology', 'Pulmonology', 'Orthopedics', 'Toxicology'],
    imageUrls: ['https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=800&q=80'],
    rating: 4.9,
    verificationStatus: 'verified',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    hospitalId: 'hosp_02',
    name: 'St. Jude Heart & Respiratory Care Hospital',
    description: 'Specialized cardiac and pulmonary center offering 24/7 emergency balloon angioplasty and acute asthma rescue unit.',
    address: '45 Cardiac Way, West Park',
    latitude: 28.6250,
    longitude: 77.2180,
    phone: '+1 (555) 911-0002',
    emergencyPhone: '+1 (555) 911-0912',
    emergencyAvailable: true,
    services: ['24/7 Angioplasty', 'Asthma Emergency Care', 'ECMO Support', 'Tele-Consultation Clinic'],
    departments: ['Cardiology', 'Pulmonology', 'Critical Care'],
    imageUrls: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80'],
    rating: 4.8,
    verificationStatus: 'verified',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    hospitalId: 'hosp_03',
    name: 'Metropolitan Children & Specialty Hospital',
    description: 'Pediatric emergency care, choking intervention, orthopedic trauma, and general telemedicine facility.',
    address: '88 Healthcare Avenue, North Ridge',
    latitude: 28.5980,
    longitude: 77.1950,
    phone: '+1 (555) 911-0003',
    emergencyPhone: '+1 (555) 911-0913',
    emergencyAvailable: true,
    services: ['Pediatric ER', 'Choking Rescue Unit', 'Orthopedic Surgery', 'Outpatient Clinics'],
    departments: ['Pediatrics', 'ENT', 'Orthopedics', 'General Surgery'],
    imageUrls: ['https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80'],
    rating: 4.7,
    verificationStatus: 'verified',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    hospitalId: 'hosp_04',
    name: 'Apex Toxicology & Animal Bite Rescue Institute',
    description: 'National referral center equipped with specialized antivenoms for snake bites, insect toxins, and rabies treatment.',
    address: '12 Biosafety Drive, East District',
    latitude: 28.6320,
    longitude: 77.2300,
    phone: '+1 (555) 911-0004',
    emergencyPhone: '+1 (555) 911-0914',
    emergencyAvailable: true,
    services: ['Snake Bite Antivenom Bank', 'Toxicology ICU', 'Rabies Care', 'Wound Management'],
    departments: ['Toxicology', 'Emergency Medicine', 'Infectious Diseases'],
    imageUrls: ['https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=800&q=80'],
    rating: 4.9,
    verificationStatus: 'verified',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_DOCTORS: DoctorProfile[] = [
  {
    doctorId: 'doc_101',
    userId: 'doc_101_user',
    name: 'Dr. Rajesh Sharma',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    specialization: 'Cardiology',
    subSpecialization: 'Interventional Cardiology & Cardiac Emergency',
    licenseNumber: 'MD-CARDIO-889012',
    licenseStatus: 'verified',
    education: [
      { degree: 'MD Cardiology', university: 'Johns Hopkins University', year: 2012 },
      { degree: 'MBBS', university: 'AIIMS Medical College', year: 2007 }
    ],
    experienceYears: 14,
    hospitalIds: ['hosp_01', 'hosp_02'],
    hospitalName: 'St. Jude Heart & City General Center',
    professionalEmail: 'dr.sharma@firstaidhospital.org',
    professionalPhone: '+1 (555) 345-6789',
    bio: 'Board-certified cardiologist specializing in acute myocardial infarction, chest pain triage, and online video consultations.',
    consultationFee: 75,
    rating: 4.9,
    reviewsCount: 142,
    verificationDocumentUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    verificationStatus: 'verified',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z'
  },
  {
    doctorId: 'doc_102',
    userId: 'doc_102_user',
    name: 'Dr. Elena Rostova',
    photoUrl: 'https://images.unsplash.com/photo-1594824813566-88855ce78906?auto=format&fit=crop&w=400&q=80',
    specialization: 'Emergency Medicine',
    subSpecialization: 'Trauma & First-Aid Toxicology',
    licenseNumber: 'MD-EMERG-443210',
    licenseStatus: 'verified',
    education: [
      { degree: 'Residency in Emergency Medicine', university: 'Harvard Medical School', year: 2015 },
      { degree: 'MD', university: 'Stanford University', year: 2011 }
    ],
    experienceYears: 11,
    hospitalIds: ['hosp_01', 'hosp_04'],
    hospitalName: 'Apex Toxicology & City General Trauma',
    professionalEmail: 'dr.rostova@firstaidhospital.org',
    professionalPhone: '+1 (555) 456-7890',
    bio: 'Emergency care physician with decade-long experience in snake bites, burn triage, choking rescue protocols, and online urgent video consultations.',
    consultationFee: 60,
    rating: 4.8,
    reviewsCount: 98,
    verificationDocumentUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    verificationStatus: 'verified',
    createdAt: '2026-01-12T00:00:00Z',
    updatedAt: '2026-01-12T00:00:00Z'
  },
  {
    doctorId: 'doc_103',
    userId: 'doc_103_user',
    name: 'Dr. Marcus Vance',
    photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    specialization: 'Pulmonology',
    subSpecialization: 'Severe Asthma & Respiratory Emergency',
    licenseNumber: 'MD-PULMO-991122',
    licenseStatus: 'verified',
    education: [
      { degree: 'Fellowship in Pulmonary Critical Care', university: 'Mayo Clinic', year: 2016 },
      { degree: 'MD', university: 'Columbia University', year: 2012 }
    ],
    experienceYears: 10,
    hospitalIds: ['hosp_02'],
    hospitalName: 'St. Jude Heart & Respiratory Care',
    professionalEmail: 'dr.vance@firstaidhospital.org',
    professionalPhone: '+1 (555) 567-8901',
    bio: 'Expert pulmonologist focused on severe asthma attacks, chronic obstructive pulmonary diseases, and telemedicine management.',
    consultationFee: 70,
    rating: 4.9,
    reviewsCount: 115,
    verificationDocumentUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    verificationStatus: 'verified',
    createdAt: '2026-01-14T00:00:00Z',
    updatedAt: '2026-01-14T00:00:00Z'
  },
  {
    doctorId: 'doc_104',
    userId: 'doc_104_user',
    name: 'Dr. Anita Desai (Pending Verification)',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    specialization: 'Pediatrics',
    subSpecialization: 'Pediatric First Aid & Choking Intervention',
    licenseNumber: 'MD-PEDI-771100-PENDING',
    licenseStatus: 'pending',
    education: [
      { degree: 'MD Pediatrics', university: 'Boston Children’s Hospital', year: 2020 }
    ],
    experienceYears: 6,
    hospitalIds: ['hosp_03'],
    hospitalName: 'Metropolitan Children Hospital',
    professionalEmail: 'dr.anita@firstaidhospital.org',
    professionalPhone: '+1 (555) 678-9012',
    bio: 'Dedicated pediatrician specializing in infant first aid, allergic reactions, and child care.',
    consultationFee: 50,
    rating: 4.5,
    reviewsCount: 12,
    verificationDocumentUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    verificationStatus: 'pending',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z'
  }
];

export const INITIAL_FIRST_AID_ARTICLES: FirstAidArticle[] = [
  {
    articleId: 'fa_cpr',
    title: 'Cardiopulmonary Resuscitation (CPR)',
    slug: 'cpr-guidance',
    category: 'Emergency',
    emergencyLevel: 'Critical',
    summary: 'Life-saving technique used when a person’s breathing or heartbeat has stopped (unresponsive & not breathing normally).',
    warningSigns: [
      'Person is completely unresponsive when tapped on the shoulders',
      'No normal breathing (gasping or no movement of chest)',
      'No pulse felt within 10 seconds'
    ],
    immediateSteps: [
      'Call local emergency services immediately (108 / 911) or send someone to get an AED.',
      'Place the person on their back on a firm, flat surface.',
      'Place heel of one hand in the center of the chest, place other hand on top and interlock fingers.',
      'Push hard and fast in the center of the chest at a rate of 100-120 compressions per minute (to the beat of "Stayin Alive").',
      'Allow the chest to recoil fully between compressions. Continue until emergency personnel arrive or AED is ready.'
    ],
    doNot: [
      'Do not delay calling emergency services.',
      'Do not interrupt chest compressions for more than 10 seconds.',
      'Do not perform CPR if the person is conscious and breathing normally.'
    ],
    whenToSeekHelp: [
      'IMMEDIATE EMERGENCY: Call 108 / 911 before starting CPR.'
    ],
    reviewedBy: 'Dr. Elena Rostova, Board Certified Emergency Medicine',
    reviewStatus: 'Medically Reviewed',
    version: '1.2',
    iconName: 'HeartPulse',
    updatedAt: '2026-01-20T00:00:00Z'
  },
  {
    articleId: 'fa_snake_bite',
    title: 'Snake Bite Emergency Management',
    slug: 'snake-bite-first-aid',
    category: 'Animal/Bite',
    emergencyLevel: 'Critical',
    summary: 'Essential first response protocol for venomous snake bites to minimize venom spread and prevent severe tissue damage.',
    warningSigns: [
      'Two fang puncture marks with rapid swelling and skin discoloration',
      'Severe burning pain at the site of the bite',
      'Nausea, vomiting, difficulty breathing, or blurred vision',
      'Numbness, tingling, or metal taste in mouth'
    ],
    immediateSteps: [
      'Keep the victim calm and still. Movement accelerates venom spread through lymph channels.',
      'Immobilize the bitten limb with a splint or loose bandage. Keep limb AT OR BELOW heart level.',
      'Remove tight jewelry, watches, or clothing before swelling begins.',
      'Clean the wound gently with clean water or saline.',
      'Transport immediately to a hospital equipped with Anti-Snake Venom (ASV).'
    ],
    doNot: [
      'DO NOT cut open the bite wound or suck out venom.',
      'DO NOT apply a tight tourniquet (can cause gangrene & limb loss).',
      'DO NOT apply ice, heat, or cold packs.',
      'DO NOT consume alcohol, caffeinated drinks, or pain medication like aspirin.'
    ],
    whenToSeekHelp: [
      'EVERY snake bite must be treated as a medical emergency. Head directly to the nearest ER.'
    ],
    reviewedBy: 'Dr. Elena Rostova & Apex Toxicology Institute',
    reviewStatus: 'Medically Reviewed',
    version: '1.4',
    iconName: 'ShieldAlert',
    updatedAt: '2026-02-01T00:00:00Z'
  },
  {
    articleId: 'fa_heart_attack',
    title: 'Heart Attack (Myocardial Infarction)',
    slug: 'heart-attack-first-aid',
    category: 'Emergency',
    emergencyLevel: 'Critical',
    summary: 'Immediate action plan for suspected heart attack symptoms to prevent heart muscle damage.',
    warningSigns: [
      'Crushing pressure, fullness, or squeezing pain in center of chest lasting > 2 mins',
      'Pain radiating to left arm, neck, jaw, back, or stomach',
      'Cold sweat, lightheadedness, nausea, or shortness of breath'
    ],
    immediateSteps: [
      'Call emergency services (108 / 911) immediately.',
      'Have the person sit down, rest, and stay calm in a comfortable position (sitting upright).',
      'If not allergic, give one adult aspirin (325mg) to chew slowly.',
      'Loosen tight collar or clothing around neck and waist.',
      'Be prepared to begin CPR if the person becomes unconscious and stops breathing.'
    ],
    doNot: [
      'Do not allow the patient to walk or drive themselves to the hospital.',
      'Do not give food, water, or caffeinated drinks.',
      'Do not leave the patient unattended.'
    ],
    whenToSeekHelp: [
      'Immediate emergency call required at first onset of chest symptoms.'
    ],
    reviewedBy: 'Dr. Rajesh Sharma, MD Cardiology',
    reviewStatus: 'Medically Reviewed',
    version: '1.1',
    iconName: 'Activity',
    updatedAt: '2026-01-25T00:00:00Z'
  },
  {
    articleId: 'fa_choking',
    title: 'Severe Choking (Heimlich Maneuver)',
    slug: 'choking-first-aid',
    category: 'Emergency',
    emergencyLevel: 'Critical',
    summary: 'First-aid procedure for complete airway obstruction in adults and children over 1 year.',
    warningSigns: [
      'Inability to speak, cough, or breathe',
      'Universal choking sign (hands clutched around neck)',
      'Turning blue or pale lips and skin'
    ],
    immediateSteps: [
      'Ask "Are you choking?" If they nod yes and cannot speak, act immediately.',
      'Stand behind the person, wrap arms around their waist.',
      'Make a fist with one hand and place thumb side just above the navel (belly button).',
      'Grasp fist with other hand and press inward and upward with quick, forceful thrusts.',
      'Repeat abdominal thrusts until object is dislodged or person becomes unconscious.'
    ],
    doNot: [
      'Do not slap the back while person is upright if coughing effectively.',
      'Do not perform blind finger sweeps inside mouth (may push object deeper).'
    ],
    whenToSeekHelp: [
      'Call 108 / 911 if object is not cleared after 5 thrusts or if person loses consciousness.'
    ],
    reviewedBy: 'Dr. Anita Desai, Pediatrics & Emergency Care',
    reviewStatus: 'Medically Reviewed',
    version: '1.0',
    iconName: 'UserX',
    updatedAt: '2026-01-18T00:00:00Z'
  },
  {
    articleId: 'fa_burns',
    title: 'Thermal & Chemical Burns Protocol',
    slug: 'burns-first-aid',
    category: 'Environmental',
    emergencyLevel: 'High',
    summary: 'Proper burn care steps to cool the burn site, prevent severe infection, and reduce scarring.',
    warningSigns: [
      'Redness, severe pain, blistering (2nd degree)',
      'Charred skin, white or leathery appearance, loss of sensation (3rd degree)',
      'Burns covering face, hands, joints, or groin area'
    ],
    immediateSteps: [
      'Remove source of heat immediately.',
      'Cool the burn under cool running tap water for 10-20 minutes. DO NOT use ice water.',
      'Gently remove clothing or jewelry near burn unless stuck to skin.',
      'Cover burn loosely with clean, non-stick sterile bandage or clean plastic wrap.',
      'Keep patient warm with a blanket.'
    ],
    doNot: [
      'DO NOT apply ice, ice water, butter, toothpaste, or oil.',
      'DO NOT pop or break blisters.',
      'DO NOT peel off charred clothing stuck to burned skin.'
    ],
    whenToSeekHelp: [
      'Seek emergency ER care if burn is larger than 3 inches, on face/hands, or 3rd degree.'
    ],
    reviewedBy: 'Dr. Elena Rostova, Emergency Medicine',
    reviewStatus: 'Medically Reviewed',
    version: '1.3',
    iconName: 'Flame',
    updatedAt: '2026-02-05T00:00:00Z'
  },
  {
    articleId: 'fa_asthma',
    title: 'Acute Asthma Attack Emergency First Aid',
    slug: 'asthma-attack-first-aid',
    category: 'Emergency',
    emergencyLevel: 'High',
    summary: 'Emergency intervention steps when someone suffers severe wheezing, shortness of breath, or asthma rescue failure.',
    warningSigns: [
      'Severe wheezing or persistent coughing',
      'Difficulty speaking full sentences in one breath',
      'Ribs straining/sinking inward while breathing (retractions)'
    ],
    immediateSteps: [
      'Sit the person upright comfortably. Staying calm reduces breathing panic.',
      'Help them use their rescue inhaler (Albuterol/Salbutamol): 1 puff every 30-60 seconds up to 4 puffs.',
      'If using a spacer, shake inhaler, fit spacer, and press 1 puff at a time.',
      'Wait 4 minutes. If no improvement, administer another 4 puffs.'
    ],
    doNot: [
      'Do not force the person to lie down flat.',
      'Do not leave them alone.',
      'Do not give hot drinks or steam inhalations during acute distress.'
    ],
    whenToSeekHelp: [
      'Call emergency 108 / 911 if no improvement after 8 puffs or if lips turn blue.'
    ],
    reviewedBy: 'Dr. Marcus Vance, Pulmonology Specialization',
    reviewStatus: 'Medically Reviewed',
    version: '1.2',
    iconName: 'Wind',
    updatedAt: '2026-02-08T00:00:00Z'
  },
  {
    articleId: 'fa_heat_stroke',
    title: 'Heat Stroke & Heat Exhaustion Response',
    slug: 'heat-stroke-first-aid',
    category: 'Environmental',
    emergencyLevel: 'High',
    summary: 'Critical rapid-cooling protocols for high body temperature (> 104°F / 40°C) and heat emergency.',
    warningSigns: [
      'High core body temperature, hot dry skin (or heavy sweating in heat exhaustion)',
      'Confusion, altered mental state, slurred speech, delirium',
      'Rapid pulse, throbbing headache, dizziness, or fainting'
    ],
    immediateSteps: [
      'Move person to cool, shaded, or air-conditioned area immediately.',
      'Call emergency services (108 / 911).',
      'Rapidly cool person: douse skin with cool water, apply ice packs to armpits, neck, and groin.',
      'Fan vigorously while keeping skin moist.',
      'If conscious and alert, offer sips of cool water or electrolyte solution.'
    ],
    doNot: [
      'DO NOT give sugary or alcoholic beverages.',
      'DO NOT force liquids if person is confused or vomiting.'
    ],
    whenToSeekHelp: [
      'Heat stroke is a medical emergency requiring rapid hospital cooling.'
    ],
    reviewedBy: 'Dr. Elena Rostova, Emergency Medicine',
    reviewStatus: 'Medically Reviewed',
    version: '1.1',
    iconName: 'Sun',
    updatedAt: '2026-01-30T00:00:00Z'
  },
  {
    articleId: 'fa_injury',
    title: 'Physical Injury, Bleeding & Fractures',
    slug: 'physical-injury-bleeding-first-aid',
    category: 'Injury',
    emergencyLevel: 'Moderate',
    summary: 'First aid for severe bleeding, deep lacerations, and suspected bone fractures.',
    warningSigns: [
      'Spurt of bright red blood (arterial bleeding)',
      'Visible bone deformity or inability to bear weight',
      'Signs of shock (pale skin, rapid heart rate, cold clammy feeling)'
    ],
    immediateSteps: [
      'For Bleeding: Apply firm, direct pressure on wound using sterile pad or clean cloth.',
      'Elevate injured area above heart level if no fracture is suspected.',
      'For Fractures: Immobilize the joint above and below the suspected fracture using a rigid splint.',
      'Apply cold gel pack wrapped in cloth to reduce swelling.'
    ],
    doNot: [
      'DO NOT push protruding bones back into wound.',
      'DO NOT remove deeply embedded objects (e.g., knife or glass shard); stabilize around object.'
    ],
    whenToSeekHelp: [
      'Seek immediate ER evaluation for uncontrollable bleeding or open fractures.'
    ],
    reviewedBy: 'Dr. Elena Rostova, Trauma Medicine',
    reviewStatus: 'Medically Reviewed',
    version: '1.0',
    iconName: 'Bandage',
    updatedAt: '2026-01-15T00:00:00Z'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    appointmentId: 'apt_001',
    patientId: 'pat_001',
    patientName: 'Sarah Jenkins',
    doctorId: 'doc_101',
    doctorName: 'Dr. Rajesh Sharma',
    doctorSpecialization: 'Cardiology',
    hospitalId: 'hosp_01',
    hospitalName: 'City General Trauma & Emergency Center',
    appointmentDate: new Date().toISOString().split('T')[0], // Today
    startTime: '15:00',
    endTime: '15:30',
    type: 'video',
    reason: 'Follow up on chest tightness during exercise & ECG review',
    status: 'confirmed',
    meetingId: 'meet_firstaid_101_772',
    createdAt: '2026-02-12T09:00:00Z',
    updatedAt: '2026-02-12T09:00:00Z'
  },
  {
    appointmentId: 'apt_002',
    patientId: 'pat_001',
    patientName: 'Sarah Jenkins',
    doctorId: 'doc_103',
    doctorName: 'Dr. Marcus Vance',
    doctorSpecialization: 'Pulmonology',
    hospitalId: 'hosp_02',
    hospitalName: 'St. Jude Heart & Respiratory Care',
    appointmentDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // In 2 days
    startTime: '11:00',
    endTime: '11:30',
    type: 'in_person',
    reason: 'Asthma action plan evaluation and spirometry check',
    status: 'requested',
    createdAt: '2026-02-14T10:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z'
  }
];
