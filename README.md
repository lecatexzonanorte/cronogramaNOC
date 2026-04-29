# 📡 Cronograma NOC

Sistema de seguimiento de tareas diarias para equipos de Network Operations Center (NOC).

## ✨ Características

- **📋 Gestión de Tareas**: Agregar, editar y eliminar tareas diarias
- **🔘 Toggles Intuitivos**: Marcar tareas como completadas con un solo clic
- **📊 Informes Diarios**: Generar informes detallados con opción de exportar
- **👥 Múltiples Usuarios**: Soporte para varios operadores con turnos diferentes
- **📅 Navegación por Fechas**: Ver tareas de días anteriores o futuros
- **🔥 Firebase Firestore**: Persistencia en la nube, datos siempre disponibles
- **🌙 Tema Oscuro**: Interfaz moderna y agradable a la vista
- **📱 Responsive**: Funciona perfectamente en desktop y móvil

## 🚀 Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/lecatexzonanorte/cronogramaNOC.git
cd cronogramaNOC
```

### 2. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto (ej: "cronograma-noc")
3. Ve a **Build > Firestore Database** y crea una base de datos
   - Selecciona "Start in test mode" para desarrollo
   - Elige la región más cercana
4. Ve a **Project Settings** (icono de engranaje) > **General**
5. Scroll down a "Your apps" y agrega una Web App
6. Copia la configuración de Firebase

### 3. Editar configuración

Edita el archivo `js/firebase-config.js` y reemplaza los valores:

```javascript
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROYECTO.firebaseapp.com",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_PROYECTO.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
};
```

### 4. Configurar GitHub Pages

1. Ve a tu repositorio en GitHub
2. **Settings** > **Pages**
3. En "Source", selecciona `main` branch
4. Selecciona `/ (root)` como carpeta
5. Click en **Save**
6. Espera unos minutos y tu app estará disponible en:
   ```
   https://lecatexzonanorte.github.io/cronogramaNOC/
   ```

## 📝 Uso

### Crear Usuario
1. Click en el botón **+** junto al selector de usuario
2. Ingresa el nombre y selecciona el turno
3. El usuario queda guardado automáticamente

### Agregar Tareas
1. Selecciona un usuario
2. Click en **+ Nueva Tarea**
3. Completa el formulario con:
   - Nombre de la tarea
   - Descripción (opcional)
   - Categoría (Monitoreo, Incidentes, Mantenimiento, etc.)
   - Prioridad (Baja, Media, Alta, Crítica)
   - Hora programada (opcional)

### Marcar Tareas
- Usa los **toggles** para marcar tareas como completadas
- El progreso se actualiza automáticamente

### Ver Informe Diario
1. Click en **📊 Informe Diario**
2. Selecciona la fecha
3. Puedes:
   - **Copiar al portapapeles** para compartir
   - **Exportar** como archivo de texto

## 🔒 Reglas de Seguridad (Recomendado)

Para producción, actualiza las reglas de Firestore en Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo permitir lectura/escritura a usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📂 Estructura del Proyecto

```
cronogramaNOC/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos
├── js/
│   ├── firebase-config.js  # Configuración Firebase
│   └── app.js          # Lógica de la aplicación
└── README.md           # Este archivo
```

## 🛠️ Tecnologías

- HTML5, CSS3, JavaScript (Vanilla)
- Firebase Firestore (Base de datos)
- GitHub Pages (Hosting)

## 📄 Licencia

MIT License - Libre para uso personal y comercial.
