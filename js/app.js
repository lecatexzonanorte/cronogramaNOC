// ========================================
// Bitácora NOC - Main Application
// ========================================

// Application State
const state = {
    currentDate: new Date(),
    currentUser: null,
    users: [],
    tasks: [],
    currentView: 'dashboard',
    sidebarCollapsed: false,
    listeners: {}
};

// DOM Elements
const elements = {};

// ========================================
// Initialization
// ========================================
let appInitialized = false;

document.addEventListener('DOMContentLoaded', () => {
    // Only prepare elements - actual init happens after auth
    initElements();
});

// Called from auth.js when user is authenticated
function initApp() {
    if (appInitialized) return;
    appInitialized = true;
    
    initEventListeners();
    initSidebarState();
    loadUsers();
    renderCurrentDate();
    updateHeaderDate();
    checkFirebaseConnection();
}

function initElements() {
    // Sidebar
    elements.sidebar = document.getElementById('sidebar');
    elements.sidebarToggle = document.getElementById('sidebarToggle');
    elements.sidebarOverlay = document.getElementById('sidebarOverlay');
    elements.mobileMenuBtn = document.getElementById('mobileMenuBtn');
    
    // User
    elements.userCard = document.getElementById('userCard');
    elements.userDropdown = document.getElementById('userDropdown');
    elements.userDropdownList = document.getElementById('userDropdownList');
    elements.userMenuBtn = document.getElementById('userMenuBtn');
    elements.addUserBtn = document.getElementById('addUserBtn');
    elements.addUserBtnMain = document.getElementById('addUserBtnMain');
    elements.userModal = document.getElementById('userModal');
    elements.userForm = document.getElementById('userForm');
    elements.sidebarUserName = document.getElementById('sidebarUserName');
    elements.sidebarUserShift = document.getElementById('sidebarUserShift');
    elements.userAvatarInitial = document.getElementById('userAvatarInitial');
    
    // Navigation
    elements.navItems = document.querySelectorAll('.nav-item');
    elements.pageTitle = document.getElementById('pageTitle');
    elements.pageSubtitle = document.getElementById('pageSubtitle');
    
    // Date
    elements.displayDate = document.getElementById('displayDate');
    elements.headerDate = document.getElementById('headerDate');
    
    // Tasks containers
    elements.pollingsArgentinaList = document.getElementById('pollingsArgentinaList');
    elements.pollingsRegionalList = document.getElementById('pollingsRegionalList');
    elements.backupsDiariosList = document.getElementById('backupsDiariosList');
    elements.backupsSemanalesList = document.getElementById('backupsSemanalesList');
    elements.backupsMensualesList = document.getElementById('backupsMensualesList');
    elements.procesosList = document.getElementById('procesosList');
    
    // Stats
    elements.argentinaCount = document.getElementById('argentinaCount');
    elements.argentinaProgress = document.getElementById('argentinaProgress');
    elements.regionalCount = document.getElementById('regionalCount');
    elements.regionalProgress = document.getElementById('regionalProgress');
    elements.backupsCount = document.getElementById('backupsCount');
    elements.backupsProgress = document.getElementById('backupsProgress');
    elements.procesosCount = document.getElementById('procesosCount');
    elements.procesosProgress = document.getElementById('procesosProgress');
    elements.overallPercent = document.getElementById('overallPercent');
    elements.overallProgressFill = document.getElementById('overallProgressFill');
    
    // Counters
    elements.argentinaCounter = document.getElementById('argentinaCounter');
    elements.regionalCounter = document.getElementById('regionalCounter');
    elements.backupsDiariosCounter = document.getElementById('backupsDiariosCounter');
    elements.backupsSemanalesCounter = document.getElementById('backupsSemanalesCounter');
    elements.backupsMensualesCounter = document.getElementById('backupsMensualesCounter');
    elements.procesosCounter = document.getElementById('procesosCounter');
    
    // Modal
    elements.taskModal = document.getElementById('taskModal');
    elements.taskForm = document.getElementById('taskForm');
    elements.taskModalTitle = document.getElementById('taskModalTitle');
    
    // Reports
    elements.reportBtn = document.getElementById('reportBtn');
    elements.reportDateMain = document.getElementById('reportDateMain');
    elements.reportFormat = document.getElementById('reportFormat');
    elements.generateReportBtn = document.getElementById('generateReportBtn');
    elements.reportPreview = document.getElementById('reportPreview');
    elements.reportContentMain = document.getElementById('reportContentMain');
    elements.copyReportBtn = document.getElementById('copyReportBtn');
    elements.exportReportBtn = document.getElementById('exportReportBtn');
    
    // Users View
    elements.usersGrid = document.getElementById('usersGrid');
    
    // Settings
    elements.settingSidebarCollapsed = document.getElementById('settingSidebarCollapsed');
    elements.exportDataBtn = document.getElementById('exportDataBtn');
    
    // Init day
    elements.initDayBtn = document.getElementById('initDayBtn');
}

