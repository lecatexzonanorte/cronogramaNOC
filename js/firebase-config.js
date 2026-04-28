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
// 5. Asegúrate de habilitar Firestore Database en tu proyecto
//
// Pasos para configurar Firestore:
// 1. En Firebase Console, ve a "Firestore Database"
// 2. Click en "Crear base de datos"
// 3. Selecciona "Comenzar en modo de prueba" (luego puedes ajustar las reglas)
// 4. Elige la ubicación más cercana a tu región
//
// Reglas de seguridad recomendadas para Firestore (cambiar en la consola):
// 
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /{document=**} {
//       allow read, write: if true;  // Para desarrollo
//       // Para producción, usar autenticación:
//       // allow read, write: if request.auth != null;
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
