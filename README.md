# 🏥 Plataforma de Gestión Clínica y Seguimiento de Pacientes

## Tecnologías utilizadas

**Back-end:**
- NestJS + TypeScript
- PostgreSQL + Prisma ORM
- JWT + Passport
- Socket.io
- Faker
- bcryptjs
- Docker

**Front-end:**
- Vite + TypeScript
- Bootstrap 5 + Bootstrap Icons
- Socket.io Client

---

## Instalación

### 1. Clonar el repositorio

```bash
https://github.com/carloospg/GestionClinicaNestJS
```

### 2. Levantar PostgreSQL con Docker

```bash
docker compose up -d
```

### 3. Configurar el Back-end

```bash
cd backend
npm install
cp .env.example .env
```

Edita el archivo `.env` y configura las variables:

```
PORT=3000
DATABASE_URL="postgresql://admin:admin@localhost:5432/clinica_db?schema=public"
JWT_SECRET=admin1234
JWT_EXPIRES_IN=8h
```

### 4. Ejecutar las migraciones y el seeder

```bash
npx prisma migrate deploy
npm run seed
```

### 5. Arrancar el servidor

```bash
npm run start:dev
```

### 6. Configurar el Front-end

```bash
cd frontend
npm install
npm run dev
```

Abre el navegador en `http://localhost:5173`

---

## Credenciales de acceso

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@admin.com | admin1234 |
| Médico | medico1@clinica.com | medico1234 |
| Recepcionista | recepcionista1@clinica.com | recep1234 |

> El seeder crea 5 médicos (medico1-5@clinica.com), 5 recepcionistas (recepcionista1-5@clinica.com) y 5 pacientes de prueba con citas asignadas.

---

## Funcionalidades por rol

### Administrador
- Registro de nuevos usuarios (médicos y recepcionistas)
- Listar, eliminar y modificar el rol de usuarios
- Crear y listar pacientes
- Eliminar pacientes
- Generar N pacientes aleatorios automáticamente
- Crear y cancelar citas
- Ver métricas generales en el panel principal (usuarios, pacientes, citas del día, médicos)
- Acceso a todas las funcionalidades del sistema

### Médico
- Ver sus citas asignadas
- Cambiar el estado de una cita a `en_curso` o `finalizada`
- Al finalizar una cita se añade automáticamente una entrada al historial clínico del paciente
- Consultar el historial clínico completo de un paciente
- Ver sus citas pendientes del día en el panel principal
- Ver métricas: citas finalizadas propias, citas pendientes hoy, duración promedio
- Recibe notificaciones en tiempo real cuando se le asigna una nueva cita
- Recibe notificaciones en tiempo real cuando una de sus citas es cancelada o cambia de estado

### Recepcionista
- Crear pacientes
- Crear citas (seleccionando paciente, médico, fecha y motivo)
- Cancelar citas pendientes
- Consultar la agenda general de citas
- Ver citas pendientes del día en el panel principal
- La agenda se actualiza automáticamente en tiempo real

---

## API REST

```
POST   /api/auth/login                        # Login (público)
POST   /api/auth/registro                     # Registrar usuario (admin)

GET    /api/usuarios                          # Listar usuarios (admin)
DELETE /api/usuarios/:id                      # Eliminar usuario (admin)
PATCH  /api/usuarios/:id/rol                  # Modificar rol (admin)
GET    /api/usuarios/medicos                  # Listar médicos (admin + recepcionista)

POST   /api/pacientes                         # Crear paciente (admin + recepcionista)
GET    /api/pacientes                         # Listar pacientes (admin + recepcionista + médico)
DELETE /api/pacientes/:id                     # Eliminar paciente (admin)
POST   /api/pacientes/generar/:n              # Generar N pacientes (admin)

POST   /api/citas                             # Crear cita (admin + recepcionista)
GET    /api/citas                             # Listar citas (admin + recepcionista)
PATCH  /api/citas/:id/cancelar               # Cancelar cita (admin + recepcionista)
GET    /api/citas/mis-citas                   # Ver mis citas (médico)
PATCH  /api/citas/:id/estado                 # Cambiar estado (médico)
GET    /api/citas/stats/finalizadas           # Citas finalizadas por médico (admin + médico)
GET    /api/citas/stats/pendientes-hoy        # Citas pendientes hoy (admin + médico)
GET    /api/citas/stats/duracion-promedio     # Duración promedio por médico (admin + médico)

GET    /api/historial/:id_paciente            # Ver historial clínico (médico + admin)
```

---

## WebSockets

El servidor emite los siguientes eventos en tiempo real:

| Evento | Descripción | Destinatario |
|--------|-------------|--------------|
| `cita-asignada` | Nueva cita asignada al médico | Médico asignado |
| `cita-cancelada` | Una cita ha sido cancelada | Admin + recepcionista |
| `cita-cancelada-medico` | Una de tus citas ha sido cancelada | Médico asignado |
| `cita-estado-cambiado` | La cita ha cambiado de estado | Todos |
| `actualizar-citas` | Recarga la agenda | Todos |

---

## Tests

El proyecto incluye tests unitarios con Jest para las siguientes funcionalidades:

**Auth Service** — `src/auth/auth.service.spec.ts`
- Login con credenciales correctas
- Login con usuario inexistente
- Login con contraseña incorrecta
- Registro de usuario correcto
- Registro con email duplicado
- Registro con rol admin denegado

**Citas Service** — `src/citas/citas.service.spec.ts`
- Crear cita correctamente
- Crear cita con paciente inexistente
- Crear cita con médico no válido
- Cancelar cita pendiente
- Cancelar cita inexistente
- Cancelar cita no pendiente
- Cambiar estado a en_curso
- Cambiar estado a finalizada y crear entrada en historial
- Cambiar estado de cita inexistente
- Cambiar estado sin permiso

Para ejecutar los tests:

```bash
cd backend
npm run test
```