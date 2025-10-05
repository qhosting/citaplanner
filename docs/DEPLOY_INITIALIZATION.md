
# Sistema de Inicialización Automática - CitaPlanner

## 📋 Descripción General

Este documento describe el sistema de inicialización automática que se ejecuta cada vez que se despliega el contenedor Docker de CitaPlanner. El sistema garantiza que la aplicación esté completamente configurada y lista para usar desde el primer despliegue.

## 🎯 Características Principales

### 1. **Idempotencia**
- El script puede ejecutarse múltiples veces sin causar problemas
- Verifica el estado actual antes de realizar cambios
- No duplica datos ni configuraciones existentes

### 2. **Inicialización Automática**
- Ejecuta migraciones de base de datos
- Genera el cliente Prisma
- Inserta datos de ejemplo (solo si la BD está vacía)
- Configura el Master Admin password

### 3. **Manejo Robusto de Errores**
- Reintentos automáticos para conexión a BD
- Logging detallado de cada paso
- Continúa con el inicio incluso si algunos pasos fallan

## 🔄 Flujo de Inicialización

```
┌─────────────────────────────────────────┐
│  1. Detectar comando Prisma disponible  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  2. Verificar conexión a PostgreSQL     │
│     (30 intentos con timeout)           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  3. Ejecutar migraciones Prisma         │
│     (db push + migrate deploy)          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  4. Generar cliente Prisma              │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  5. Verificar si BD está vacía          │
│     (contar usuarios)                   │
└──────────────┬──────────────────────────┘
               │
               ├─── Vacía ────────────────┐
               │                           ▼
               │              ┌────────────────────────┐
               │              │  6. Ejecutar seed      │
               │              │     - 1 Tenant         │
               │              │     - 1 Branch         │
               │              │     - 5 Usuarios       │
               │              │     - 6 Servicios      │
               │              │     - 6 Clientes       │
               │              │     - 6 Citas          │
               │              │     - 3 Pagos          │
               │              └────────────┬───────────┘
               │                           │
               └─── Con datos ─────────────┤
                                           ▼
               ┌─────────────────────────────────────┐
               │  7. Configurar Master Password      │
               │     (solo si no existe)             │
               └──────────────┬──────────────────────┘
                              │
                              ▼
               ┌─────────────────────────────────────┐
               │  8. Verificar archivos Next.js      │
               └──────────────┬──────────────────────┘
                              │
                              ▼
               ┌─────────────────────────────────────┐
               │  9. Iniciar aplicación Next.js      │
               │     (node server.js)                │
               └─────────────────────────────────────┘
```

## 📦 Datos de Ejemplo (Seed)

### Usuarios Creados

| Email | Password | Rol | Descripción |
|-------|----------|-----|-------------|
| admin@citaplanner.com | admin123 | ADMIN | Administrador principal |
| manager@citaplanner.com | manager123 | MANAGER | Gerente de sucursal |
| pro1@citaplanner.com | prof123 | PROFESSIONAL | Estilista Senior |
| pro2@citaplanner.com | prof123 | PROFESSIONAL | Barbero Profesional |
| recepcionista@citaplanner.com | prof123 | RECEPTIONIST | Recepcionista |

### Servicios Creados

1. **Facial Hidratante** - 60 min - $850 MXN
2. **Masaje Relajante** - 90 min - $1,200 MXN
3. **Manicure y Pedicure** - 120 min - $650 MXN
4. **Corte de Cabello** - 45 min - $450 MXN
5. **Limpieza Facial Profunda** - 75 min - $950 MXN
6. **Masaje Terapéutico** - 60 min - $1,000 MXN

### Clientes de Ejemplo

- 6 clientes con datos completos
- Incluyen email, teléfono y dirección
- Algunos con notas especiales (alergias, preferencias)

### Citas de Ejemplo

- 2 citas para hoy (confirmada y pendiente)
- 1 cita para mañana
- 3 citas completadas de días anteriores
- Incluyen pagos registrados para las completadas

## 🔐 Configuración del Master Admin

### Password por Defecto

- **Password**: `x0420EZS2025*`
- **URL**: `https://citaplanner.com/admin/master`
- **Hash**: `$2b$10$P/AV363LeWhZGK0kkrON3eGmAlkmiTHKuzZzDKCAppFV.0Gzf0ZaO`

### Personalización del Password

Puedes configurar un password personalizado usando la variable de entorno:

```bash
MASTER_PASSWORD_HASH=tu_hash_bcrypt_aqui
```

Para generar un nuevo hash:

```bash
# En el contenedor o localmente con Node.js
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('tu_password', 10));"
```

