
# 📦 Configuración de Volúmenes en Easypanel - CitaPlanner

## Guía Paso a Paso

### 1. Volumen de Base de Datos PostgreSQL

Este volumen ya debería estar configurado. Verifica:

#### Pasos de Verificación:

1. **Accede a Easypanel**
   - Ve a tu proyecto CitaPlanner
   - Selecciona el servicio **PostgreSQL**

2. **Verifica el Volumen**
   - Click en la pestaña **"Volumes"**
   - Deberías ver:
     ```
     Nombre: citaplanner-postgres-data
     Mount Path: /var/lib/postgresql/data
     Tipo: Persistent Volume
     ```

3. **Si NO existe el volumen:**
   - Click en **"Add Volume"**
   - Configura:
     - **Name**: `citaplanner-postgres-data`
     - **Mount Path**: `/var/lib/postgresql/data`
     - **Size**: Mínimo 5GB (recomendado 10GB)
   - Click en **"Save"**
   - **Redeploy** el servicio PostgreSQL

---

### 2. Volumen de Backups (NUEVO - Requerido)

Este es el volumen que necesitas agregar para los backups automáticos.

#### Pasos de Configuración:

1. **Accede al Servicio de CitaPlanner App**
   - En Easypanel, ve a tu proyecto
   - Selecciona el servicio **CitaPlanner** (la aplicación Next.js)

2. **Agregar Nuevo Volumen**
   - Click en la pestaña **"Volumes"**
   - Click en **"Add Volume"**

3. **Configurar el Volumen de Backups**
   ```
   Name: citaplanner-backups
   Mount Path: /backup-citaplanner
   Size: 20GB (recomendado, mínimo 10GB)
   ```

4. **Guardar y Redeploy**
   - Click en **"Save"**
   - Click en **"Deploy"** para aplicar los cambios

---

### 3. Verificación Post-Configuración

Después de configurar los volúmenes, verifica que todo funciona:

#### Verificar Volumen de PostgreSQL:

```bash
# Conectar al contenedor de PostgreSQL
docker exec -it <postgres-container-id> sh

# Verificar que el volumen está montado
df -h | grep postgresql

# Deberías ver algo como:
# /dev/vda1  10G  2.5G  7.5G  25%  /var/lib/postgresql/data

# Verificar permisos
ls -la /var/lib/postgresql/data
# Debe ser propiedad del usuario postgres
```

#### Verificar Volumen de Backups:

```bash
# Conectar al contenedor de la aplicación
docker exec -it <app-container-id> sh

# Verificar que el volumen está montado
df -h | grep backup

# Deberías ver algo como:
# /dev/vda2  20G  100M  19.9G  1%  /backup-citaplanner

# Crear estructura de directorios
mkdir -p /backup-citaplanner/{daily,weekly,monthly,logs}

# Verificar permisos de escritura
touch /backup-citaplanner/test.txt && rm /backup-citaplanner/test.txt
echo "✅ Permisos de escritura OK"
```

---

### 4. Configuración de Variables de Entorno

Asegúrate de tener estas variables configuradas en Easypanel:

#### Variables Requeridas:

```bash
# Base de datos (Easypanel las configura automáticamente)
DATABASE_URL=postgresql://user:password@postgres-host:5432/citaplanner_db

# NextAuth (debes configurarlas manualmente)
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=<genera-un-secret-aleatorio-seguro>

# Master Admin (opcional - usa el default si no se configura)
MASTER_PASSWORD_HASH=<hash-bcrypt-del-password>
```

#### Cómo Configurar Variables en Easypanel:

1. Ve a tu servicio CitaPlanner
2. Click en **"Environment"**
3. Agrega cada variable:
   - Click en **"Add Variable"**
   - Ingresa **Name** y **Value**
   - Click en **"Save"**
4. **Redeploy** después de agregar todas las variables

---

### 5. Configurar Backups Automáticos (Cron Job)

#### Opción A: Usando Easypanel Cron (Recomendado)

1. **Accede al Servicio PostgreSQL**
   - Ve a tu servicio PostgreSQL en Easypanel

2. **Agregar Cron Job**
   - Busca la sección **"Cron Jobs"** o **"Scheduled Tasks"**
   - Click en **"Add Cron Job"**

3. **Configurar el Cron**
   ```
   Schedule: 0 2 * * *
   Command: /app/scripts/pg_backup.sh
   ```
   - Esto ejecutará el backup todos los días a las 2:00 AM

4. **Guardar**
   - Click en **"Save"**
   - El cron job se activará automáticamente

#### Opción B: Configuración Manual en Contenedor

Si Easypanel no tiene soporte para cron jobs:

```bash
# 1. Conectar al contenedor
docker exec -it <app-container-id> sh

# 2. Instalar cron (si no está instalado)
apk add --no-cache dcron

# 3. Crear archivo crontab
cat > /etc/crontabs/root << 'EOF'
# Backup diario a las 2:00 AM
0 2 * * * /app/scripts/pg_backup.sh >> /backup-citaplanner/logs/cron.log 2>&1
EOF

# 4. Iniciar cron
crond -b

# 5. Verificar que está corriendo
ps aux | grep crond
```

