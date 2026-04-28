// ========================================
// Firebase Authentication Handler
// ========================================

// Auth state observer
let currentUser = null;

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initAuthListeners();
});

function initAuthListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    const loginAnonymous = document.getElementById('loginAnonymous');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleEmailLogin);
    }
    
    if (loginAnonymous) {
        loginAnonymous.addEventListener('click', handleAnonymousLogin);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            currentUser = user;
            showApp();
            updateAuthUI(user);
            console.log('✅ Usuario autenticado:', user.email || 'Anónimo');
        } else {
            // User is signed out
            currentUser = null;
            showLogin();
            console.log('🔴 Usuario no autenticado');
        }
    });
}

// Handle email/password login
async function handleEmailLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    
    if (!email || !password) {
        showLoginError('Por favor completa todos los campos');
        return;
    }
    
    try {
        showLoginLoading(true);
        await auth.signInWithEmailAndPassword(email, password);
        // Auth state change will handle the rest
    } catch (error) {
        console.error('Error en login:', error);
        showLoginError(getErrorMessage(error.code));
        showLoginLoading(false);
    }
}

// Handle anonymous login
async function handleAnonymousLogin() {
    try {
        showLoginLoading(true);
        await auth.signInAnonymously();
        // Auth state change will handle the rest
    } catch (error) {
        console.error('Error en login anónimo:', error);
        showLoginError(getErrorMessage(error.code));
        showLoginLoading(false);
    }
}

// Handle logout
async function handleLogout() {
    try {
        await auth.signOut();
        showToast('Sesión cerrada correctamente', 'success');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        showToast('Error al cerrar sesión', 'error');
    }
}

// Show login screen
function showLogin() {
    document.getElementById('loginScreen')?.classList.remove('hidden');
    document.getElementById('appContainer')?.classList.add('hidden');
    showLoginLoading(false);
}

// Show main app
function showApp() {
    document.getElementById('loginScreen')?.classList.add('hidden');
    document.getElementById('appContainer')?.classList.remove('hidden');
    
    // Initialize the main app
    if (typeof initApp === 'function') {
        initApp();
    }
}

// Update UI with user info
function updateAuthUI(user) {
    const authEmail = document.getElementById('authEmail');
    const authUserInfo = document.getElementById('authUserInfo');
    
    if (user) {
        if (user.email) {
            if (authEmail) authEmail.textContent = user.email;
            if (authUserInfo) authUserInfo.classList.remove('hidden');
        } else {
            // Anonymous user
            if (authEmail) authEmail.textContent = 'Usuario invitado';
            if (authUserInfo) authUserInfo.classList.remove('hidden');
        }
    } else {
        if (authUserInfo) authUserInfo.classList.add('hidden');
    }
}

// Show login error
function showLoginError(message) {
    const errorEl = document.getElementById('loginError');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
}

// Show/hide loading state
function showLoginLoading(loading) {
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    const anonBtn = document.getElementById('loginAnonymous');
    
    if (submitBtn) {
        submitBtn.disabled = loading;
        submitBtn.innerHTML = loading 
            ? '<span class="spinner">⏳</span> Verificando...'
            : '<span>🔐</span> Iniciar Sesión';
    }
    
    if (anonBtn) {
        anonBtn.disabled = loading;
    }
}

// Get user-friendly error message
function getErrorMessage(errorCode) {
    const messages = {
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/invalid-email': 'Email inválido',
        'auth/user-disabled': 'Usuario deshabilitado',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
        'auth/invalid-credential': 'Credenciales inválidas',
        'auth/operation-not-allowed': 'Operación no permitida',
        'auth/network-request-failed': 'Error de conexión'
    };
    
    return messages[errorCode] || 'Error al iniciar sesión. Intenta nuevamente';
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Check if user is authenticated
function isAuthenticated() {
    return currentUser !== null;
}

// Export functions
window.handleLogout = handleLogout;
window.getCurrentUser = getCurrentUser;
window.isAuthenticated = isAuthenticated;
