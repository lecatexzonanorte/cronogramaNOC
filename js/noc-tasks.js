// ========================================
// Cronograma NOC - Tareas Predefinidas
// ========================================

// Estructura de tareas típicas del NOC
const NOC_TASKS = {
    // Pollings de Argentina
    pollings_argentina: {
        name: "Pollings de Argentina",
        icon: "🇦🇷",
        tasks: [
            { id: 'arg_ps', name: 'Argentina P$', description: 'Polling Argentina P$', type: 'polling' },
            { id: 'arg_p1', name: 'Argentina P1', description: 'Polling Argentina P1', type: 'polling' },
            { id: 'arg_p2', name: 'Argentina P2', description: 'Polling Argentina P2', type: 'polling' }
        ]
    },
    
    // Pollings de Regional
    pollings_regional: {
        name: "Pollings de Regional",
        icon: "🌎",
        tasks: [
            // Perú
            { id: 'peru_d1', name: 'Perú D1', description: 'Polling Perú D1', type: 'polling' },
            { id: 'peru_d2', name: 'Perú D2', description: 'Polling Perú D2', type: 'polling' },
            { id: 'peru_d3', name: 'Perú D3', description: 'Polling Perú D3', type: 'polling' },
            { id: 'peru_aserviban', name: 'Perú Aserviban MT', description: 'Polling Perú Aserviban MT', type: 'polling' },
            { id: 'peru_oc', name: 'Perú OC', description: 'Polling Perú OC', type: 'polling' },
            { id: 'peru_x30', name: 'Perú X30', description: 'Polling Perú X30 (a partir 12hs)', type: 'polling' },
            
            // Panamá
            { id: 'panama_d1', name: 'Panamá D1', description: 'Polling Panamá D1', type: 'polling' },
            { id: 'panama_mt', name: 'Panamá MT', description: 'Polling Panamá MT', type: 'polling' },
            { id: 'panama_oc', name: 'Panamá OC', description: 'Polling Panamá OC', type: 'polling' },
            { id: 'panama_ap', name: 'Panamá A. Propias', description: 'Polling Panamá Aplicaciones Propias', type: 'polling' },
            
            // Chile
            { id: 'chile_mt', name: 'Chile MT', description: 'Polling Chile MT', type: 'polling' },
            { id: 'chile_op', name: 'Chile OP', description: 'Polling Chile OP', type: 'polling' },
            { id: 'chile_vigo', name: 'Chile Vigo', description: 'Polling Chile Vigo', type: 'polling' },
            { id: 'chile_oc', name: 'Chile OC', description: 'Polling Chile OC', type: 'polling' },
            { id: 'chile_cencosud', name: 'Chile Cencosud', description: 'Polling Chile Cencosud', type: 'polling' },
            { id: 'chile_losheroes', name: 'Chile Los Heroes', description: 'Polling Chile Los Heroes', type: 'polling' },
            { id: 'chile_cencopay', name: 'Chile CencoPay', description: 'Polling Chile CencoPay', type: 'polling' },
            
            // México
            { id: 'mexico_sie', name: 'México - SIE - M1', description: 'Polling México SIE M1', type: 'polling' },
            { id: 'mexico_gde', name: 'México - GDE - M2', description: 'Polling México GDE M2', type: 'polling' }
        ]
    },
    
    // Backups Diarios (Lunes a Viernes)
    backups_diarios: {
        name: "Backups Diarios",
        icon: "📅",
        schedule: "Lunes a Viernes",
        tasks: [
            { id: 'bkp_diario_regional', name: 'Regional', description: 'Backup Diario Regional', type: 'backup', job: 'BKPDIARIOU', frequency: 'diario' },
            { id: 'bkp_diario_pinot', name: 'Pinot', description: 'Backup Diario Pinot', type: 'backup', job: 'BKPDIARIO', frequency: 'diario' },
            { id: 'bkp_diario_semillon', name: 'Semillon', description: 'Backup Diario Semillon', type: 'backup', job: 'BKPDIARIO', frequency: 'diario' }
        ]
    },

    // Backups Semanales (Domingos a la madrugada)
    backups_semanales: {
        name: "Backups Semanales",
        icon: "📆",
        schedule: "Domingos a la madrugada",
        tasks: [
            { id: 'bkp_semanal_regional', name: 'Regional', description: 'Backup Semanal Regional', type: 'backup', job: 'BKPSEMANAL', frequency: 'semanal' },
            { id: 'bkp_semanal_pinot', name: 'Pinot', description: 'Backup Semanal Pinot', type: 'backup', job: 'BKPSEMANAL', frequency: 'semanal' },
            { id: 'bkp_semanal_semillon', name: 'Semillon', description: 'Backup Semanal Semillon', type: 'backup', job: 'BKPSEMANAL', frequency: 'semanal' },
            { id: 'bkp_semanal_regdrs', name: 'REGDRS', description: 'Backup Semanal REGDRS', type: 'backup', job: 'BKPSEMANAL', frequency: 'semanal' },
            { id: 'bkp_semanal_merlot', name: 'Merlot', description: 'Backup Semanal Merlot', type: 'backup', job: 'BKPSEMANAL', frequency: 'semanal' }
        ]
    },

    // Backups Mensuales (Primer fin de semana del mes)
    backups_mensuales: {
        name: "Backups Mensuales",
        icon: "🗓️",
        schedule: "Primer fin de semana del mes",
        tasks: [
            { id: 'bkp_mensual_regional', name: 'Regional', description: 'Backup Mensual Regional', type: 'backup', job: 'BKPMENSUAL', frequency: 'mensual' },
            { id: 'bkp_mensual_pinot', name: 'Pinot', description: 'Backup Mensual Pinot', type: 'backup', job: 'BKPMENSUAL', frequency: 'mensual' },
            { id: 'bkp_mensual_semillon', name: 'Semillon', description: 'Backup Mensual Semillon', type: 'backup', job: 'BKPMENSUAL', frequency: 'mensual' },
            { id: 'bkp_mensual_regdrs', name: 'REGDRS', description: 'Backup Mensual REGDRS', type: 'backup', job: 'BKPMENSUAL', frequency: 'mensual' },
            { id: 'bkp_mensual_merlot', name: 'Merlot', description: 'Backup Mensual Merlot', type: 'backup', job: 'BKPMENSUAL', frequency: 'mensual' }
        ]
    },
    
    // Procesos / Envío de Archivos
    procesos: {
        name: "Procesos / Envío de Archivos",
        icon: "📤",
        tasks: [
            { id: 'proc_tarjeta_naranja', name: 'Tarjeta Naranja', description: 'Envío Tarjeta Naranja', type: 'proceso' },
            { id: 'proc_epe', name: 'EPE', description: 'Envío EPE', type: 'proceso' },
            { id: 'proc_bancor', name: 'BANCOR', description: 'Envío BANCOR', type: 'proceso' },
            { id: 'proc_rentas_cba', name: 'Rentas de Córdoba', description: 'Envío Rentas de Córdoba', type: 'proceso' },
            { id: 'proc_afip72', name: 'AFIP 72', description: 'Envío AFIP 72', type: 'proceso' },
            { id: 'proc_afip24', name: 'AFIP 24', description: 'Envío AFIP 24', type: 'proceso' },
            { id: 'proc_afip48', name: 'AFIP 48', description: 'Envío AFIP 48', type: 'proceso' },
            { id: 'proc_cierre_afip', name: 'Cierre AFIP', description: 'Cierre AFIP', type: 'proceso' },
            { id: 'proc_montaje_cintas', name: 'Montaje de cintas', description: 'Montaje de cintas', type: 'proceso' },
            { id: 'proc_reset_flag', name: 'Reset Flag', description: 'Reset Flag', type: 'proceso' }
        ]
    }
};