function initEventListeners() {
    // Sidebar
    elements.sidebarToggle.addEventListener('click', toggleSidebar);
    elements.mobileMenuBtn.addEventListener('click', toggleMobileSidebar);
    elements.sidebarOverlay.addEventListener('click', closeMobileSidebar);
    
    // Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            if (view) navigateTo(view);
        });
    });
    
    // User
    elements.userCard.addEventListener('click', toggleUserDropdown);
    elements.userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleUserDropdown();
    });
    elements.addUserBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeUserDropdown();
        openModal('userModal');
    });
    elements.addUserBtnMain?.addEventListener('click', () => openModal('userModal'));
    elements.userForm.addEventListener('submit', handleUserSubmit);
    
    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!elements.userDropdown.contains(e.target) && !elements.userCard.contains(e.target)) {
            closeUserDropdown();
        }
    });
    
    // Date Navigation
    document.getElementById('prevDay').addEventListener('click', () => navigateDay(-1));
    document.getElementById('nextDay').addEventListener('click', () => navigateDay(1));
    document.getElementById('todayBtn').addEventListener('click', goToToday);
    
    // Task form
    elements.taskForm.addEventListener('submit', handleTaskSubmit);
    
    // Init day
    elements.initDayBtn?.addEventListener('click', initDayFromTemplate);
    
    // Reports
    elements.reportBtn.addEventListener('click', () => navigateTo('reports'));
    elements.generateReportBtn?.addEventListener('click', generateReportFromView);
    elements.copyReportBtn?.addEventListener('click', copyReportToClipboard);
    elements.exportReportBtn?.addEventListener('click', exportReport);
    
    // Settings
    elements.settingSidebarCollapsed?.addEventListener('change', (e) => {
        state.sidebarCollapsed = e.target.checked;
        updateSidebarState();
        localStorage.setItem('noc_sidebarCollapsed', state.sidebarCollapsed);
    });
    
    elements.exportDataBtn?.addEventListener('click', exportAllData);
    
    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

// ========================================
// Sidebar Management
// ========================================
function initSidebarState() {
    const savedState = localStorage.getItem('noc_sidebarCollapsed');
    if (savedState === 'true') {
        state.sidebarCollapsed = true;
        elements.sidebar.classList.add('collapsed');
        if (elements.settingSidebarCollapsed) {
            elements.settingSidebarCollapsed.checked = true;
        }
    }
}

function toggleSidebar() {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    updateSidebarState();
    localStorage.setItem('noc_sidebarCollapsed', state.sidebarCollapsed);
}

function updateSidebarState() {
    if (state.sidebarCollapsed) {
        elements.sidebar.classList.add('collapsed');
    } else {
        elements.sidebar.classList.remove('collapsed');
    }
}

function toggleMobileSidebar() {
    elements.sidebar.classList.toggle('mobile-open');
    elements.sidebarOverlay.classList.toggle('active');
}

function closeMobileSidebar() {
    elements.sidebar.classList.remove('mobile-open');
    elements.sidebarOverlay.classList.remove('active');
}

// ========================================
// Navigation
// ========================================
function navigateTo(view) {
    // Update nav items
    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.view === view);
    });
    
    // Update views
    document.querySelectorAll('.view').forEach(v => {
        v.classList.toggle('active', v.id === `view-${view}`);
    });
    
    state.currentView = view;
    updatePageTitle(view);
    closeMobileSidebar();
    
    // Load data for specific views
    if (view === 'reports') {
        initReportsView();
    } else if (view === 'users') {
        renderUsersGrid();
    }
}

function updatePageTitle(view) {
    const titles = {
        dashboard: { title: 'Dashboard', subtitle: 'Resumen de actividades del día' },
        'pollings-argentina': { title: 'Pollings Argentina', subtitle: 'Seguimiento de pollings AS400 Argentina' },
        'pollings-regional': { title: 'Pollings Regional', subtitle: 'Seguimiento de pollings AS400 Regional' },
        backups: { title: 'Backups', subtitle: 'Seguimiento de backups AS400' },
        procesos: { title: 'Procesos / Envíos', subtitle: 'Estado de envío de archivos' },
        reports: { title: 'Informes', subtitle: 'Genera y exporta informes de actividades' },
        users: { title: 'Usuarios', subtitle: 'Gestión de usuarios y turnos' },
        settings: { title: 'Configuración', subtitle: 'Personaliza tu experiencia' }
    };
    
    const info = titles[view] || { title: 'NOC Tasks', subtitle: '' };
    elements.pageTitle.textContent = info.title;
    elements.pageSubtitle.textContent = info.subtitle;
}

// ========================================
// Firebase Connection Check
// ========================================
async function checkFirebaseConnection() {
    // Verificar que Firebase esté inicializado
    if (typeof firebase !== 'undefined' && firebase.app()) {
        console.log('✅ Firebase inicializado correctamente');
        console.log('📊 Project ID:', firebase.app().options.projectId);
    } else {
        console.error('❌ Firebase no está inicializado');
        showToast('Error al inicializar Firebase. Recarga la página.', 'error');
    }
}

// ========================================
// Date Navigation
// ========================================
function navigateDay(delta) {
    state.currentDate.setDate(state.currentDate.getDate() + delta);
    renderCurrentDate();
    loadTasks();
}

function goToToday() {
    state.currentDate = new Date();
    renderCurrentDate();
    loadTasks();
}

function renderCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    elements.displayDate.textContent = state.currentDate.toLocaleDateString('es-AR', options);
}

function updateHeaderDate() {
    const today = new Date();
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    elements.headerDate.textContent = today.toLocaleDateString('es-AR', options);
}

function getDateKey(date = state.currentDate) {
    return date.toISOString().split('T')[0];
}

