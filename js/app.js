// ========================================
// Cronograma NOC - Main Application
// ========================================

// Application State
const state = {
    currentDate: new Date(),
    currentUser: null,
    users: [],
    tasks: [],
    listeners: {}
};

// DOM Elements
const elements = {
    // Will be populated on DOM ready
};

// ========================================
// Initialization
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initElements();
    initEventListeners();
    loadUsers();
    renderCurrentDate();
    checkFirebaseConnection();
});

function initElements() {
    elements.currentUser = document.getElementById('currentUser');
    elements.displayDate = document.getElementById('displayDate');
    elements.tasksList = document.getElementById('tasksList');
    elements.emptyState = document.getElementById('emptyState');
    elements.completedCount = document.getElementById('completedCount');
    elements.pendingCount = document.getElementById('pendingCount');
    elements.progressPercent = document.getElementById('progressPercent');
    elements.progressFill = document.getElementById('progressFill');
    elements.taskModal = document.getElementById('taskModal');
    elements.taskForm = document.getElementById('taskForm');
    elements.taskModalTitle = document.getElementById('taskModalTitle');
    elements.reportModal = document.getElementById('reportModal');
    elements.reportDate = document.getElementById('reportDate');
    elements.reportContent = document.getElementById('reportContent');
    elements.userModal = document.getElementById('userModal');
    elements.userForm = document.getElementById('userForm');
}

