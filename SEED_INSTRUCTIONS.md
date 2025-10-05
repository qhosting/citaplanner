# 🌱 Guía para Insertar Datos de Prueba en CitaPlanner

## 📋 Resumen

Este documento explica cómo insertar los datos de prueba en la base de datos de CitaPlanner. El script de seed ya está configurado y listo para usar.

## 👥 Usuarios de Prueba Incluidos

El script creará los siguientes usuarios:

| Email | Contraseña | Rol | Descripción |
|-------|-----------|-----|-------------|
| `admin@citaplanner.com` | `admin123` | ADMIN | Administrador principal |
| `manager@citaplanner.com` | `manager123` | MANAGER | Gerente de sucursal |
| `pro1@citaplanner.com` | `prof123` | PROFESSIONAL | Estilista Senior |
| `pro2@citaplanner.com` | `prof123` | PROFESSIONAL | Barbero Profesional |
| `recepcionista@citaplanner.com` | `prof123` | RECEPTIONIST | Recepcionista Principal |

## 📦 Datos Adicionales Creados

- **1 Empresa**: Bella Vita Spa & Wellness
- **1 Sucursal**: Sucursal Centro
- **6 Servicios**: Faciales, masajes, manicure, cortes, etc.
- **6 Clientes**: Clientes de ejemplo con datos completos
- **6 Citas**: Citas de ejemplo (hoy, mañana, y completadas)
- **3 Pagos**: Pagos registrados para citas completadas
- **Horarios de trabajo**: Lunes a viernes 9:00-18:00, sábados 10:00-16:00

---

## 🚀 OPCIÓN A: Ejecutar el Script de Seed (Recomendado)

### Requisitos Previos

1. Tener Node.js instalado
2. Tener acceso a la base de datos PostgreSQL
3. Variable de entorno `DATABASE_URL` configurada

### Pasos para Ejecutar

#### 1. Conectarse al servidor (si es remoto)

```bash
ssh usuario@tu-servidor.com
```

#### 2. Navegar al directorio de la aplicación

```bash
cd /ruta/a/citaplanner/app
```

#### 3. Verificar que la variable DATABASE_URL esté configurada

```bash
# Ver el valor actual (sin mostrar la contraseña completa)
echo $DATABASE_URL | sed 's/:[^@]*@/:***@/'
```

Si no está configurada, créala:

```bash
export DATABASE_URL="postgresql://usuario:contraseña@host:puerto/database"
```

#### 4. Instalar dependencias (si es necesario)

```bash
npm install
```

#### 5. Ejecutar el script de seed

```bash
npx prisma db seed
```

O alternativamente:

```bash
npm run prisma db seed
```

### ✅ Resultado Esperado

Deberías ver una salida similar a:

```
🌱 Iniciando seed...
🗑️  Eliminando usuarios existentes...
✅ Usuarios eliminados
✅ Tenant creado: Bella Vita Spa & Wellness
✅ Sucursal creada: Sucursal Centro
✅ Usuarios creados
✅ Servicios creados: 6
✅ Servicios asignados a profesionales
✅ Clientes creados: 6
✅ Horarios de trabajo creados
✅ Citas creadas: 6
✅ Pagos creados: 3

🎉 Seed completado exitosamente!

📋 Datos creados:
   • 1 Empresa: Bella Vita Spa & Wellness
   • 1 Sucursal: Sucursal Centro
   • 5 Usuarios (1 Admin, 1 Manager, 2 Profesionales, 1 Recepcionista)
   • 6 Servicios
   • 6 Clientes
   • 6 Citas
   • 3 Pagos

🔑 Credenciales de acceso:
   Admin: admin@citaplanner.com / admin123
   Manager: manager@citaplanner.com / manager123
   Profesional 1: pro1@citaplanner.com / prof123
   Profesional 2: pro2@citaplanner.com / prof123
   Recepcionista: recepcionista@citaplanner.com / prof123
```

---

## 🔧 OPCIÓN B: Ejecutar SQL Directo en PostgreSQL

Si prefieres insertar los datos directamente en PostgreSQL sin usar el script de seed, puedes usar el archivo SQL incluido.

### Pasos

#### 1. Conectarse a PostgreSQL

```bash
psql -h host -U usuario -d database
```

O si estás en el servidor:

```bash
psql -U postgres -d citaplanner
```

#### 2. Ejecutar el archivo SQL

```sql
\i /ruta/a/citaplanner/seed-data.sql
```

O copiar y pegar el contenido del archivo `seed-data.sql` directamente en la consola de PostgreSQL.

---

## 🌐 OPCIÓN C: Endpoint API Temporal (Para Easypanel/Docker)