// ========================================
// User Management
// ========================================
async function loadUsers() {
    try {
        const snapshot = await db.collection('users').orderBy('name').get();
        state.users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderUserDropdown();
        renderUsersGrid();
        
        // Get authenticated user email
        const authUser = auth.currentUser;
        const authEmail = authUser?.email;
        
        // Restore last user from localStorage
        const lastUser = localStorage.getItem('noc_lastUser');
        if (lastUser && state.users.find(u => u.id === lastUser)) {
            selectUser(lastUser);
        } else if (authEmail) {
            // Try to find user by email
            const userByEmail = state.users.find(u => u.email === authEmail);
            if (userByEmail) {
                selectUser(userByEmail.id);
            } else {
                // Create new NOC user for this email
                await createNOCUser(authEmail, authUser.displayName || authEmail.split('@')[0]);
            }
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Error al cargar usuarios', 'error');
    }
}

async function createNOCUser(email, name) {
    try {
        const docRef = await db.collection('users').add({
            email: email,
            name: name,
            shift: 'mañana',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Usuario NOC creado:', email);
        
        // Add to local state and select
        state.users.push({ id: docRef.id, email, name, shift: 'mañana' });
        selectUser(docRef.id);
        renderUserDropdown();
    } catch (error) {
        console.error('Error creando usuario NOC:', error);
    }
}

function renderUserDropdown() {
    elements.userDropdownList.innerHTML = '';
    
    state.users.forEach(user => {
        const li = document.createElement('li');
        li.className = user.id === state.currentUser ? 'active' : '';
        li.innerHTML = `
            <div class="user-mini-avatar">${getInitials(user.name)}</div>
            <div class="user-mini-info">
                <span class="user-mini-name">${escapeHtml(user.name)}</span>
                <span class="user-mini-shift">${getShiftLabel(user.shift)}</span>
            </div>
        `;
        li.addEventListener('click', () => {
            selectUser(user.id);
            closeUserDropdown();
        });
        elements.userDropdownList.appendChild(li);
    });
}

function selectUser(userId) {
    state.currentUser = userId;
    localStorage.setItem('noc_lastUser', userId);
    
    const user = state.users.find(u => u.id === userId);
    if (user) {
        elements.sidebarUserName.textContent = user.name;
        elements.sidebarUserShift.textContent = getShiftLabel(user.shift);
        elements.userAvatarInitial.textContent = getInitials(user.name);
    }
    
    renderUserDropdown();
    loadTasks();
}

function toggleUserDropdown() {
    elements.userDropdown.classList.toggle('hidden');
}

function closeUserDropdown() {
    elements.userDropdown.classList.add('hidden');
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getShiftLabel(shift) {
    const labels = {
        'mañana': '🌅 Mañana',
        'tarde': '☀️ Tarde',
        'noche': '🌙 Noche'
    };
    return labels[shift] || shift;
}

async function handleUserSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('userName').value.trim();
    const shift = document.getElementById('userShift').value;
    
    if (!name) return;
    
    try {
        const docRef = await db.collection('users').add({
            name,
            shift,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast(`Usuario "${name}" creado correctamente`, 'success');
        closeModal('userModal');
        elements.userForm.reset();
        await loadUsers();
        
        selectUser(docRef.id);
        
    } catch (error) {
        console.error('Error creating user:', error);
        showToast('Error al crear usuario', 'error');
    }
}

function renderUsersGrid() {
    if (!elements.usersGrid) return;
    
    elements.usersGrid.innerHTML = '';
    
    if (state.users.length === 0) {
        elements.usersGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <span class="empty-icon">👥</span>
                <p>No hay usuarios registrados</p>
                <button class="btn btn-primary" onclick="openModal('userModal')">
                    Crear primer usuario
                </button>
            </div>
        `;
        return;
    }
    
    state.users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'user-card-item';
        if (user.id === state.currentUser) card.style.borderColor = 'var(--primary)';
        
        card.innerHTML = `
            <div class="user-avatar">${getInitials(user.name)}</div>
            <div class="user-info">
                <span class="user-name">${escapeHtml(user.name)}</span>
                <span class="user-shift">${getShiftLabel(user.shift)}</span>
            </div>
            <div class="user-card-actions">
                <button onclick="selectUser('${user.id}')" title="Seleccionar">✓</button>
                <button onclick="deleteUser('${user.id}')" title="Eliminar">🗑️</button>
            </div>
        `;
        
        elements.usersGrid.appendChild(card);
    });
}

async function deleteUser(userId) {
    if (userId === state.currentUser) {
        showToast('No puedes eliminar el usuario actual', 'warning');
        return;
    }
    
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    
    try {
        await db.collection('users').doc(userId).delete();
        showToast('Usuario eliminado', 'success');
        await loadUsers();
    } catch (error) {
        console.error('Error deleting user:', error);
        showToast('Error al eliminar usuario', 'error');
    }
}

// ========================================
// Task Management
// ========================================
async function loadTasks() {
    if (!state.currentUser) {
        state.tasks = [];
        renderAllTasks();
        return;
    }
    
    const dateKey = getDateKey();
    
    try {
        if (state.listeners.tasks) {
            state.listeners.tasks();
        }
        
        state.listeners.tasks = db.collection('tasks')
            .where('userId', '==', state.currentUser)
            .where('date', '==', dateKey)
            .onSnapshot(snapshot => {
                state.tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderAllTasks();
            }, error => {
                console.error('Error in tasks listener:', error);
            });
            
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

function renderAllTasks() {
    // Render each category
    renderPollings('argentina', elements.pollingsArgentinaList);
    renderPollings('regional', elements.pollingsRegionalList);
    renderBackups();
    renderProcesos();
    
    // Update stats
    updateStats();
}

function renderPollings(category, container) {
    if (!container) return;
    
    const categoryKey = category === 'argentina' ? 'pollings_argentina' : 'pollings_regional';
    const templateTasks = NOC_TASKS[categoryKey]?.tasks || [];
    
    container.innerHTML = '';
    
    templateTasks.forEach(templateTask => {
        const task = state.tasks.find(t => t.templateId === templateTask.id);
        
        const row = document.createElement('div');
        row.className = 'polling-row';
        row.id = `polling-row-${templateTask.id}`;
        
        const icon = category === 'argentina' ? '🇦🇷' : '🌎';
        
        row.innerHTML = `
            <div class="polling-col polling-col-name">
                <span class="polling-name-icon">${icon}</span>
                <span class="polling-name-text">${templateTask.name}</span>
            </div>
            <div class="polling-col polling-col-begin">
                <input type="time" class="time-input" id="begin-${templateTask.id}" value="${task?.beginTime || ''}" onchange="updateTaskTime('${task?.id || ''}', '${templateTask.id}', 'beginTime', this.value)">
            </div>
            <div class="polling-col polling-col-end">
                <input type="time" class="time-input" id="end-${templateTask.id}" value="${task?.endTime || ''}" onchange="updateTaskTime('${task?.id || ''}', '${templateTask.id}', 'endTime', this.value)">
            </div>
            <div class="polling-col polling-col-actions">
                <button class="action-btn paste-btn" onclick="pastePollingData('${templateTask.id}')" title="Pegar datos del AS400">📋</button>
            </div>
        `;
        
        container.appendChild(row);
    });
}

function getPollingStatus(task) {
    if (!task) return { class: 'pending', label: '⏳ Pendiente' };
    if (task.beginTime && task.endTime) return { class: 'completed', label: '✅ Completado' };
    if (task.beginTime || task.endTime) return { class: 'partial', label: '🔄 En progreso' };
    return { class: 'pending', label: '⏳ Pendiente' };
}

function renderBackups() {
    // Render backups by frequency
    renderBackupsByFrequency('backups_diarios', elements.backupsDiariosList);
    renderBackupsByFrequency('backups_semanales', elements.backupsSemanalesList);
    renderBackupsByFrequency('backups_mensuales', elements.backupsMensualesList);
}

function renderBackupsByFrequency(categoryKey, container) {
    if (!container) return;

    const templateTasks = NOC_TASKS[categoryKey]?.tasks || [];
    container.innerHTML = '';

    templateTasks.forEach(templateTask => {
        const task = state.tasks.find(t => t.templateId === templateTask.id);

        const row = document.createElement('div');
        row.className = `backup-row ${task?.beginTime && task?.endTime ? 'completed' : ''}`;

        row.innerHTML = `
            <div class="backup-col backup-col-name">
                <span>💾</span>
                <span>${templateTask.name}</span>
            </div>
            <div class="backup-col backup-col-job">
                <span class="job-badge">${templateTask.job || '-'}</span>
            </div>
            <div class="backup-col backup-col-begin">
                ${task?.beginTime
                    ? `<input type="time" class="time-input" value="${task.beginTime}" onchange="updateTaskTime('${task?.id || ''}', '${templateTask.id}', 'beginTime', this.value)">`
                    : `<input type="time" class="time-input" onchange="updateTaskTime('', '${templateTask.id}', 'beginTime', this.value)">`
                }
            </div>
            <div class="backup-col backup-col-end">
                ${task?.endTime
                    ? `<input type="time" class="time-input" value="${task.endTime}" onchange="updateTaskTime('${task?.id || ''}', '${templateTask.id}', 'endTime', this.value)">`
                    : `<input type="time" class="time-input" onchange="updateTaskTime('', '${templateTask.id}', 'endTime', this.value)">`
                }
            </div>
            <div class="backup-col backup-col-duration">
                <span class="duration-value">${task?.duration || '-'}</span>
            </div>
        `;

        container.appendChild(row);
    });
}

function renderProcesos() {
    if (!elements.procesosList) return;
    
    const templateTasks = NOC_TASKS.procesos?.tasks || [];
    elements.procesosList.innerHTML = '';
    
    templateTasks.forEach(templateTask => {
        const task = state.tasks.find(t => t.templateId === templateTask.id);
        const status = task?.status || 'pending';
        
        const card = document.createElement('div');
        card.className = `proceso-card status-${status}`;
        card.onclick = () => cycleProcessStatus(templateTask.id);
        
        const statusInfo = PROCESS_STATUS[status] || PROCESS_STATUS.pending;
        
        card.innerHTML = `
            <span class="proceso-icon">📤</span>
            <div class="proceso-info">
                <span class="proceso-name">${templateTask.name}</span>
                <span class="proceso-status">${statusInfo.icon} ${statusInfo.label}</span>
            </div>
        `;
        
        elements.procesosList.appendChild(card);
    });
}

async function cycleProcessStatus(templateId) {
    if (!state.currentUser) {
        showToast('Selecciona un usuario primero', 'warning');
        return;
    }
    
    const statuses = ['pending', 'ok', 'error', 'na'];
    const task = state.tasks.find(t => t.templateId === templateId);
    const currentStatus = task?.status || 'pending';
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    try {
        if (task?.id) {
            await db.collection('tasks').doc(task.id).update({
                status: nextStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await db.collection('tasks').add({
                templateId,
                userId: state.currentUser,
                date: getDateKey(),
                status: nextStatus,
                type: 'proceso',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        showToast(`Estado actualizado a: ${PROCESS_STATUS[nextStatus].label}`, 'success');
    } catch (error) {
        console.error('Error updating status:', error);
        showToast('Error al actualizar estado', 'error');
    }
}

async function updateTaskTime(taskId, templateId, field, value) {
    if (!state.currentUser) {
        showToast('Selecciona un usuario primero', 'warning');
        return;
    }
    
    try {
        if (taskId) {
            await db.collection('tasks').doc(taskId).update({
                [field]: value,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            const templateTask = getAllNOCTasks().find(t => t.id === templateId);
            const newTask = {
                templateId,
                userId: state.currentUser,
                date: getDateKey(),
                [field]: value,
                type: templateTask?.type || 'polling',
                category: templateTask?.category || 'otros',
                name: templateTask?.name || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const docRef = await db.collection('tasks').add(newTask);
            
            // Calculate duration if we have both times
            const task = state.tasks.find(t => t.templateId === templateId);
            if (field === 'endTime' && task?.beginTime) {
                const duration = calculateDuration(task.beginTime, value);
                await db.collection('tasks').doc(docRef.id).update({ duration });
            } else if (field === 'beginTime' && task?.endTime) {
                const duration = calculateDuration(value, task.endTime);
                await db.collection('tasks').doc(docRef.id).update({ duration });
            }
        }
        
        showToast('Hora actualizada', 'success');
    } catch (error) {
        console.error('Error updating time:', error);
        showToast('Error al actualizar hora', 'error');
    }
}

function calculateDuration(beginTime, endTime) {
    if (!beginTime || !endTime) return null;
    
    const [bh, bm] = beginTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    
    let totalMinutes = (eh * 60 + em) - (bh * 60 + bm);
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle overnight
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function updateStats() {
    // Argentina stats
    const argentinaTasks = NOC_TASKS.pollings_argentina?.tasks || [];
    const argentinaCompleted = argentinaTasks.filter(t => {
        const task = state.tasks.find(st => st.templateId === t.id);
        return task?.beginTime && task?.endTime;
    }).length;
    const argentinaTotal = argentinaTasks.length;
    elements.argentinaCount.textContent = `${argentinaCompleted}/${argentinaTotal}`;
    elements.argentinaProgress.style.width = argentinaTotal ? `${(argentinaCompleted / argentinaTotal) * 100}%` : '0%';
    elements.argentinaCounter.textContent = `${argentinaCompleted}/${argentinaTotal} completados`;

    // Regional stats
    const regionalTasks = NOC_TASKS.pollings_regional?.tasks || [];
    const regionalCompleted = regionalTasks.filter(t => {
        const task = state.tasks.find(st => st.templateId === t.id);
        return task?.beginTime && task?.endTime;
    }).length;
    const regionalTotal = regionalTasks.length;
    elements.regionalCount.textContent = `${regionalCompleted}/${regionalTotal}`;
    elements.regionalProgress.style.width = regionalTotal ? `${(regionalCompleted / regionalTotal) * 100}%` : '0%';
    elements.regionalCounter.textContent = `${regionalCompleted}/${regionalTotal} completados`;

    // Backups Diarios stats
    const backupsDiariosTasks = NOC_TASKS.backups_diarios?.tasks || [];
    const backupsDiariosCompleted = backupsDiariosTasks.filter(t => {
        const task = state.tasks.find(st => st.templateId === t.id);
        return task?.beginTime && task?.endTime;
    }).length;
    const backupsDiariosTotal = backupsDiariosTasks.length;
    if (elements.backupsDiariosCounter) {
        elements.backupsDiariosCounter.textContent = `${backupsDiariosCompleted}/${backupsDiariosTotal} completados`;
    }

    // Backups Semanales stats
    const backupsSemanalesTasks = NOC_TASKS.backups_semanales?.tasks || [];
    const backupsSemanalesCompleted = backupsSemanalesTasks.filter(t => {
        const task = state.tasks.find(st => st.templateId === t.id);
        return task?.beginTime && task?.endTime;
    }).length;
    const backupsSemanalesTotal = backupsSemanalesTasks.length;
    if (elements.backupsSemanalesCounter) {
        elements.backupsSemanalesCounter.textContent = `${backupsSemanalesCompleted}/${backupsSemanalesTotal} completados`;
    }

    // Backups Mensuales stats
    const backupsMensualesTasks = NOC_TASKS.backups_mensuales?.tasks || [];
    const backupsMensualesCompleted = backupsMensualesTasks.filter(t => {
        const task = state.tasks.find(st => st.templateId === t.id);
        return task?.beginTime && task?.endTime;
    }).length;
    const backupsMensualesTotal = backupsMensualesTasks.length;
    if (elements.backupsMensualesCounter) {
        elements.backupsMensualesCounter.textContent = `${backupsMensualesCompleted}/${backupsMensualesTotal} completados`;
    }

    // Total backups for dashboard
    const totalBackupsCompleted = backupsDiariosCompleted + backupsSemanalesCompleted + backupsMensualesCompleted;
    const totalBackupsTasks = backupsDiariosTotal + backupsSemanalesTotal + backupsMensualesTotal;
    elements.backupsCount.textContent = `${totalBackupsCompleted}/${totalBackupsTasks}`;
    elements.backupsProgress.style.width = totalBackupsTasks ? `${(totalBackupsCompleted / totalBackupsTasks) * 100}%` : '0%';

    // Procesos stats
    const procesosTasks = NOC_TASKS.procesos?.tasks || [];
    const procesosCompleted = procesosTasks.filter(t => {
        const task = state.tasks.find(st => st.templateId === t.id);
        return task?.status === 'ok';
    }).length;
    const procesosTotal = procesosTasks.length;
    elements.procesosCount.textContent = `${procesosCompleted}/${procesosTotal}`;
    elements.procesosProgress.style.width = procesosTotal ? `${(procesosCompleted / procesosTotal) * 100}%` : '0%';
    elements.procesosCounter.textContent = `${procesosCompleted}/${procesosTotal} completados`;

    // Overall
    const totalCompleted = argentinaCompleted + regionalCompleted + totalBackupsCompleted + procesosCompleted;
    const totalTasks = argentinaTotal + regionalTotal + totalBackupsTasks + procesosTotal;
    const overallPercent = totalTasks ? Math.round((totalCompleted / totalTasks) * 100) : 0;

    elements.overallPercent.textContent = `${overallPercent}%`;
    elements.overallProgressFill.style.width = `${overallPercent}%`;
}

// ========================================
// Initialize Day from Template
// ========================================
async function initDayFromTemplate() {
    if (!state.currentUser) {
        showToast('Selecciona un usuario primero', 'warning');
        return;
    }
    
    if (!confirm('¿Deseas cargar todas las tareas predefinidas para el día de hoy?')) return;
    
    const dateKey = getDateKey();
    let created = 0;
    
    const allTemplates = getAllNOCTasks();
    
    for (const template of allTemplates) {
        // Check if already exists
        const existing = state.tasks.find(t => t.templateId === template.id);
        if (!existing) {
            try {
                await db.collection('tasks').add({
                    templateId: template.id,
                    name: template.name,
                    description: template.description,
                    type: template.type,
                    category: template.category,
                    userId: state.currentUser,
                    date: dateKey,
                    status: 'pending',
                    beginTime: null,
                    endTime: null,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                created++;
            } catch (error) {
                console.error('Error creating task:', error);
            }
        }
    }
    
    showToast(`Se cargaron ${created} tareas`, 'success');
}

// ========================================
// Task Modal
// ========================================
function openTaskModal(templateId, type, category) {
    const task = state.tasks.find(t => t.templateId === templateId);
    const template = getAllNOCTasks().find(t => t.id === templateId);
    
    elements.taskForm.reset();
    document.getElementById('taskId').value = task?.id || '';
    document.getElementById('taskType').value = type;
    document.getElementById('taskCategory').value = category;
    document.getElementById('taskName').value = template?.name || '';
    
    if (type === 'proceso') {
        document.getElementById('timeFields').classList.add('hidden');
        document.getElementById('statusField').classList.remove('hidden');
        document.getElementById('taskStatus').value = task?.status || 'pending';
    } else {
        document.getElementById('timeFields').classList.remove('hidden');
        document.getElementById('statusField').classList.add('hidden');
        document.getElementById('taskBeginTime').value = task?.beginTime || '';
        document.getElementById('taskEndTime').value = task?.endTime || '';
    }
    
    document.getElementById('taskNotes').value = task?.notes || '';
    elements.taskModalTitle.textContent = `Editar: ${template?.name || 'Tarea'}`;
    
    openModal('taskModal');
}

async function handleTaskSubmit(e) {
    e.preventDefault();
    
    if (!state.currentUser) return;
    
    const taskId = document.getElementById('taskId').value;
    const type = document.getElementById('taskType').value;
    const category = document.getElementById('taskCategory').value;
    const name = document.getElementById('taskName').value;
    const notes = document.getElementById('taskNotes').value;
    
    const updateData = {
        notes,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    if (type === 'proceso') {
        updateData.status = document.getElementById('taskStatus').value;
    } else {
        updateData.beginTime = document.getElementById('taskBeginTime').value;
        updateData.endTime = document.getElementById('taskEndTime').value;
        
        if (updateData.beginTime && updateData.endTime) {
            updateData.duration = calculateDuration(updateData.beginTime, updateData.endTime);
        }
    }
    
    try {
        if (taskId) {
            await db.collection('tasks').doc(taskId).update(updateData);
        }
        
        closeModal('taskModal');
        showToast('Tarea actualizada', 'success');
        
    } catch (error) {
        console.error('Error saving task:', error);
        showToast('Error al guardar', 'error');
    }
}

// ========================================
// Reports
// ========================================
function initReportsView() {
    if (elements.reportDateMain) {
        elements.reportDateMain.value = getDateKey();
    }
}

async function generateReportFromView() {
    const reportDate = elements.reportDateMain.value;
    if (!reportDate) {
        showToast('Selecciona una fecha', 'warning');
        return;
    }
    
    try {
        const snapshot = await db.collection('tasks')
            .where('userId', '==', state.currentUser)
            .where('date', '==', reportDate)
            .get();
        
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const reportText = generateReportText(tasks, reportDate);
        
        elements.reportContentMain.textContent = reportText;
        elements.reportPreview.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error generating report:', error);
        showToast('Error al generar informe', 'error');
    }
}

function generateReportText(tasks, dateStr) {
    const user = state.users.find(u => u.id === state.currentUser);
    const userName = user ? user.name : 'Usuario';
    
    const dateObj = new Date(dateStr + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    let text = `═══════════════════════════════════════════════════════════════\n`;
    text += `                    BITÁCORA NOC - AS400\n`;
    text += `═══════════════════════════════════════════════════════════════\n\n`;
    text += `📅 Fecha: ${formattedDate}\n`;
    text += `👤 Operador: ${userName}\n\n`;
    
    // Pollings Argentina
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🇦🇷 POLLINGS DE ARGENTINA\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    NOC_TASKS.pollings_argentina?.tasks.forEach(template => {
        const task = tasks.find(t => t.templateId === template.id);
        const begin = task?.beginTime || '--:--';
        const end = task?.endTime || '--:--';
        text += `  ${template.name.padEnd(20)} | Begin: ${begin} | End: ${end}\n`;
    });
    
    // Pollings Regional
    text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🌎 POLLINGS DE REGIONAL\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    NOC_TASKS.pollings_regional?.tasks.forEach(template => {
        const task = tasks.find(t => t.templateId === template.id);
        const begin = task?.beginTime || '--:--';
        const end = task?.endTime || '--:--';
        text += `  ${template.name.padEnd(20)} | Begin: ${begin} | End: ${end}\n`;
    });
    
    // Backups
    text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💾 BACKUPS\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `  Servidor           | JOB         | Inicio | Fin   | Duración\n`;
    text += `  ${'─'.repeat(65)}\n`;
    
    NOC_TASKS.backups?.tasks.forEach(template => {
        const task = tasks.find(t => t.templateId === template.id);
        const begin = task?.beginTime || '--:--';
        const end = task?.endTime || '--:--';
        const duration = task?.duration || '--:--';
        text += `  ${template.name.padEnd(18)} | ${(template.job || '-').padEnd(11)} | ${begin}  | ${end}  | ${duration}\n`;
    });
    
    // Procesos
    text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📤 PROCESOS / ENVÍO DE ARCHIVOS\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    NOC_TASKS.procesos?.tasks.forEach(template => {
        const task = tasks.find(t => t.templateId === template.id);
        const status = task?.status || 'pending';
        const statusInfo = PROCESS_STATUS[status] || PROCESS_STATUS.pending;
        text += `  ${template.name.padEnd(25)} | ${statusInfo.icon} ${statusInfo.label}\n`;
    });
    
    text += `\n═══════════════════════════════════════════════════════════════\n`;
    
    return text;
}

function copyReportToClipboard() {
    const reportText = elements.reportContentMain.textContent;
    navigator.clipboard.writeText(reportText)
        .then(() => showToast('Informe copiado al portapapeles', 'success'))
        .catch(() => showToast('Error al copiar', 'error'));
}

function exportReport() {
    const reportText = elements.reportContentMain.textContent;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitacora-noc-${elements.reportDateMain.value}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Informe exportado', 'success');
}

function exportToExcel() {
    showToast('Exportación a Excel disponible próximamente', 'info');
}

// ========================================
// Settings & Data Export
// ========================================
async function exportAllData() {
    if (!state.currentUser) {
        showToast('Selecciona un usuario primero', 'warning');
        return;
    }
    
    try {
        const snapshot = await db.collection('tasks')
            .where('userId', '==', state.currentUser)
            .get();
        
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const exportData = {
            user: state.users.find(u => u.id === state.currentUser),
            tasks,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `noc-data-${state.currentUser}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Datos exportados correctamente', 'success');
        
    } catch (error) {
        console.error('Error exporting data:', error);
        showToast('Error al exportar datos', 'error');
    }
}

// ========================================
// Modal Utilities
// ========================================
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ========================================
// Toast Notifications
// ========================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 4000);
}

// ========================================
// Utility Functions
// ========================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// Paste Polling Data from AS400
// ========================================
function pastePollingData(templateId) {
    // Create a simple prompt for pasting
    const text = prompt('Pegá los datos del AS400:\n\nEjemplo:\nBeginni\t29/04/26\t02:39:23\nEnding\t29/04/26\t05:08:55');
    
    if (!text) return;
    
    // Parse the text to extract times
    // Format: "Beginni\t29/04/26\t02:39:23" or "Ending\t29/04/26\t05:08:55"
    const lines = text.split('\n');
    let beginTime = null;
    let endTime = null;
    
    lines.forEach(line => {
        // Match time pattern HH:MM:SS
        const timeMatch = line.match(/(\d{2}:\d{2}:\d{2})/);
        if (timeMatch) {
            const time = timeMatch[1].substring(0, 5); // Take only HH:MM
            
            if (line.toLowerCase().includes('beginni') || line.toLowerCase().includes('begin')) {
                beginTime = time;
            } else if (line.toLowerCase().includes('ending') || line.toLowerCase().includes('end')) {
                endTime = time;
            }
        }
    });
    
    // Update the time fields
    if (beginTime) {
        const beginInput = document.getElementById(`begin-${templateId}`);
        if (beginInput) {
            beginInput.value = beginTime;
            updateTaskTime('', templateId, 'beginTime', beginTime);
        }
    }
    
    if (endTime) {
        const endInput = document.getElementById(`end-${templateId}`);
        if (endInput) {
            endInput.value = endTime;
            updateTaskTime('', templateId, 'endTime', endTime);
        }
    }
    
    if (beginTime || endTime) {
        showToast(`Horas actualizadas: ${beginTime || '-'} → ${endTime || '-'}`, 'success');
    } else {
        showToast('No se encontraron horas válidas en el texto', 'warning');
    }
}

// ========================================
// Import from Excel
// ========================================
async function handleExcelImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!state.currentUser) {
        showToast('Selecciona un usuario primero', 'warning');
        return;
    }

    showToast('Leyendo archivo Excel...', 'info');

    try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        if (jsonData.length < 2) {
            showToast('El archivo está vacío o no tiene datos', 'error');
            return;
        }

        // Find header row
        const headers = jsonData[0].map(h => String(h || '').toLowerCase().trim());
        
        // Map column indices
        const colMap = {
            tarea: -1,
            polling: -1,
            nombre: -1,
            servidor: -1,
            inicio: -1,
            begin: -1,
            fin: -1,
            end: -1,
            estado: -1,
            status: -1
        };

        headers.forEach((h, i) => {
            if (h.includes('tarea') || h.includes('polling') || h.includes('nombre') || h.includes('servidor')) {
                colMap.tarea = i;
            }
            if (h.includes('inicio') || h.includes('begin')) {
                colMap.inicio = i;
            }
            if (h.includes('fin') || h.includes('end')) {
                colMap.fin = i;
            }
            if (h.includes('estado') || h.includes('status')) {
                colMap.estado = i;
            }
        });

        // Get all template tasks for matching
        const allTemplates = getAllNOCTasks();
        let imported = 0;

        // Process each data row
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;

            const tareaName = String(row[colMap.tarea] || '').trim();
            if (!tareaName) continue;

            // Find matching template
            const template = allTemplates.find(t => 
                t.name.toLowerCase() === tareaName.toLowerCase() ||
                tareaName.toLowerCase().includes(t.name.toLowerCase()) ||
                t.name.toLowerCase().includes(tareaName.toLowerCase())
            );

            if (!template) continue;

            // Get times
            let beginTime = '';
            let endTime = '';
            
            if (colMap.inicio >= 0) {
                beginTime = parseExcelTime(row[colMap.inicio]);
            }
            if (colMap.fin >= 0) {
                endTime = parseExcelTime(row[colMap.fin]);
            }

            // Get status for procesos
            let status = null;
            if (colMap.estado >= 0 && template.type === 'proceso') {
                const statusText = String(row[colMap.estado] || '').toLowerCase();
                if (statusText.includes('ok') || statusText.includes('✅')) {
                    status = 'ok';
                } else if (statusText.includes('error') || statusText.includes('❌')) {
                    status = 'error';
                } else if (statusText.includes('n/a') || statusText.includes('—')) {
                    status = 'na';
                }
            }

            // Check if task exists
            const existingTask = state.tasks.find(t => t.templateId === template.id);

            try {
                if (existingTask) {
                    // Update existing task
                    const updateData = { updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
                    if (beginTime) updateData.beginTime = beginTime;
                    if (endTime) updateData.endTime = endTime;
                    if (status) updateData.status = status;
                    
                    if (beginTime && endTime) {
                        updateData.duration = calculateDuration(beginTime, endTime);
                    }

                    await db.collection('tasks').doc(existingTask.id).update(updateData);
                } else {
                    // Create new task
                    const newTask = {
                        templateId: template.id,
                        name: template.name,
                        userId: state.currentUser,
                        date: getDateKey(),
                        type: template.type,
                        category: template.category,
                        beginTime: beginTime || null,
                        endTime: endTime || null,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    };

                    if (status) newTask.status = status;
                    if (beginTime && endTime) {
                        newTask.duration = calculateDuration(beginTime, endTime);
                    }

                    await db.collection('tasks').add(newTask);
                }
                imported++;
            } catch (e) {
                console.error('Error importing task:', e);
            }
        }

        showToast(`Importadas ${imported} tareas desde Excel`, 'success');
        
        // Clear file input
        event.target.value = '';
        
    } catch (error) {
        console.error('Error reading Excel:', error);
        showToast('Error al leer el archivo Excel', 'error');
    }
}

function parseExcelTime(value) {
    if (!value && value !== 0) return '';
    
    // If it's a number (Excel time serial)
    if (typeof value === 'number') {
        // Excel time is fraction of day
        const totalMinutes = Math.round(value * 24 * 60);
        const hours = Math.floor(totalMinutes / 60) % 24;
        const minutes = totalMinutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // If it's a string
    const str = String(value).trim();
    
    // Already in HH:MM format
    if (/^\d{1,2}:\d{2}$/.test(str)) {
        const [h, m] = str.split(':');
        return `${h.padStart(2, '0')}:${m}`;
    }
    
    // Format like "02:39:23" (with seconds)
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(str)) {
        const [h, m] = str.split(':');
        return `${h.padStart(2, '0')}:${m}`;
    }
    
    return '';
}

// Make functions globally available
window.toggleTask = toggleTask;
window.editTask = editTask;
window.deleteTask = deleteTask;
window.deleteUser = deleteUser;
window.selectUser = selectUser;
window.openModal = openModal;
window.closeModal = closeModal;
window.navigateTo = navigateTo;
window.updateTaskTime = updateTaskTime;
window.cycleProcessStatus = cycleProcessStatus;
window.openTaskModal = openTaskModal;
window.initDayFromTemplate = initDayFromTemplate;
window.exportToExcel = exportToExcel;
window.pastePollingData = pastePollingData;
window.handleExcelImport = handleExcelImport;

// Export initApp for auth.js
window.initApp = initApp;