function initEventListeners() {
    // Navigation
    document.getElementById('prevDay').addEventListener('click', () => navigateDay(-1));
    document.getElementById('nextDay').addEventListener('click', () => navigateDay(1));
    document.getElementById('todayBtn').addEventListener('click', goToToday);
    
    // User
    elements.currentUser.addEventListener('change', handleUserChange);
    document.getElementById('addUserBtn').addEventListener('click', () => openModal('userModal'));
    elements.userForm.addEventListener('submit', handleUserSubmit);
    
    // Tasks
    document.getElementById('addTaskBtn').addEventListener('click', () => openTaskModal());
    elements.taskForm.addEventListener('submit', handleTaskSubmit);
    
    // Report
    document.getElementById('reportBtn').addEventListener('click', openReportModal);
    elements.reportDate.addEventListener('change', loadReportData);
    document.getElementById('copyReportBtn').addEventListener('click', copyReportToClipboard);
    document.getElementById('exportReportBtn').addEventListener('click', exportReport);
    
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
// Firebase Connection Check
// ========================================
async function checkFirebaseConnection() {
    try {
        // Try to read from a test collection
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
        renderUserSelect();
        
        // Try to restore last user from localStorage
        const lastUser = localStorage.getItem('noc_lastUser');
        if (lastUser && state.users.find(u => u.id === lastUser)) {
            elements.currentUser.value = lastUser;
            state.currentUser = lastUser;
            loadTasks();
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showToast('Error al cargar usuarios', 'error');
    }
}

function renderUserSelect() {
    elements.currentUser.innerHTML = '<option value="">Seleccionar...</option>';
    state.users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${getShiftLabel(user.shift)})`;
        elements.currentUser.appendChild(option);
    });
}

function getShiftLabel(shift) {
    const labels = {
        'mañana': 'Mañana',
        'tarde': 'Tarde',
        'noche': 'Noche'
    };
    return labels[shift] || shift;
}

function handleUserChange(e) {
    state.currentUser = e.target.value;
    if (state.currentUser) {
        localStorage.setItem('noc_lastUser', state.currentUser);
        loadTasks();
    } else {
        state.tasks = [];
        renderTasks();
    }
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
        loadUsers();
        
        // Auto-select new user
        setTimeout(() => {
            elements.currentUser.value = docRef.id;
            state.currentUser = docRef.id;
            loadTasks();
        }, 100);
        
    } catch (error) {
        console.error('Error creating user:', error);
        showToast('Error al crear usuario', 'error');
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
        // Setup real-time listener
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
                // Fallback: try without ordering if index not ready
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
        // Sort locally
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
        
        // Optimistic update
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
            // Update existing task
            await db.collection('tasks').doc(taskId).update(taskData);
            showToast('Tarea actualizada correctamente', 'success');
        } else {
            // Create new task
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
// Report Modal
// ========================================
function openReportModal() {
    if (!state.currentUser) {
        showToast('Por favor, selecciona un usuario primero', 'warning');
        return;
    }
    
    // Set default date to current
    elements.reportDate.value = getDateKey();
    openModal('reportModal');
    loadReportData();
}

async function loadReportData() {
    const reportDate = elements.reportDate.value;
    if (!reportDate) return;
    
    try {
        const snapshot = await db.collection('tasks')
            .where('userId', '==', state.currentUser)
            .where('date', '==', reportDate)
            .get();
        
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderReport(tasks, reportDate);
        
    } catch (error) {
        console.error('Error loading report:', error);
        showToast('Error al cargar informe', 'error');
    }
}

function renderReport(tasks, dateStr) {
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
    
    elements.reportContent.innerHTML = `
        <div class="report-header">
            <h4>📋 Informe de Actividades</h4>
            <p><strong>${userName}</strong> | ${formattedDate}</p>
        </div>
        
        <div class="report-summary">
            <div class="report-stat">
                <div class="report-stat-value">${total}</div>
                <div class="report-stat-label">Total</div>
            </div>
            <div class="report-stat">
                <div class="report-stat-value" style="color: var(--success)">${completed.length}</div>
                <div class="report-stat-label">Completadas</div>
            </div>
            <div class="report-stat">
                <div class="report-stat-value" style="color: var(--warning)">${pending.length}</div>
                <div class="report-stat-label">Pendientes</div>
            </div>
            <div class="report-stat">
                <div class="report-stat-value">${progress}%</div>
                <div class="report-stat-label">Progreso</div>
            </div>
        </div>
        
        ${completed.length > 0 ? `
            <div class="report-section">
                <h5>✅ Tareas Completadas</h5>
                <ul class="report-task-list">
                    ${completed.map(t => `
                        <li class="report-task-item completed">
                            <span class="report-task-status">✅</span>
                            <span class="report-task-name">${escapeHtml(t.name)}</span>
                            ${t.time ? `<span class="report-task-time">${t.time}</span>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        ` : ''}
        
        ${pending.length > 0 ? `
            <div class="report-section">
                <h5>⏳ Tareas Pendientes</h5>
                <ul class="report-task-list">
                    ${pending.map(t => `
                        <li class="report-task-item">
                            <span class="report-task-status">⬜</span>
                            <span class="report-task-name">${escapeHtml(t.name)}</span>
                            ${t.time ? `<span class="report-task-time">${t.time}</span>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        ` : ''}
        
        ${total === 0 ? `
            <div class="report-section" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <p>No hay tareas registradas para esta fecha</p>
            </div>
        ` : ''}
    `;
}

function copyReportToClipboard() {
    const reportText = generateReportText();
    navigator.clipboard.writeText(reportText)
        .then(() => showToast('Informe copiado al portapapeles', 'success'))
        .catch(() => showToast('Error al copiar', 'error'));
}

function generateReportText() {
    const reportDate = elements.reportDate.value;
    const tasks = state.tasks.filter(t => t.date === reportDate);
    
    const completed = tasks.filter(t => t.completed);
    const pending = tasks.filter(t => !t.completed);
    const total = tasks.length;
    const progress = total > 0 ? Math.round((completed.length / total) * 100) : 0;
    
    const user = state.users.find(u => u.id === state.currentUser);
    const userName = user ? user.name : 'Usuario';
    
    const dateObj = new Date(reportDate + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
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

function exportReport() {
    const reportText = generateReportText();
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `informe-noc-${elements.reportDate.value}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Informe exportado', 'success');
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
    
    // Auto remove after 4 seconds
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
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally available
window.toggleTask = toggleTask;
window.editTask = editTask;
window.deleteTask = deleteTask;
window.openModal = openModal;
window.closeModal = closeModal;
