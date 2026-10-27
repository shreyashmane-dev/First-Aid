import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBGCDvsqEYkYKRcm9kHcFug9j5DbUE_GrI",
  authDomain: "healthcare-ai-90b80.firebaseapp.com",
  projectId: "healthcare-ai-90b80",
  storageBucket: "healthcare-ai-90b80.firebasestorage.app",
  messagingSenderId: "1079509718949",
  appId: "1:1079509718949:web:66487f39fd1ff0db477a4c",
  measurementId: "G-FEM69SHYV5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const accounts = [
  {
    email: 'admin@firstaid.org',
    password: 'AdminPassword123!',
    role: 'admin',
    displayName: 'System Administrator',
    phone: '+1 (555) 111-2222'
  },
  {
    email: 'doctor@firstaid.org',
    password: 'DoctorPassword123!',
    role: 'doctor',
    displayName: 'Dr. Rajesh Sharma',
    phone: '+1 (555) 987-6543',
    specialization: 'Cardiology',
    licenseNumber: 'MD-CARDIO-889012',
    hospitalName: 'City General Trauma & Emergency Center'
  },
  {
    email: 'patient1@firstaid.org',
    password: 'PatientPassword123!',
    role: 'patient',
    displayName: 'Sarah Jenkins',
    phone: '+1 (555) 234-5678',
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Peanuts', 'Latex'],
    medicalConditions: ['Mild Asthma', 'Seasonal Rhinitis'],
    medications: ['Albuterol Inhaler (PRN)', 'Cetirizine 10mg']
  },
  {
    email: 'patient2@firstaid.org',
    password: 'PatientPassword123!',
    role: 'patient',
    displayName: 'Michael Chang',
    phone: '+1 (555) 345-6789',
    bloodGroup: 'A+',
    allergies: ['Sulfa drugs'],
    medicalConditions: ['Palpitations', 'Resting Tachycardia'],
    medications: ['Metoprolol 25mg']
  }
];

async function seed() {
  console.log('Seeding 4 real accounts into Firebase Auth & Firestore...');

  for (const acc of accounts) {
    let fbUser;
    try {
      const res = await createUserWithEmailAndPassword(auth, acc.email, acc.password);
      fbUser = res.user;
      console.log(`Created in Firebase Auth: ${acc.email} (${fbUser.uid})`);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        const res = await signInWithEmailAndPassword(auth, acc.email, acc.password);
        fbUser = res.user;
        console.log(`Already in Firebase Auth, signed in: ${acc.email} (${fbUser.uid})`);
      } else {
        console.error(`Error for ${acc.email}:`, err.message);
        continue;
      }
    }

    const uid = fbUser.uid;
    const now = new Date().toISOString();

    // 1. Write user to Firestore 'users' collection
    await setDoc(doc(db, 'users', uid), {
      uid,
      email: acc.email,
      role: acc.role,
      displayName: acc.displayName,
      phone: acc.phone,
      status: 'active',
      createdAt: now,
      updatedAt: now
    });
    console.log(`Saved users/${uid} in Firestore`);

    // 2. Role specific collections in Firestore
    if (acc.role === 'doctor') {
      await setDoc(doc(db, 'doctors', uid), {
        doctorId: `doc_${uid}`,
        userId: uid,
        name: acc.displayName,
        photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
        specialization: acc.specialization,
        subSpecialization: 'Interventional Cardiology & ER Triage',
        licenseNumber: acc.licenseNumber,
        licenseStatus: 'verified',
        verificationStatus: 'verified',
        education: [
          { degree: 'MD Cardiology', university: 'Johns Hopkins University', year: 2012 },
          { degree: 'MBBS', university: 'AIIMS Medical College', year: 2007 }
        ],
        experienceYears: 14,
        hospitalIds: ['hosp_01'],
        hospitalName: acc.hospitalName,
        professionalEmail: acc.email,
        professionalPhone: acc.phone,
        bio: 'Board-certified cardiologist specializing in acute myocardial infarction, chest pain triage, and online video consultations.',
        consultationFee: 75,
        rating: 4.9,
        reviewsCount: 142,
        createdAt: now,
        updatedAt: now
      });
      console.log(`Saved doctors/${uid} in Firestore`);
    } else if (acc.role === 'patient') {
      await setDoc(doc(db, 'patients', uid), {
        uid,
        contactNumber: acc.phone,
        emergencyContact: {
          name: 'Primary Family Contact',
          relationship: 'Family',
          phone: '+1 (555) 911-0000'
        },
        shareProfileWithDoctor: true,
        createdAt: now,
        updatedAt: now
      });
      console.log(`Saved patients/${uid} in Firestore`);

      await setDoc(doc(db, 'medicalProfiles', uid), {
        patientUid: uid,
        bloodGroup: acc.bloodGroup,
        allergies: acc.allergies,
        medicalConditions: acc.medicalConditions,
        medications: acc.medications,
        surgeries: [],
        importantNotes: `Patient profile for ${acc.displayName}.`,
        updatedAt: now
      });
      console.log(`Saved medicalProfiles/${uid} in Firestore`);
    }
  }

  console.log('Seeding completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
