// ========================================
// Firebase Configuration
// ========================================
// 
// ⚠️ IMPORTANTE: Reemplaza estos valores con tu configuración de Firebase
// Para obtener estos valores:
// 1. Ve a https://console.firebase.google.com/
// 2. Crea un nuevo proyecto o selecciona uno existente
// 3. Ve a Configuración del proyecto > General > Tus aplicaciones
// 4. Agrega una nueva web app o copia la configuración existente
// 5. Asegúrate de habilitar:
//    - Firestore Database
//    - Authentication (Email/Password)
//
// Pasos para configurar Authentication:
// 1. En Firebase Console, ve a "Authentication"
// 2. Click en "Comenzar"
// 3. Habilita "Email/Password"
// 4. Click en "Guardar"
//
// Pasos para configurar Firestore:
// 1. En Firebase Console, ve a "Firestore Database"
// 2. Click en "Crear base de datos"
// 3. Selecciona "Comenzar en modo de prueba" (luego ajusta las reglas)
// 4. Elige la ubicación más cercana a tu región
//
// Reglas de seguridad para Firestore (con autenticación):
// 
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /tasks/{taskId} {
//       allow read, write: if request.auth != null;
//     }
//     match /users/{userId} {
//       allow read, write: if request.auth != null;
//     }
//     match /reports/{reportId} {
//       allow read, write: if request.auth != null;
//     }
//     match /shifts/{shiftId} {
//       allow read, write: if request.auth != null;
//     }
//   }
// }
// ========================================

const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = firebase.auth();

// Initialize Firestore
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence()
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
            console.warn('The current browser does not support offline persistence.');
        }
    });

// Export for use in app.js
window.db = db;
window.auth = auth;
window.firebase = firebase;