---

### 6. Prueba de Configuración

#### Prueba 1: Backup Manual

```bash
# Conectar al contenedor
docker exec -it <app-container-id> sh

# Ejecutar backup manual
/app/scripts/pg_backup.sh

# Verificar que se creó el backup
ls -lh /backup-citaplanner/daily/

# Deberías ver archivos como:
# citaplanner_daily_20250109_143022.sql.gz
# citaplanner_daily_20250109_143022.sql.gz.sha256
```

#### Prueba 2: Verificar Integridad

```bash
# Verificar todos los backups
/app/scripts/pg_backup.sh --verify-only

# Deberías ver:
# ✅ Backup verificado correctamente
```

#### Prueba 3: Persistencia de Datos

```bash
# 1. Crear un registro de prueba
docker exec -it <app-container-id> sh
psql $DATABASE_URL -c "INSERT INTO clients (first_name, last_name, email, tenant_id) VALUES ('Test', 'User', 'test@test.com', (SELECT id FROM tenants LIMIT 1));"

# 2. Redeploy la aplicación en Easypanel
# (Click en "Deploy" en la interfaz)

# 3. Verificar que el registro sigue ahí
docker exec -it <app-container-id> sh
psql $DATABASE_URL -c "SELECT * FROM clients WHERE email = 'test@test.com';"

# Si ves el registro, ¡la persistencia funciona! ✅
```

---

### 7. Monitoreo de Espacio en Disco

#### Verificar Espacio Usado:

```bash
# Espacio total de volúmenes
docker exec -it <app-container-id> df -h

# Espacio usado por backups
du -sh /backup-citaplanner/*

# Ejemplo de salida:
# 150M    /backup-citaplanner/daily
# 450M    /backup-citaplanner/weekly
# 1.2G    /backup-citaplanner/monthly
# 2.0M    /backup-citaplanner/logs
```

#### Configurar Alertas (Opcional):

Si Easypanel tiene soporte para alertas:

1. Ve a **"Monitoring"** o **"Alerts"**
2. Configura alerta para:
   - Uso de disco > 80%
   - Espacio libre < 2GB

---

### 8. Troubleshooting Común

#### Problema: "Permission denied" al crear backup

**Solución:**
```bash
# Verificar permisos del script
ls -la /app/scripts/pg_backup.sh

# Dar permisos de ejecución
chmod +x /app/scripts/pg_backup.sh

# Verificar permisos del directorio de backups
ls -la /backup-citaplanner

# Cambiar propietario si es necesario
chown -R nextjs:nodejs /backup-citaplanner
```

#### Problema: Volumen no se monta

**Solución:**
1. Verifica que el volumen existe en Easypanel
2. Verifica el "Mount Path" exacto
3. Redeploy el servicio
4. Verifica logs del contenedor:
   ```bash
   docker logs <container-id>
   ```

#### Problema: Backups no se crean automáticamente

**Solución:**
```bash
# Verificar que cron está corriendo
ps aux | grep crond

# Ver logs de cron
tail -f /backup-citaplanner/logs/cron.log

# Ejecutar backup manual para ver errores
/app/scripts/pg_backup.sh
```

---

### 9. Checklist de Configuración

Usa este checklist para asegurarte de que todo está configurado:

- [ ] Volumen PostgreSQL configurado (`/var/lib/postgresql/data`)
- [ ] Volumen de backups configurado (`/backup-citaplanner`)
- [ ] Variables de entorno configuradas (DATABASE_URL, NEXTAUTH_URL, etc.)
- [ ] Script de backup tiene permisos de ejecución
- [ ] Cron job configurado para backups automáticos
- [ ] Backup manual ejecutado exitosamente
- [ ] Integridad de backup verificada
- [ ] Persistencia de datos probada (redeploy sin pérdida de datos)
- [ ] Espacio en disco monitoreado
- [ ] Documentación revisada

---

### 10. Próximos Pasos

Una vez configurado todo:

1. **Espera 24 horas** para que se cree el primer backup automático
2. **Verifica** que el backup se creó correctamente
3. **Prueba una restauración** en un ambiente de prueba
4. **Documenta** cualquier configuración específica de tu setup
5. **Configura alertas** de monitoreo si están disponibles

---

## Recursos Adicionales

- [Documentación Completa de Persistencia](./DB-PERSISTENCIA.md)
- [Guía Rápida de Backup y Restauración](./BACKUP-RESTORE-GUIDE.md)
- [Documentación de Easypanel](https://easypanel.io/docs)
- [Docker Volumes](https://docs.docker.com/storage/volumes/)

---

**¿Necesitas ayuda?**

Si encuentras problemas durante la configuración:

1. Revisa los logs: `/backup-citaplanner/logs/`
2. Verifica el estado de los contenedores: `docker ps`
3. Consulta la documentación completa en `DB-PERSISTENCIA.md`
4. Contacta al equipo de desarrollo con logs específicos

---

**Última actualización**: 9 de Octubre, 2025
