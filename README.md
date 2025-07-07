# Discord Clone - Project Management

Una aplicación completa de chat estilo Discord con navegación de servidores y canales.

## 🚀 Características

### ✅ Funcionalidades Implementadas:
- **Interface tipo Discord**: Layout con sidebar de servidores, lista de canales y área de contenido
- **Navegación completa**: Entre servidores y canales con estados visuales
- **Backend API REST**: Endpoints para servidores y canales con Prisma + PostgreSQL
- **Datos en tiempo real**: Conexión directa con base de datos
- **Estados visuales**: Indicadores de selección, carga y errores

### 🎨 Características UI/UX:
- **Diseño responsivo**: Colores y tipografía similares a Discord
- **Badges de mensajes**: Indicadores de mensajes no leídos (simulados)
- **Canales de voz**: Diferenciación visual y contadores de usuarios
- **Transiciones suaves**: Animaciones y estados de hover
- **Auto-selección**: Primer canal se selecciona automáticamente

## 📋 Prerrequisitos

- Node.js (v16 o superior)
- Docker (con PostgreSQL corriendo)
- npm o yarn

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd projectManagement
```

### 2. Configurar PostgreSQL en Docker
```bash
# El contenedor PostgreSQL debe estar corriendo
docker ps | grep postgres
```

### 3. Instalar dependencias del Backend
```bash
cd backend
npm install
```

### 4. Configurar variables de entorno
El archivo `.env` ya está configurado con:
```env
DATABASE_URL="postgresql://postgres:root@localhost:5432/projectmanagement?schema=public"
PORT=3001
SECRET=your-secret-key-here
```

### 5. Configurar la base de datos
```bash
# Crear la base de datos (si no existe)
docker exec -it postgres psql -U postgres -c "CREATE DATABASE projectmanagement;"

# Ejecutar migraciones
npx prisma migrate dev --name init

# Generar cliente Prisma
npx prisma generate

# Poblar con datos de ejemplo
node seed.js
```

### 6. Instalar dependencias del Frontend
```bash
cd ../frontend
npm install
```

## 🚀 Ejecución

### Opción 1: Script automático
```bash
# Desde la raíz del proyecto
./start-stack.sh
```

### Opción 2: Manual

#### Backend
```bash
cd backend
npm start
# Servidor corriendo en http://localhost:3001
```

#### Frontend
```bash
cd frontend
npm start
# Aplicación corriendo en http://localhost:3000
```

## 📡 API Endpoints

### Servidores
- `GET /api/servers` - Obtener todos los servidores
- `GET /api/servers/:id` - Obtener servidor por ID
- `POST /api/servers/:userId` - Crear nuevo servidor
- `PUT /api/servers/:id` - Actualizar servidor
- `DELETE /api/servers/:id` - Eliminar servidor

### Canales
- `GET /api/channels?serverId={id}` - Obtener canales de un servidor
- `GET /api/channels/:id` - Obtener canal por ID
- `POST /api/channels/:userId` - Crear nuevo canal
- `PUT /api/channels/:id` - Actualizar canal
- `DELETE /api/channels/:id` - Eliminar canal

## 🗂️ Estructura del Proyecto

```
projectManagement/
├── backend/
│   ├── controllers/     # Controladores de las rutas
│   ├── services/        # Lógica de negocio
│   ├── routes/          # Definición de rutas
│   ├── prisma/          # Esquemas y migraciones
│   ├── seed.js          # Script de datos de ejemplo
│   └── index.js         # Punto de entrada del servidor
├── frontend/
│   ├── src/
│   │   ├── views/
│   │   │   └── channels/    # Vista principal de Discord
│   │   │       ├── channelsView.jsx
│   │   │       └── channelsView.css
│   │   └── App.js
│   └── public/
└── start-stack.sh      # Script de inicio automático
```

## 🎮 Uso

1. **Acceder a la aplicación**: http://localhost:3000/channels
2. **Seleccionar servidor**: Clic en los círculos del sidebar izquierdo
3. **Navegar canales**: Clic en cualquier canal de la lista
4. **Observar características**:
   - Badges rojos con números de mensajes no leídos
   - Diferentes iconos para canales privados y de voz
   - Selección visual de servidor y canal activo
   - Información contextual en el área principal

## 📊 Datos de Ejemplo

El script `seed.js` crea:
- **3 servidores**: General Server, Gaming Hub, Study Group
- **11 canales total**: Mix de canales de texto, privados y de voz
- **1 usuario administrador**: Para ownership de servidores

## 🔧 Desarrollo

### Base de datos
```bash
# Ver estado de la DB
npx prisma studio

# Reset de la DB
npx prisma migrate reset

# Nuevo seed
node seed.js
```

### Logs del servidor
```bash
# Ver logs en tiempo real
tail -f backend/server.log
```

## 🚦 Solución de Problemas

### Backend no responde
```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep postgres

# Verificar conexión a DB
docker exec -it postgres psql -U postgres -c "\\l"

# Verificar proceso del backend
ps aux | grep "node.*index.js"
```

### Frontend no conecta
```bash
# Verificar variable de entorno
cat frontend/.env
# Debe contener: REACT_APP_URLAPI=http://localhost:3001/api
```

### Problemas de CORS
El backend ya tiene CORS configurado para desarrollo.

## 🌟 Próximos Pasos

- [ ] Implementar mensajes en tiempo real con WebSockets
- [ ] Sistema de autenticación completo
- [ ] Upload de archivos e imágenes
- [ ] Notificaciones push
- [ ] Roles y permisos avanzados
- [ ] Temas personalizables
- [ ] Chat de voz real

## 📝 Notas

- Los badges de mensajes no leídos son simulados para propósitos de demostración
- Los contadores de usuarios en canales de voz son aleatorios
- El diseño sigue fielmente los patrones visuales de Discord