Si estás usando Easypanel o Docker y no tienes acceso directo al servidor, puedes crear un endpoint temporal para ejecutar el seed desde el navegador.

### Crear el Endpoint

Crea el archivo `app/app/api/admin/seed/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    // Verificar que sea una solicitud autorizada
    const { masterPassword } = await request.json()
    
    if (masterPassword !== process.env.MASTER_ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Ejecutar el seed (copiar el contenido de scripts/seed.ts aquí)
    // ... código del seed ...

    return NextResponse.json({ 
      success: true, 
      message: 'Datos de prueba insertados correctamente' 
    })
  } catch (error) {
    console.error('Error en seed:', error)
    return NextResponse.json({ 
      error: 'Error al insertar datos',
      details: error.message 
    }, { status: 500 })
  }
}
```

### Usar el Endpoint

1. Despliega la aplicación con el nuevo endpoint
2. Abre tu navegador y ve a: `https://citaplanner.com/api/admin/seed`
3. Usa Postman o curl para hacer una petición POST:

```bash
curl -X POST https://citaplanner.com/api/admin/seed \
  -H "Content-Type: application/json" \
  -d '{"masterPassword": "tu_master_password"}'
```

⚠️ **IMPORTANTE**: Elimina este endpoint después de usarlo por seguridad.

---

## 🔍 Verificar que los Datos se Insertaron

### Opción 1: Desde PostgreSQL

```sql
-- Ver usuarios creados
SELECT email, "firstName", "lastName", role FROM users;

-- Ver servicios
SELECT name, duration, price FROM services;

-- Ver clientes
SELECT "firstName", "lastName", email, phone FROM clients;

-- Ver citas
SELECT c."firstName", s.name, a."startTime", a.status 
FROM appointments a
JOIN clients c ON a."clientId" = c.id
JOIN services s ON a."serviceId" = s.id
ORDER BY a."startTime" DESC;
```

### Opción 2: Desde la Aplicación

1. Inicia sesión con cualquiera de las credenciales de prueba
2. Navega por el sistema para ver:
   - Lista de usuarios
   - Servicios disponibles
   - Clientes registrados
   - Citas programadas

---

## ⚠️ Notas Importantes

### Limpieza de Datos

El script de seed **ELIMINA TODOS LOS USUARIOS EXISTENTES** antes de insertar los nuevos datos. Si tienes datos importantes, haz un backup primero:

```bash
pg_dump -U usuario -d database > backup_$(date +%Y%m%d).sql
```

### Variables de Entorno Requeridas

Asegúrate de tener configurada la variable `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://usuario:contraseña@host:puerto/database?schema=public"
```

### Contraseñas Hasheadas

Las contraseñas en el script están hasheadas con bcrypt (10 rounds). Las contraseñas en texto plano son:

- `admin123` → Hash bcrypt
- `manager123` → Hash bcrypt
- `prof123` → Hash bcrypt

### Zona Horaria

Las citas se crean usando la fecha/hora actual del servidor. Asegúrate de que la zona horaria esté configurada correctamente.

---

## 🆘 Solución de Problemas

### Error: "Cannot find module '@prisma/client'"

```bash
cd app
npm install
npx prisma generate
```

### Error: "DATABASE_URL environment variable not found"

Configura la variable de entorno:

```bash
export DATABASE_URL="postgresql://usuario:contraseña@host:puerto/database"
```

O crea un archivo `.env` en el directorio `app/`:

```
DATABASE_URL="postgresql://usuario:contraseña@host:puerto/database"
```

### Error: "Unique constraint failed"

Esto significa que ya existen datos con los mismos valores únicos (emails, teléfonos). El script debería eliminar los datos existentes primero, pero si falla, puedes limpiar manualmente:

```sql
-- ⚠️ CUIDADO: Esto eliminará TODOS los datos
TRUNCATE TABLE users, clients, appointments, payments, services, "service_users", branches, tenants CASCADE;
```

### Error de conexión a la base de datos

Verifica:
1. Que PostgreSQL esté corriendo
2. Que las credenciales sean correctas
3. Que el puerto esté abierto
4. Que el usuario tenga permisos

```bash
# Probar conexión
psql -h host -U usuario -d database -c "SELECT version();"
```

---

## 📞 Soporte

Si tienes problemas ejecutando el seed, verifica:

1. ✅ Node.js instalado (v18 o superior)
2. ✅ PostgreSQL accesible
3. ✅ Variable DATABASE_URL configurada
4. ✅ Dependencias instaladas (`npm install`)
5. ✅ Prisma Client generado (`npx prisma generate`)

Para más ayuda, revisa los logs de error completos y comparte el mensaje de error específico.
