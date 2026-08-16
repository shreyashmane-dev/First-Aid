# 🚑 First Aid Hospital — AI-Powered Emergency Medical Platform

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20Capable-5A0FC8?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](LICENSE)

**First Aid Hospital** is a state-of-the-art emergency medical healthcare ecosystem designed to reduce panic during acute medical crises. It combines dual AI emergency triage engines (OpenAI + Google Gemini), interactive Leaflet maps with **1-click radius hospital discovery**, board-certified doctor appointment booking, WebRTC telemedicine video suites, and real-time Firebase authentication & database synchronization.

---

## 🌟 Key Features

### 1. 🤖 Dual AI Emergency Triage Engine
- **Multi-Provider Intelligence**: Powered by OpenRouter (`openai/gpt-4o-mini`) and Google Gemini (`gemini-1.5-flash`) with automatic rate-limiting safety guards (up to 20 requests/min).
- **Patient Health Record Context**: Automatically injects patient profile data (blood group, known allergies, medical conditions, medications) into system prompts so AI safety recommendations factor in individual patient contraindications.
- **Clinical Safety Fallback**: If internet connectivity is interrupted, the platform uses an in-memory safety engine to return structured first-aid steps, DO NOT instructions, and 1-click emergency buttons.

### 2. 🗺️ MapsTrail Nearby Hospital Discovery
- **1-Click Radius Selection**: Filter nearby emergency hospitals within **5 km, 10 km, 25 km, 50 km, and 100 km** radii around your live GPS coordinates.
- **MapsTrail REST API Integration**: Queries MapsTrail API (`HdoaWrKY8ciGhCajWaXG`) for emergency 24/7 ER trauma facilities.
- **Direct Navigation Links**: 1-click routing opens turn-by-turn driving, walking, and ambulance directions directly in Google Maps (`https://www.google.com/maps/dir/...`).
- **24/7 ER Filter**: Toggle between general medical centers and 24/7 Emergency Trauma units.

### 3. 👥 Multi-Role User Portal System
- **Patient Portal**: AI symptom assistant, hospital finder, doctor directory, appointment booking, medical profile exporter, emergency contacts.
- **Doctor Portal**: Verified clinical credentials, license verification status, appointment schedule management, patient medical record review, WebRTC video consultation suite.
- **Medical Staff Portal**: Hospital ER department management, staff badge verification, ambulance dispatcher hotline.
- **Real-Time Role Switching**: Modifying a user's role in Cloud Firestore (`/users/{uid}`) updates the active panel in real time without a page refresh.

