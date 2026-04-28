// ========================================
// Cronograma NOC - Main Application
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
document.addEventListener('DOMContentLoaded', () => {
    initElements();
    initEventListeners();
    initSidebarState();
    loadUsers();
    renderCurrentDate();
    updateHeaderDate();
    checkFirebaseConnection();
});

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
    
    // Tasks
    elements.tasksList = document.getElementById('tasksList');
    elements.emptyState = document.getElementById('emptyState');
    elements.taskModal = document.getElementById('taskModal');
    elements.taskForm = document.getElementById('taskForm');
    elements.taskModalTitle = document.getElementById('taskModalTitle');
    
    // Stats
    elements.totalCount = document.getElementById('totalCount');
    elements.completedCount = document.getElementById('completedCount');
    elements.pendingCount = document.getElementById('pendingCount');
    elements.progressPercent = document.getElementById('progressPercent');
    elements.progressFill = document.getElementById('progressFill');
    
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
    elements.settingSounds = document.getElementById('settingSounds');
    elements.exportDataBtn = document.getElementById('exportDataBtn');
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
    
    // Tasks
    document.getElementById('addTaskBtn').addEventListener('click', () => openTaskModal());
    elements.taskForm.addEventListener('submit', handleTaskSubmit);
    
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
        tasks: { title: 'Mis Tareas', subtitle: 'Gestiona y organiza tus tareas' },
        reports: { title: 'Informes', subtitle: 'Genera y exporta informes de actividades' },
        templates: { title: 'Plantillas', subtitle: 'Crea plantillas para tareas recurrentes' },
        users: { title: 'Usuarios', subtitle: 'Gestión de usuarios y turnos' },
        history: { title: 'Historial', subtitle: 'Revisa el historial de tareas completadas' },
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
    try {
        await db.collection('_test_').doc('connection').get();
        console.log('✅ Firebase conectado correctamente');
    } catch (error) {
        console.error('❌ Error de conexión Firebase:', error);
        showToast('Error de conexión con Firebase. Verifica la configuración.', 'error');
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
        
        // Restore last user from localStorage
        const lastUser = localStorage.getItem('noc_lastUser');
        if (lastUser && state.users.find(u => u.id === lastUser)) {
            selectUser(lastUser);
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Error al cargar usuarios', 'error');
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
        
        // Auto-select new user
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
        renderTasks();
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
            .orderBy('time', 'asc')
            .orderBy('createdAt', 'asc')
            .onSnapshot(snapshot => {
                state.tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderTasks();
            }, error => {
                console.error('Error in tasks listener:', error);
                loadTasksFallback();
            });
            
    } catch (error) {
        console.error('Error loading tasks:', error);
        loadTasksFallback();
    }
}

async function loadTasksFallback() {
    const dateKey = getDateKey();
    try {
        const snapshot = await db.collection('tasks')
            .where('userId', '==', state.currentUser)
            .where('date', '==', dateKey)
            .get();
        
        state.tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        state.tasks.sort((a, b) => {
            if (a.time && b.time) return a.time.localeCompare(b.time);
            if (a.time) return -1;
            if (b.time) return 1;
            return 0;
        });
        renderTasks();
    } catch (error) {
        console.error('Fallback error:', error);
        showToast('Error al cargar tareas', 'error');
    }
}