// Estados posibles para procesos
const PROCESS_STATUS = {
    pending: { label: 'Pendiente', icon: '⏳', color: '#f59e0b' },
    ok: { label: 'OK', icon: '✅', color: '#10b981' },
    error: { label: 'Error', icon: '❌', color: '#ef4444' },
    na: { label: 'N/A', icon: '—', color: '#64748b' }
};

// Función para obtener todas las tareas en formato plano
function getAllNOCTasks() {
    const allTasks = [];
    for (const [categoryKey, category] of Object.entries(NOC_TASKS)) {
        category.tasks.forEach(task => {
            allTasks.push({
                ...task,
                category: categoryKey,
                categoryName: category.name,
                categoryIcon: category.icon
            });
        });
    }
    return allTasks;
}

// Función para obtener tareas por categoría
function getTasksByCategory(categoryKey) {
    const category = NOC_TASKS[categoryKey];
    if (!category) return [];
    return category.tasks.map(task => ({
        ...task,
        category: categoryKey,
        categoryName: category.name,
        categoryIcon: category.icon
    }));
}

// Exportar para uso global
window.NOC_TASKS = NOC_TASKS;
window.PROCESS_STATUS = PROCESS_STATUS;
window.getAllNOCTasks = getAllNOCTasks;
window.getTasksByCategory = getTasksByCategory;
