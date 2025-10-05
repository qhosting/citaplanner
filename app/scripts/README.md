# 📜 Scripts de CitaPlanner

## 🌱 seed.ts

Script para insertar datos de prueba en la base de datos.

### Uso

```bash
# Opción 1: Usando npm (recomendado)
npm run seed

# Opción 2: Usando Prisma directamente
npx prisma db seed

# Opción 3: Ejecución directa
npm run seed:force
```

### Datos Creados

- **1 Empresa**: Bella Vita Spa & Wellness
- **1 Sucursal**: Sucursal Centro
- **5 Usuarios**: Admin, Manager, 2 Profesionales, Recepcionista
- **6 Servicios**: Faciales, masajes, manicure, cortes
- **6 Clientes**: Clientes de ejemplo
- **6 Citas**: Citas de hoy, mañana y completadas
- **3 Pagos**: Pagos para citas completadas
- **Horarios**: Lunes-Viernes 9:00-18:00, Sábados 10:00-16:00

### Credenciales

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@citaplanner.com | admin123 | ADMIN |
| manager@citaplanner.com | manager123 | MANAGER |
| pro1@citaplanner.com | prof123 | PROFESSIONAL |
| pro2@citaplanner.com | prof123 | PROFESSIONAL |
| recepcionista@citaplanner.com | prof123 | RECEPTIONIST |

### Requisitos

- Variable de entorno `DATABASE_URL` configurada
- Base de datos PostgreSQL accesible
- Dependencias instaladas (`npm install`)

### ⚠️ Advertencia

Este script **ELIMINA TODOS LOS USUARIOS EXISTENTES** antes de insertar los datos de prueba. Haz un backup si tienes datos importantes.

---

## 🔐 generate-master-hash.ts

Script para generar hashes de bcrypt para la contraseña del Master Admin.

### Uso

```bash
npm run generate-hash
```

Sigue las instrucciones en pantalla para ingresar la contraseña y obtener el hash.

---

## 📝 generate-version.sh

Script que genera información de versión para el build de producción.

Se ejecuta automáticamente antes de cada build (`prebuild` script).