## 🐳 Integración con Docker

### Dockerfile

El script `docker-entrypoint.sh` se configura como el punto de entrada del contenedor:

```dockerfile
# Copiar script de inicialización
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Configurar como entrypoint
CMD ["./docker-entrypoint.sh"]
```

### Variables de Entorno Requeridas

```bash
# Base de datos PostgreSQL (REQUERIDA)
DATABASE_URL=postgresql://user:password@host:5432/database

# Master password personalizado (OPCIONAL)
MASTER_PASSWORD_HASH=$2b$10$...

# Next.js (configuradas automáticamente)
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
HOSTNAME=0.0.0.0
```

## 📊 Logging y Monitoreo

### Formato de Logs

Todos los logs incluyen timestamp y emoji para fácil identificación:

```
[2025-01-05 10:30:45] ℹ️  Mensaje informativo
[2025-01-05 10:30:46] ✅ Operación exitosa
[2025-01-05 10:30:47] ⚠️  Advertencia
[2025-01-05 10:30:48] ❌ Error
```

### Logs Importantes a Monitorear

1. **Conexión a BD**: Verifica que se establezca en los primeros 30 intentos
2. **Migraciones**: Confirma que se apliquen correctamente
3. **Seed**: Solo debe ejecutarse en el primer despliegue
4. **Master Password**: Verifica que se configure correctamente

## 🔧 Troubleshooting

### Problema: La BD no se conecta

**Síntomas**: Logs muestran "No se pudo conectar a la base de datos"

**Solución**:
1. Verifica que `DATABASE_URL` esté correctamente configurada
2. Confirma que PostgreSQL esté accesible desde el contenedor
3. Revisa las credenciales y permisos de la BD

### Problema: El seed falla

**Síntomas**: Error al ejecutar seed, pero la app inicia

**Solución**:
1. Verifica que la BD esté vacía (el seed solo se ejecuta si no hay usuarios)
2. Revisa los logs para identificar el error específico
3. Puedes ejecutar el seed manualmente desde `/admin/seed`

### Problema: Master password no funciona

**Síntomas**: No puedes acceder a `/admin/master`

**Solución**:
1. Verifica que la tabla `master_admin_config` tenga un registro
2. Confirma que el hash sea compatible con bcryptjs
3. Usa el password por defecto: `x0420EZS2025*`
4. Regenera el hash si es necesario

### Problema: El contenedor no inicia

**Síntomas**: El contenedor se detiene después del inicio

**Solución**:
1. Revisa los logs del contenedor: `docker logs <container_id>`
2. Verifica que `server.js` exista en `/app/server.js`
3. Confirma que el build standalone se haya generado correctamente

## 🔄 Actualizaciones y Mantenimiento

### Modificar el Seed

Para cambiar los datos de ejemplo:

1. Edita `app/scripts/seed.ts`
2. Reconstruye la imagen Docker
3. El nuevo seed se aplicará en despliegues con BD vacía

### Cambiar el Master Password

Para actualizar el password por defecto:

1. Genera un nuevo hash con bcryptjs
2. Actualiza la variable `default_hash` en `docker-entrypoint.sh`
3. O usa la variable de entorno `MASTER_PASSWORD_HASH`

### Agregar Nuevas Migraciones

1. Crea la migración con Prisma: `npx prisma migrate dev`
2. Commit los archivos de migración
3. El script las aplicará automáticamente en el próximo deploy

## ⚠️ Consideraciones de Seguridad

### Datos de Ejemplo en Producción

- Los datos de ejemplo son **solo para desarrollo/demo**
- En producción, considera:
  - Deshabilitar el seed automático
  - Usar datos reales desde el inicio
  - Eliminar usuarios de ejemplo después de configurar

### Master Password

- **Cambia el password por defecto inmediatamente**
- Usa un password fuerte y único
- Considera usar variables de entorno para el hash
- No compartas el password en repositorios públicos

### Variables de Entorno

- Nunca incluyas credenciales en el código
- Usa secretos de Easypanel/Docker para variables sensibles
- Rota las credenciales regularmente

## 📚 Referencias

- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Seeding](https://www.prisma.io/docs/guides/database/seed-database)
- [Docker Entrypoint](https://docs.docker.com/engine/reference/builder/#entrypoint)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)

## 🆘 Soporte

Si encuentras problemas con el sistema de inicialización:

1. Revisa los logs del contenedor
2. Consulta la sección de Troubleshooting
3. Verifica la configuración de variables de entorno
4. Contacta al equipo de desarrollo con los logs relevantes

---

**Última actualización**: Enero 2025  
**Versión**: 1.0.0