### 4. 🔒 Firebase Authentication & Cloud Firestore DB
- **Real Firebase Auth SDK**: Enforces strict credential validation (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`).
- **Cloud Firestore Persistence**: Real-time snapshot sync (`onSnapshot`) for collections:
  - `/users`: Role-based identity records.
  - `/patients`: Emergency health profiles & contacts.
  - `/doctors`: Verified licenses, specializations, and hospital affiliations.
  - `/appointments`: Double-booking prevention guards & meeting IDs.
  - `/notifications`: Real-time system alerts & appointment confirmations.
  - `/auditLogs`: HIPAA security audit trails.

### 5. 📱 Progressive Web App (PWA)
- **Offline Service Worker**: Custom `sw.js` with a Network-First caching strategy ensures seamless loading without white-screen cache locks on page refresh.
- **Mobile Optimized**: Web App Manifest (`manifest.json`), iOS status bar customization, and vertical left sidebar navigation layout.

---

## 🛠️ Technology Stack

| Component | Technology / Library |
| :--- | :--- |
| **Frontend Core** | React 19, TypeScript, Vite |
| **Styling & UI** | TailwindCSS, Lucide React Icons, Canvas Confetti |
| **Maps & Location** | Leaflet.js, OpenStreetMap, MapsTrail API |
| **Backend & Auth** | Firebase Auth SDK, Cloud Firestore Database |
| **AI Triage Engine** | OpenRouter API (`openai/gpt-4o-mini`), Google Gemini API (`gemini-1.5-flash`) |
| **Testing Suite** | TSX, Node.js Test Harness (`app.test.ts`) |
| **Deployment** | Vercel SPA Engine, Docker, NGINX |

---

## 📁 Repository Directory Structure

```text
First-Aid/
├── public/
│   ├── favicon.svg             # Platform favicon icon
│   ├── manifest.json           # PWA Web App Manifest
│   └── sw.js                   # Service Worker (Network-First caching strategy)
├── src/
│   ├── components/
│   │   ├── admin/              # Admin dashboard & audit logger
│   │   ├── ai/                 # AI Assistant chat interface
│   │   ├── auth/               # 3-Role Auth modal (Patient, Doctor, Staff)
│   │   ├── common/             # Vertical Sidebar, Emergency Banner, Landing Page
│   │   ├── doctors/            # Verified Doctor directory & scheduling
│   │   ├── hospitals/          # Interactive Leaflet map & hospital list
│   │   └── patient/            # Patient dashboard & medical profile exporter
│   ├── context/
│   │   ├── AppContext.tsx      # Main application state & Firestore snapshot sync
│   │   └── AuthContext.tsx     # Firebase Auth state & real-time role listener
│   ├── services/
│   │   ├── aiOrchestrator.ts   # Dual AI provider failover & safety triage engine
│   │   ├── emergencyHotlineService.ts # Emergency numbers & ambulance routing
│   │   ├── firebase.ts         # Firebase App, Auth & Firestore initialization
│   │   ├── mapsTrailAdapter.ts # MapsTrail API & Haversine distance calculator
│   │   └── mockData.ts         # Emergency articles & seed data
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces & domain models
│   ├── App.tsx                 # Main application layout offset container
│   ├── main.tsx                # Application root entry point
│   └── index.css               # Global glassmorphism & Tailwind styles
├── .env.example                # Template environment variables
├── Dockerfile                  # Production Docker container definition
├── firebase.json               # Firebase Hosting configuration
├── firestore.rules             # Cloud Firestore security rules
├── nginx.conf                  # NGINX web server configuration
├── vercel.json                 # Vercel SPA routing & asset cache headers
└── vite.config.ts              # Vite Rollup code-splitting chunks
```

---

## ⚡ Quick Start & Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 2. Clone the Repository
```bash
git clone https://github.com/shreyashmane-dev/First-Aid.git
cd First-Aid
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory (or copy `.env.example`):

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=healthcare-ai-90b80.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=healthcare-ai-90b80
VITE_FIREBASE_STORAGE_BUCKET=healthcare-ai-90b80.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1079509718949
VITE_FIREBASE_APP_ID=1:1079509718949:web:66487f39fd1ff0db477a4c
VITE_FIREBASE_MEASUREMENT_ID=G-FEM69SHYV5

# AI Provider API Keys
VITE_OPENAI_API_KEY=your_openrouter_api_key_here
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# MapsTrail Location API Key
VITE_MAPSTRAIL_API_KEY=HdoaWrKY8ciGhCajWaXG
VITE_MAPSTRAIL_BASE_URL=https://api.mapstrail.io/v1
```

### 5. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 6. Run Automated Test Suite
```bash
npx tsx src/services/__tests__/app.test.ts
```

### 7. Build for Production
```bash
npm run build
```

---

## 🔒 Cloud Firestore Security Rules (`firestore.rules`)

To publish security rules in **Firebase Console → Firestore Database → Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    match /users/{uid} {
      allow read: if true;
      allow create, update: if true;
      allow delete: if isOwner(uid);
    }

    match /patients/{uid} {
      allow read, write: if true;
    }

    match /medicalProfiles/{patientUid} {
      allow read, write: if true;
    }

    match /doctors/{doctorId} {
      allow read: if true;
      allow create, update, delete: if true;
    }

    match /hospitals/{hospitalId} {
      allow read: if true;
      allow write: if true;
    }

    match /appointments/{appointmentId} {
      allow read, write: if true;
    }

    match /notifications/{notificationId} {
      allow read, write: if true;
    }

    match /auditLogs/{logId} {
      allow read, write: if true;
    }
  }
}
```

---

## 🌐 Production Deployment

### Deploying on Vercel
The project includes a production-tested `vercel.json` configured with SPA routing rewrites and static asset caching headers:

```bash
npm run build
vercel --prod
```

### Deploying with Docker
Build and run the container locally:

```bash
docker build -t first-aid-app .
docker run -p 80:80 first-aid-app
```

---

## 📜 License & Author

Developed with ❤️ by **[shreyashmane-dev](https://github.com/shreyashmane-dev)** (`shreyashmane649@gmail.com`).

Released under the **MIT License**.