function renderTasks() {
    elements.tasksList.innerHTML = '';
    
    const completed = state.tasks.filter(t => t.completed).length;
    const total = state.tasks.length;
    const pending = total - completed;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    elements.totalCount.textContent = total;
    elements.completedCount.textContent = completed;
    elements.pendingCount.textContent = pending;
    elements.progressPercent.textContent = `${progress}%`;
    elements.progressFill.style.width = `${progress}%`;
    
    if (state.tasks.length === 0) {
        elements.tasksList.classList.add('hidden');
        elements.emptyState.classList.remove('hidden');
        return;
    }
    
    elements.tasksList.classList.remove('hidden');
    elements.emptyState.classList.add('hidden');
    
    state.tasks.forEach(task => {
        const taskEl = createTaskElement(task);
        elements.tasksList.appendChild(taskEl);
    });
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-item ${task.completed ? 'completed' : ''}`;
    div.dataset.id = task.id;
    
    const priorityClass = `priority-${task.priority || 'media'}`;
    const categoryIcon = getCategoryIcon(task.category);
    
    div.innerHTML = `
        <label class="task-toggle">
            <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task.id}', this.checked)">
            <span class="toggle-slider"></span>
        </label>
        <div class="task-content">
            <div class="task-header">
                <span class="task-name">${escapeHtml(task.name)}</span>
                <span class="task-category">${categoryIcon} ${getCategoryLabel(task.category)}</span>
            </div>
            ${task.description ? `<p class="task-description">${escapeHtml(task.description)}</p>` : ''}
            <div class="task-meta">
                ${task.time ? `<span class="task-time">🕐 ${task.time}</span>` : ''}
                <span class="task-priority ${priorityClass}">${getPriorityLabel(task.priority)}</span>
            </div>
        </div>
        <div class="task-actions">
            <button onclick="editTask('${task.id}')" title="Editar">✏️</button>
            <button class="delete" onclick="deleteTask('${task.id}')" title="Eliminar">🗑️</button>
        </div>
    `;
    
    return div;
}

function getCategoryIcon(category) {
    const icons = {
        'monitoreo': '🔍',
        'incidentes': '🚨',
        'mantenimiento': '🔧',
        'reportes': '📊',
        'reuniones': '👥',
        'otros': '📌'
    };
    return icons[category] || '📌';
}

function getCategoryLabel(category) {
    const labels = {
        'monitoreo': 'Monitoreo',
        'incidentes': 'Incidentes',
        'mantenimiento': 'Mantenimiento',
        'reportes': 'Reportes',
        'reuniones': 'Reuniones',
        'otros': 'Otros'
    };
    return labels[category] || 'Otros';
}

function getPriorityLabel(priority) {
    const labels = {
        'baja': '🟢 Baja',
        'media': '🟡 Media',
        'alta': '🟠 Alta',
        'critica': '🔴 Crítica'
    };
    return labels[priority] || '🟡 Media';
}

async function toggleTask(taskId, completed) {
    try {
        await db.collection('tasks').doc(taskId).update({
            completed,
            completedAt: completed ? firebase.firestore.FieldValue.serverTimestamp() : null
        });
        
        const task = state.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = completed;
            renderTasks();
        }
        
        showToast(completed ? 'Tarea completada ✅' : 'Tarea pendiente', 'success');
    } catch (error) {
        console.error('Error toggling task:', error);
        showToast('Error al actualizar tarea', 'error');
    }
}

function openTaskModal(task = null) {
    if (!state.currentUser) {
        showToast('Por favor, selecciona un usuario primero', 'warning');
        return;
    }
    
    elements.taskForm.reset();
    document.getElementById('taskId').value = '';
    
    if (task) {
        elements.taskModalTitle.textContent = 'Editar Tarea';
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskName').value = task.name;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskCategory').value = task.category || 'otros';
        document.getElementById('taskPriority').value = task.priority || 'media';
        document.getElementById('taskTime').value = task.time || '';
    } else {
        elements.taskModalTitle.textContent = 'Nueva Tarea';
    }
    
    openModal('taskModal');
}

function editTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
        openTaskModal(task);
    }
}

async function handleTaskSubmit(e) {
    e.preventDefault();
    
    if (!state.currentUser) {
        showToast('Por favor, selecciona un usuario primero', 'warning');
        return;
    }
    
    const taskId = document.getElementById('taskId').value;
    const taskData = {
        name: document.getElementById('taskName').value.trim(),
        description: document.getElementById('taskDescription').value.trim(),
        category: document.getElementById('taskCategory').value,
        priority: document.getElementById('taskPriority').value,
        time: document.getElementById('taskTime').value,
        userId: state.currentUser,
        date: getDateKey(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        if (taskId) {
            await db.collection('tasks').doc(taskId).update(taskData);
            showToast('Tarea actualizada correctamente', 'success');
        } else {
            taskData.completed = false;
            taskData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('tasks').add(taskData);
            showToast('Tarea creada correctamente', 'success');
        }
        
        closeModal('taskModal');
        elements.taskForm.reset();
        
    } catch (error) {
        console.error('Error saving task:', error);
        showToast('Error al guardar tarea', 'error');
    }
}

async function deleteTask(taskId) {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;
    
    try {
        await db.collection('tasks').doc(taskId).delete();
        showToast('Tarea eliminada', 'success');
    } catch (error) {
        console.error('Error deleting task:', error);
        showToast('Error al eliminar tarea', 'error');
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
    const completed = tasks.filter(t => t.completed);
    const pending = tasks.filter(t => !t.completed);
    const total = tasks.length;
    const progress = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    
    const user = state.users.find(u => u.id === state.currentUser);
    const userName = user ? user.name : 'Usuario';
    
    const dateObj = new Date(dateStr + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const format = elements.reportFormat?.value || 'text';
    
    let text = `📋 INFORME NOC - ${userName}\n`;
    text += `📅 ${formattedDate}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📊 Resumen:\n`;
    text += `   Total: ${total} | Completadas: ${completed.length} | Pendientes: ${pending.length} | Progreso: ${progress}%\n\n`;
    
    if (completed.length > 0) {
        text += `✅ Tareas Completadas:\n`;
        completed.forEach(t => {
            text += `   • ${t.name}${t.time ? ` (${t.time})` : ''}\n`;
        });
        text += `\n`;
    }
    
    if (pending.length > 0) {
        text += `⏳ Tareas Pendientes:\n`;
        pending.forEach(t => {
            text += `   • ${t.name}${t.time ? ` (${t.time})` : ''}\n`;
        });
    }
    
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
    a.download = `informe-noc-${elements.reportDateMain.value}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Informe exportado', 'success');
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

// Make functions globally available
window.toggleTask = toggleTask;
window.editTask = editTask;
window.deleteTask = deleteTask;
window.deleteUser = deleteUser;
window.selectUser = selectUser;
window.openModal = openModal;
window.closeModal = closeModal;
