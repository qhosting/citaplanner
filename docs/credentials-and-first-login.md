# 🔐 Credenciales y Primer Acceso a CitaPlanner

## 📋 Tabla de Contenidos

1. [Credenciales por Defecto](#credenciales-por-defecto)
2. [Cómo Crear el Primer Usuario](#cómo-crear-el-primer-usuario)
3. [Ejecutar el Script de Seed](#ejecutar-el-script-de-seed)
4. [Tipos de Usuarios](#tipos-de-usuarios)
5. [Proceso de Registro Inicial](#proceso-de-registro-inicial)
6. [Cómo Resetear Contraseñas](#cómo-resetear-contraseñas)
7. [Solución de Problemas](#solución-de-problemas)

---

## 🔑 Credenciales por Defecto

CitaPlanner incluye un script de seed que crea usuarios de ejemplo para facilitar las pruebas y el desarrollo. Después de ejecutar el seed, puedes acceder con las siguientes credenciales:

### 👤 Usuarios del Sistema

| Rol | Email | Contraseña | Descripción |
|-----|-------|------------|-------------|
| **ADMIN** | `admin@citaplanner.com` | `admin123` | Administrador principal con acceso completo |
| **MANAGER** | `manager@citaplanner.com` | `manager123` | Gerente de sucursal con permisos de gestión |
| **PROFESSIONAL** | `pro1@citaplanner.com` | `prof123` | Estilista senior (Especialista en faciales) |
| **PROFESSIONAL** | `pro2@citaplanner.com` | `prof123` | Barbero profesional (Especialista en masajes y cortes) |
| **RECEPTIONIST** | `recepcionista@citaplanner.com` | `prof123` | Recepcionista principal |

### 🏢 Datos de la Empresa de Ejemplo

- **Nombre:** Bella Vita Spa & Wellness
- **Sucursal:** Sucursal Centro
- **Ubicación:** Ciudad de México, México

### 📊 Datos Adicionales Creados por el Seed

El script de seed también crea:
- ✅ 6 servicios (faciales, masajes, manicure, cortes, etc.)
- ✅ 6 clientes de ejemplo
- ✅ 6 citas (algunas completadas, algunas pendientes)
- ✅ 3 pagos registrados
- ✅ Horarios de trabajo configurados

---

## 🚀 Cómo Crear el Primer Usuario

CitaPlanner ofrece **dos formas** de crear el primer usuario administrador:

### Opción 1: Usando el Script de Seed (Recomendado para Desarrollo)

Esta opción crea automáticamente una empresa completa con usuarios, servicios y datos de ejemplo.

```bash
# 1. Asegúrate de que la base de datos esté corriendo
docker-compose up -d postgres

# 2. Ejecuta las migraciones de Prisma
npm run prisma:migrate

# 3. Ejecuta el script de seed
npm run seed
```

**Resultado:** Se crearán todos los usuarios listados en la tabla anterior.

### Opción 2: Registro Manual (Recomendado para Producción)

Esta opción te permite crear tu propia empresa desde cero.

#### Paso 1: Accede a la página de registro

Navega a: `https://tu-dominio.com/auth/signup`

#### Paso 2: Completa el formulario

```
Nombre: [Tu nombre]
Apellido: [Tu apellido]
Email: [tu-email@empresa.com]
Contraseña: [contraseña segura]
Nombre de la Empresa: [Nombre de tu negocio]
```

#### Paso 3: Proceso automático

Al registrarte, el sistema automáticamente:
1. ✅ Crea un nuevo **Tenant** (empresa) con el nombre proporcionado
2. ✅ Crea una **Sucursal Principal** para tu empresa
3. ✅ Crea tu usuario con rol **ADMIN**
4. ✅ Asocia tu usuario a la empresa y sucursal

#### Paso 4: Inicia sesión

Después del registro, serás redirigido a la página de login donde podrás acceder con tus credenciales.

---

## 🌱 Ejecutar el Script de Seed

### Requisitos Previos

1. Base de datos PostgreSQL corriendo
2. Variables de entorno configuradas (especialmente `DATABASE_URL`)
3. Migraciones de Prisma ejecutadas

### Comandos

```bash
# Opción 1: Usando npm script (recomendado)
npm run seed

# Opción 2: Usando tsx directamente
npx tsx app/scripts/seed.ts

# Opción 3: Usando Prisma
npx prisma db seed
```

### Salida Esperada

```
🌱 Iniciando seed...
✅ Tenant creado: Bella Vita Spa & Wellness
✅ Sucursal creada: Sucursal Centro
✅ Usuarios creados
✅ Servicios creados: 6
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

### ⚠️ Importante

- El script de seed **NO** verifica si los datos ya existen
- Si ejecutas el seed múltiples veces, puede causar errores de duplicados
- Para un ambiente limpio, resetea la base de datos antes de ejecutar el seed:

```bash
# Resetear base de datos y ejecutar seed
npm run prisma:reset

# O manualmente:
npx prisma migrate reset
npm run seed
```

---

## 👥 Tipos de Usuarios

CitaPlanner soporta diferentes tipos de usuarios con permisos específicos:

### 1. ADMIN (Administrador)
- ✅ Acceso completo al sistema
- ✅ Gestión de usuarios y permisos
- ✅ Configuración de la empresa
- ✅ Gestión de sucursales
- ✅ Reportes y análisis completos
- ✅ Configuración de servicios y precios
- ✅ Gestión de pagos y facturación

### 2. MANAGER (Gerente)
- ✅ Gestión de citas y calendario
- ✅ Gestión de clientes
- ✅ Asignación de profesionales
- ✅ Reportes de sucursal
- ✅ Gestión de servicios
- ❌ No puede modificar configuración global
- ❌ No puede gestionar usuarios administradores

### 3. PROFESSIONAL (Profesional)
- ✅ Ver su propio calendario
- ✅ Gestionar sus citas asignadas
- ✅ Ver información de clientes
- ✅ Registrar servicios completados
- ❌ No puede crear/eliminar citas
- ❌ No puede ver reportes financieros

### 4. RECEPTIONIST (Recepcionista)
- ✅ Crear y gestionar citas
- ✅ Gestionar clientes
- ✅ Registrar pagos
- ✅ Ver calendario general
- ❌ No puede modificar servicios
- ❌ No puede ver reportes financieros detallados

### 5. CLIENT (Cliente)
- ✅ Ver sus propias citas
- ✅ Solicitar nuevas citas
- ✅ Ver historial de servicios
- ✅ Actualizar su perfil
- ❌ No puede acceder al panel administrativo

---

## 📝 Proceso de Registro Inicial

### Para el Primer Usuario (Administrador)

1. **Accede a la URL de registro:**
   ```
   https://tu-dominio.com/auth/signup
   ```

2. **Completa el formulario:**
   - Nombre y apellido
   - Email corporativo
   - Contraseña segura (mínimo 8 caracteres)
   - Nombre de tu empresa/negocio

3. **Confirmación automática:**
   - No se requiere verificación de email
   - El usuario se crea inmediatamente
   - Se asigna rol de ADMIN automáticamente

4. **Primer inicio de sesión:**
   - Usa el email y contraseña que registraste
   - Serás redirigido al dashboard principal

### Para Usuarios Adicionales

Los usuarios adicionales deben ser creados por un administrador desde el panel de administración:

1. **Accede como ADMIN**
2. **Ve a "Usuarios" o "Equipo"**
3. **Haz clic en "Agregar Usuario"**
4. **Completa el formulario:**
   - Información personal
   - Email
   - Rol (Manager, Professional, Receptionist)
   - Sucursal asignada
5. **Genera contraseña temporal**
6. **Envía credenciales al nuevo usuario**

---

## 🔄 Cómo Resetear Contraseñas

### Opción 1: Desde el Panel de Administración (Recomendado)

Si eres administrador y necesitas resetear la contraseña de otro usuario:

1. Accede al panel de administración
2. Ve a "Usuarios" o "Equipo"
3. Busca el usuario
4. Haz clic en "Resetear Contraseña"
5. Genera una nueva contraseña temporal
6. Envía las nuevas credenciales al usuario

### Opción 2: Usando la Base de Datos Directamente

Si perdiste acceso al usuario administrador:

```bash
# 1. Accede a la base de datos
docker exec -it citaplanner-postgres psql -U postgres -d citaplanner

# 2. Genera un hash de contraseña nueva
# En Node.js o usando bcrypt online
# Ejemplo: bcrypt.hash('nuevacontraseña123', 10)

# 3. Actualiza la contraseña en la base de datos
UPDATE "User" 
SET password = '$2a$10$HASH_GENERADO_AQUI' 
WHERE email = 'john@doe.com';

# 4. Sal de psql
\q
```

### Opción 3: Script de Reseteo de Contraseña

Puedes crear un script temporal para resetear contraseñas:

```typescript
// scripts/reset-password.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetPassword(email: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  })
  
  console.log(`✅ Contraseña actualizada para: ${email}`)
}

// Uso:
resetPassword('john@doe.com', 'nuevacontraseña123')
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
```

Ejecutar:
```bash
npx tsx scripts/reset-password.ts
```

### Opción 4: Función de "Olvidé mi Contraseña"

Si la aplicación tiene implementada la función de recuperación de contraseña:

1. Ve a la página de login
2. Haz clic en "¿Olvidaste tu contraseña?"
3. Ingresa tu email
4. Revisa tu correo electrónico
5. Sigue el enlace de recuperación
6. Establece una nueva contraseña

**Nota:** Esta función requiere que el SMTP esté configurado correctamente.

---

## 🔧 Solución de Problemas

### Problema: No puedo iniciar sesión con las credenciales del seed

**Soluciones:**

1. **Verifica que el seed se ejecutó correctamente:**
   ```bash
   npm run seed
   ```
   Busca el mensaje "🎉 Seed completado exitosamente!"

2. **Verifica que la base de datos tiene los usuarios:**
   ```bash
   docker exec -it citaplanner-postgres psql -U postgres -d citaplanner
   SELECT email, role FROM "User";
   \q
   ```

3. **Verifica que NextAuth está configurado:**
   - Revisa que `NEXTAUTH_URL` esté configurado correctamente
   - Revisa que `NEXTAUTH_SECRET` esté configurado

4. **Limpia cookies y caché del navegador**

### Problema: Error "Credenciales inválidas"

**Causas comunes:**

1. **Email incorrecto:** Verifica que estés usando el email exacto (case-sensitive)
2. **Contraseña incorrecta:** Verifica que estés usando la contraseña correcta
3. **Usuario inactivo:** El usuario puede estar marcado como inactivo en la base de datos
4. **Base de datos vacía:** El seed no se ejecutó o la base de datos fue reseteada

**Solución:**
```bash
# Resetear y volver a ejecutar seed
npm run prisma:reset
npm run seed
```

### Problema: Error "Usuario ya existe" al registrarse

**Causa:** Ya existe un usuario con ese email en la base de datos.

**Soluciones:**

1. **Usa un email diferente**
2. **O elimina el usuario existente:**
   ```bash
   docker exec -it citaplanner-postgres psql -U postgres -d citaplanner
   DELETE FROM "User" WHERE email = 'email@ejemplo.com';
   \q
   ```

### Problema: No puedo acceder a ciertas funciones

**Causa:** Tu usuario no tiene los permisos necesarios.

**Solución:**

1. **Verifica tu rol:**
   - Ve a tu perfil de usuario
   - Verifica que tengas el rol correcto (ADMIN, MANAGER, etc.)

2. **Si necesitas cambiar el rol:**
   ```bash
   docker exec -it citaplanner-postgres psql -U postgres -d citaplanner
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'tu-email@ejemplo.com';
   \q
   ```

### Problema: Error de conexión a la base de datos

**Soluciones:**

1. **Verifica que PostgreSQL esté corriendo:**
   ```bash
   docker-compose ps
   ```

2. **Verifica la variable DATABASE_URL:**
   ```bash
   echo $DATABASE_URL
   ```

3. **Reinicia los servicios:**
   ```bash
   docker-compose restart
   ```

### Problema: El seed falla con errores de duplicados

**Causa:** Ya existen datos en la base de datos.

**Solución:**
```bash
# Opción 1: Resetear completamente
npm run prisma:reset

# Opción 2: Limpiar manualmente
docker exec -it citaplanner-postgres psql -U postgres -d citaplanner
TRUNCATE TABLE "User", "Tenant", "Branch", "Service", "Client", "Appointment", "Payment" CASCADE;
\q

# Luego ejecutar seed
npm run seed
```

---

## 📞 Soporte Adicional

Si sigues teniendo problemas:

1. **Revisa los logs de la aplicación:**
   ```bash
   docker-compose logs -f app
   ```

2. **Revisa los logs de la base de datos:**
   ```bash
   docker-compose logs -f postgres
   ```

3. **Verifica las variables de entorno:**
   ```bash
   cat .env.production
   ```

4. **Consulta la documentación completa:**
   - README.md
   - docs/deployment-guide.md
   - docs/easypanel-local-database.pdf

---

## 🎯 Resumen Rápido

### Para Desarrollo:
```bash
# 1. Configurar base de datos
docker-compose up -d postgres

# 2. Ejecutar migraciones
npm run prisma:migrate

# 3. Ejecutar seed
npm run seed

# 4. Iniciar aplicación
npm run dev

# 5. Acceder con:
# Email: admin@citaplanner.com
# Contraseña: admin123
```

### Para Producción:
```bash
# 1. Configurar variables de entorno
cp .env.production.example .env.production
# Editar .env.production con tus credenciales

# 2. Ejecutar migraciones
npm run prisma:migrate

# 3. Acceder a /auth/signup
# Crear tu primer usuario administrador

# 4. Iniciar sesión con tus credenciales
```

---

**Última actualización:** Octubre 2024  
**Versión:** 1.0.0
