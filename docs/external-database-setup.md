
# Configuración de Base de Datos PostgreSQL Externa para CitaPlanner

## 📋 Índice

1. [¿Por qué usar una base de datos externa?](#por-qué-usar-una-base-de-datos-externa)
2. [Proveedores recomendados](#proveedores-recomendados)
3. [Guía paso a paso](#guía-paso-a-paso)
4. [Configuración en Easypanel](#configuración-en-easypanel)
5. [Solución de problemas](#solución-de-problemas)
6. [Migraciones y mantenimiento](#migraciones-y-mantenimiento)

---

## ¿Por qué usar una base de datos externa?

### Problema con base de datos local (contenedor)
Cuando usas una base de datos PostgreSQL dentro del mismo contenedor Docker o como servicio en `docker-compose.yml`:

❌ **Los datos se pierden** cada vez que:
- Haces un nuevo deploy
- Actualizas el código del repositorio
- Reinicias el contenedor
- Easypanel reconstruye la imagen

❌ **Otros problemas**:
- No hay backups automáticos
- Difícil de escalar
- No se puede acceder desde otras aplicaciones
- Pérdida de datos en caso de fallo del servidor

### Ventajas de base de datos externa

✅ **Persistencia de datos**: Los datos permanecen intactos sin importar cuántas veces hagas deploy

✅ **Backups automáticos**: La mayoría de proveedores ofrecen backups diarios automáticos

✅ **Escalabilidad**: Puedes aumentar recursos de la BD independientemente de la app

✅ **Acceso múltiple**: Puedes conectar múltiples aplicaciones o servicios

✅ **Monitoreo**: Herramientas de monitoreo y métricas incluidas

✅ **Seguridad**: Conexiones SSL/TLS, encriptación, y mejores prácticas de seguridad

---

## Proveedores recomendados

### 1. 🟢 Neon (RECOMENDADO para desarrollo)

**Plan gratuito**: 512 MB de almacenamiento, ideal para desarrollo y proyectos pequeños

**Ventajas**:
- ✅ No requiere whitelist de IPs (funciona con IPs dinámicas de Easypanel)
- ✅ Configuración en 2 minutos
- ✅ Serverless (escala automáticamente)
- ✅ Backups automáticos incluidos
- ✅ Interfaz web para gestionar datos

**Pasos**:
1. Regístrate en [https://neon.tech](https://neon.tech)
2. Crea un nuevo proyecto
3. Copia la cadena de conexión (Connection String)
4. Formato: `postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/citaplanner?sslmode=require`

**Precio**: Gratis hasta 512 MB, luego desde $19/mes

---

### 2. 🟣 Supabase

**Plan gratuito**: 500 MB de almacenamiento + 2 GB de transferencia

**Ventajas**:
- ✅ No requiere whitelist de IPs
- ✅ Incluye autenticación y storage
- ✅ Dashboard completo para gestión
- ✅ API REST automática
- ✅ Backups automáticos

**Pasos**:
1. Regístrate en [https://supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings → Database
4. Copia la "Connection string" en modo "Session"
5. Formato: `postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres`

**Precio**: Gratis hasta 500 MB, luego desde $25/mes

---

### 3. 🚂 Railway

**Plan gratuito**: $5 de crédito mensual (suficiente para desarrollo)

**Ventajas**:
- ✅ Muy fácil de usar
- ✅ Deploy automático desde GitHub
- ✅ Métricas en tiempo real
- ✅ Backups automáticos

**Pasos**:
1. Regístrate en [https://railway.app](https://railway.app)
2. Crea un nuevo proyecto
3. Agrega PostgreSQL desde el marketplace
4. Copia la variable `DATABASE_URL`
5. Formato: `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway`

**Precio**: $5 crédito gratis/mes, luego pago por uso

---

### 4. 🎨 Render

**Plan gratuito**: Base de datos con 90 días de retención

**Ventajas**:
- ✅ Plan gratuito generoso
- ✅ Backups automáticos
- ✅ SSL incluido
- ✅ Fácil configuración

**Pasos**:
1. Regístrate en [https://render.com](https://render.com)
2. Crea una nueva PostgreSQL Database
3. Copia la "External Database URL"
4. Formato: `postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/dbname`

**Precio**: Gratis (con limitaciones), luego desde $7/mes

---

### 5. 🌊 DigitalOcean Managed Database

**Sin plan gratuito**, pero muy confiable para producción

**Ventajas**:
- ✅ Alta disponibilidad
- ✅ Backups diarios automáticos
- ✅ Escalabilidad fácil
- ✅ Soporte 24/7

**Pasos**:
1. Crea una cuenta en [https://digitalocean.com](https://digitalocean.com)
2. Ve a Databases → Create Database
3. Selecciona PostgreSQL
4. Copia la cadena de conexión
5. Formato: `postgresql://doadmin:password@db-postgresql-nyc3-xxxxx.db.ondigitalocean.com:25060/defaultdb?sslmode=require`

**Precio**: Desde $15/mes

---

### 6. ☁️ AWS RDS

**Para producción empresarial**

**Ventajas**:
- ✅ Máxima confiabilidad
- ✅ Integración con otros servicios AWS
- ✅ Múltiples zonas de disponibilidad
- ✅ Backups automáticos configurables

**Pasos**:
1. Accede a AWS Console
2. Ve a RDS → Create Database
3. Selecciona PostgreSQL
4. Configura instancia (t3.micro para desarrollo)
5. Copia el endpoint
6. Formato: `postgresql://postgres:password@citaplanner.xxxxx.us-east-1.rds.amazonaws.com:5432/citaplanner`

**Precio**: Desde $15/mes (t3.micro)

---

## Guía paso a paso

### Paso 1: Elegir y crear la base de datos

1. **Elige un proveedor** de la lista anterior según tus necesidades:
   - **Desarrollo/pruebas**: Neon o Supabase (gratis)
   - **Producción pequeña**: Railway o Render
   - **Producción empresarial**: DigitalOcean o AWS RDS

2. **Crea una cuenta** en el proveedor elegido

3. **Crea una nueva base de datos PostgreSQL**
   - Nombre sugerido: `citaplanner` o `citaplanner_production`
   - Versión: PostgreSQL 14 o superior

4. **Obtén la cadena de conexión** (DATABASE_URL)
   - Busca en la configuración de tu base de datos
   - Generalmente se llama "Connection String" o "Database URL"
   - Debe incluir: usuario, contraseña, host, puerto y nombre de BD

### Paso 2: Verificar la cadena de conexión

La cadena de conexión debe tener este formato:

```
postgresql://[usuario]:[contraseña]@[host]:[puerto]/[nombre_bd][?parámetros]
```

**Ejemplo completo**:
```
postgresql://myuser:mypassword123@db.example.com:5432/citaplanner?sslmode=require
```

**Componentes**:
- `myuser`: Usuario de la base de datos
- `mypassword123`: Contraseña
- `db.example.com`: Host/servidor
- `5432`: Puerto (por defecto PostgreSQL)
- `citaplanner`: Nombre de la base de datos
- `?sslmode=require`: Parámetros adicionales (SSL, etc.)

### Paso 3: Generar secrets de seguridad

Necesitas generar dos secrets seguros para NextAuth y JWT:

**En Linux/Mac**:
```bash
openssl rand -base64 32
```

**En Windows (PowerShell)**:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Online** (si no tienes acceso a terminal):
- Visita: https://generate-secret.vercel.app/32

Guarda estos valores, los necesitarás en el siguiente paso.

### Paso 4: Configurar variables de entorno en Easypanel

1. **Accede a tu proyecto en Easypanel**
   - Ve a tu dashboard de Easypanel
   - Selecciona el proyecto CitaPlanner

2. **Navega a Environment Variables**
   - Busca la sección "Environment" o "Variables de Entorno"
   - Puede estar en Settings o Configuration

3. **Agrega las siguientes variables**:

   | Variable | Valor | Ejemplo |
   |----------|-------|---------|
   | `DATABASE_URL` | Tu cadena de conexión completa | `postgresql://user:pass@host:5432/db` |
   | `NEXTAUTH_URL` | URL de tu aplicación | `https://citaplanner.tu-dominio.com` |
   | `NEXTAUTH_SECRET` | Secret generado en Paso 3 | `abc123xyz...` |
   | `JWT_SECRET` | Secret generado en Paso 3 | `def456uvw...` |
   | `NODE_ENV` | `production` | `production` |
   | `PORT` | `3000` | `3000` |

4. **Guarda los cambios**

### Paso 5: Hacer deploy

1. **Trigger un nuevo deploy** en Easypanel
   - Puede ser automático si tienes GitHub conectado
   - O manual desde el dashboard

2. **Monitorea los logs** durante el deploy:
   ```
   ✅ Busca estos mensajes:
   - "Verificando conexión a la base de datos..."
   - "Sincronizando esquema de base de datos..."
   - "Iniciando servidor Next.js standalone..."
   ```

3. **Verifica que no haya errores** de conexión

### Paso 6: Verificar la aplicación

1. **Accede a tu aplicación** en el navegador

2. **Prueba las funcionalidades**:
   - Registro de usuario
   - Login
   - Creación de citas
   - Cualquier otra funcionalidad que use la BD

3. **Verifica persistencia**:
   - Crea algunos datos de prueba
   - Haz un nuevo deploy
   - Verifica que los datos siguen ahí ✅

---

## Configuración en Easypanel

### Opción A: Variables de entorno en la UI

Esta es la forma **recomendada** y más segura:

1. Ve a tu proyecto en Easypanel
2. Sección "Environment Variables"
3. Agrega cada variable individualmente
4. Guarda y redeploy

**Ventajas**:
- ✅ No se guardan en Git
- ✅ Fácil de actualizar
- ✅ Más seguro

### Opción B: Archivo .env (no recomendado para producción)

Si prefieres usar un archivo `.env`:

1. Crea `.env.easypanel` basado en `.env.easypanel.example`
2. Llena todos los valores
3. Súbelo a Easypanel (asegúrate de que NO esté en Git)

**Desventajas**:
- ⚠️ Riesgo de subir credenciales a Git
- ⚠️ Más difícil de actualizar

---

## Solución de problemas

### Error: "Can't reach database server"

**Causa**: La aplicación no puede conectarse a la base de datos

**Soluciones**:

1. **Verifica la cadena de conexión**:
   ```bash
   # Debe tener este formato exacto:
   postgresql://user:password@host:port/database
   ```

2. **Verifica que el host sea accesible**:
   - Algunos proveedores requieren whitelist de IPs
   - Easypanel usa IPs dinámicas (usa Neon o Supabase que no requieren whitelist)

3. **Verifica SSL**:
   - Si tu proveedor requiere SSL, agrega `?sslmode=require` al final de la URL
   - Ejemplo: `postgresql://user:pass@host:5432/db?sslmode=require`

4. **Verifica credenciales**:
   - Usuario y contraseña correctos
   - Base de datos existe
   - Usuario tiene permisos

### Error: "P3005: Database schema is not empty"

**Causa**: La base de datos ya tiene tablas y Prisma intenta crear el esquema

**Solución**:

El script `start.sh` ya maneja esto automáticamente con `db push --accept-data-loss`.

Si necesitas resetear la base de datos:

```bash
# ⚠️ CUIDADO: Esto borrará todos los datos
npx prisma db push --force-reset --accept-data-loss
```

### Error: "Prisma Client not found"

**Causa**: El cliente de Prisma no se generó correctamente

**Solución**:

El script `start.sh` regenera el cliente automáticamente. Si persiste:

1. Verifica que `prisma/schema.prisma` existe
2. Verifica los logs del deploy
3. Intenta un rebuild completo en Easypanel

### La aplicación se conecta pero no hay datos

**Causa**: Las migraciones no se ejecutaron o el seed falló

**Solución**:

1. **Revisa los logs** del deploy:
   ```
   Busca: "Sincronizando esquema de base de datos..."
   ```

2. **Ejecuta migraciones manualmente** (si es necesario):
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

3. **Verifica en el dashboard de tu proveedor**:
   - Conéctate a la base de datos
   - Verifica que las tablas existen
   - Verifica que hay datos (si ejecutaste seed)

### Rendimiento lento

**Causas posibles**:
- Base de datos en región diferente a Easypanel
- Plan gratuito con limitaciones
- Muchas consultas sin optimizar

**Soluciones**:

1. **Elige región cercana**:
   - Si Easypanel está en US-East, usa base de datos en US-East

2. **Optimiza consultas**:
   - Agrega índices en Prisma schema
   - Usa `select` para traer solo campos necesarios
   - Implementa paginación

3. **Considera upgrade**:
   - Planes pagos suelen tener mejor rendimiento
   - Más CPU, RAM y IOPS

---

## Migraciones y mantenimiento

### Migraciones automáticas

El archivo `start.sh` ejecuta automáticamente:

```bash
# Sincroniza el esquema (crea/actualiza tablas)
prisma db push --accept-data-loss

# Regenera el cliente Prisma
prisma generate

# Ejecuta seed si la BD está vacía
prisma db seed
```

Esto ocurre en **cada deploy**, asegurando que tu esquema esté siempre actualizado.

### Migraciones manuales

Si necesitas ejecutar migraciones manualmente:

```bash
# Ver estado de migraciones
npx prisma migrate status

# Aplicar migraciones pendientes
npx prisma migrate deploy

# Crear nueva migración (desarrollo)
npx prisma migrate dev --name nombre_migracion
```

### Backups

**Backups automáticos** (según proveedor):
- Neon: Backups diarios automáticos (7 días retención en plan gratuito)
- Supabase: Backups diarios automáticos
- Railway: Backups automáticos incluidos
- Render: Backups automáticos (90 días en plan gratuito)
- DigitalOcean: Backups diarios configurables
- AWS RDS: Backups automáticos configurables (1-35 días)

**Backup manual**:

```bash
# Exportar datos
pg_dump -h host -U user -d database > backup.sql

# Restaurar datos
psql -h host -U user -d database < backup.sql
```

### Monitoreo

**Métricas importantes**:
- Conexiones activas
- Uso de CPU y memoria
- Tamaño de la base de datos
- Tiempo de respuesta de queries

**Herramientas**:
- Dashboard del proveedor (Neon, Supabase, etc.)
- Logs de Easypanel
- Prisma Studio: `npx prisma studio`

### Escalabilidad

**Cuándo escalar**:
- Base de datos cerca del límite de almacenamiento
- Queries lentas (>1 segundo)
- Muchas conexiones concurrentes
- Errores de timeout

**Cómo escalar**:
1. **Vertical** (más recursos):
   - Upgrade al siguiente plan
   - Más CPU, RAM, almacenamiento

2. **Horizontal** (réplicas):
   - Read replicas para consultas
   - Load balancing
   - Sharding (casos avanzados)

---

## Checklist final

Antes de considerar la configuración completa, verifica:

- [ ] Base de datos externa creada y accesible
- [ ] Cadena de conexión (DATABASE_URL) correcta
- [ ] Variables de entorno configuradas en Easypanel
- [ ] Deploy exitoso sin errores en logs
- [ ] Aplicación accesible en el navegador
- [ ] Funcionalidades básicas funcionando (login, registro, etc.)
- [ ] Datos persisten después de un redeploy
- [ ] Backups automáticos configurados
- [ ] Monitoreo básico configurado

---

## Recursos adicionales

- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de Neon](https://neon.tech/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Easypanel](https://easypanel.io/docs)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)

---

## Soporte

Si tienes problemas:

1. Revisa los logs de Easypanel
2. Revisa los logs de tu proveedor de base de datos
3. Consulta la documentación del proveedor
4. Abre un issue en el repositorio de GitHub

---

**¡Listo!** Tu CitaPlanner ahora usa una base de datos externa persistente. Los datos ya no se perderán con cada deploy. 🎉

