// ========================================
// Firebase Configuration
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyCwXVyJ4itzIT3G6Ob6OX67T3AzqlV89wY",
    authDomain: "cronogramanoc.firebaseapp.com",
    projectId: "cronogramanoc",
    storageBucket: "cronogramanoc.firebasestorage.app",
    messagingSenderId: "439432672841",
    appId: "1:439432672841:web:3ffb5ce12b8733a8337198",
    measurementId: "G-3E61XX4W3M"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = firebase.auth();

// Initialize Firestore
const db = firebase.firestore();

// Desactivar persistencia para evitar problemas con múltiples tabs
// La app funcionará solo online
// Export for use in app.js
window.db = db;
window.auth = auth;
window.firebase = firebase;
