# 🐘 Guía de Deployment en Easypanel con PostgreSQL Local

Esta guía te ayudará a desplegar CitaPlanner en Easypanel usando una base de datos PostgreSQL local con almacenamiento persistente.

## 📋 Tabla de Contenidos

1. [Ventajas de PostgreSQL Local](#ventajas-de-postgresql-local)
2. [Requisitos Previos](#requisitos-previos)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Configuración Paso a Paso](#configuración-paso-a-paso)
5. [Variables de Entorno](#variables-de-entorno)
6. [Almacenamiento Persistente](#almacenamiento-persistente)
7. [Comandos Útiles](#comandos-útiles)
8. [Backups y Restauración](#backups-y-restauración)
9. [Troubleshooting](#troubleshooting)
10. [Seguridad](#seguridad)

---

## 🎯 Ventajas de PostgreSQL Local

### ✅ Beneficios

- **Sin costos adicionales**: No pagas por servicios externos de base de datos
- **Baja latencia**: La base de datos está en el mismo servidor que la aplicación
- **Control total**: Acceso completo a la configuración y datos
- **Sin límites de conexiones**: No hay restricciones de planes gratuitos
- **Datos persistentes**: Los datos se mantienen entre redeploys
- **Backups locales**: Control total sobre tus backups

### ⚠️ Consideraciones

- **Recursos del servidor**: Necesitas suficiente RAM y almacenamiento
- **Backups manuales**: Debes configurar tu propia estrategia de backups
- **Escalabilidad**: Para alto tráfico, considera bases de datos administradas
- **Mantenimiento**: Eres responsable de actualizaciones y optimización

---

## 📦 Requisitos Previos

### 1. Servidor Easypanel

- Acceso a un servidor con Easypanel instalado
- Mínimo 2GB RAM (recomendado 4GB)
- Mínimo 10GB de almacenamiento disponible
- Docker y Docker Compose instalados (viene con Easypanel)

### 2. Repositorio

- Repositorio de CitaPlanner clonado o accesible
- Archivo `docker-compose.easypanel.yml` actualizado
- Permisos de escritura en el servidor

### 3. Credenciales

- Contraseña segura para PostgreSQL
- Secrets para NextAuth y JWT
- Credenciales de servicios externos (OpenPay, Twilio, etc.)

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    EASYPANEL SERVER                      │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         Docker Network: citaplanner-network     │    │
│  │                                                  │    │
│  │  ┌──────────────────┐    ┌──────────────────┐ │    │
│  │  │  CitaPlanner App │    │   PostgreSQL DB   │ │    │
│  │  │   (Next.js)      │◄───┤   (postgres:16)   │ │    │
│  │  │   Port: 3000     │    │   Port: 5432      │ │    │
│  │  └──────────────────┘    └──────────────────┘ │    │
│  │           │                       │             │    │
│  │           │                       │             │    │
│  │           ▼                       ▼             │    │
│  │    ┌─────────────┐      ┌──────────────────┐  │    │
│  │    │   Internet  │      │  Persistent Data  │  │    │
│  │    │   (HTTPS)   │      │  ./data/postgres  │  │    │
│  │    └─────────────┘      └──────────────────┘  │    │
│  │                                                  │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Configuración Paso a Paso

### Paso 1: Preparar el Servidor

```bash
# Conectarse al servidor vía SSH
ssh usuario@tu-servidor.com

# Crear directorio para el proyecto
mkdir -p /home/usuario/citaplanner
cd /home/usuario/citaplanner

# Clonar el repositorio (o subir archivos)
git clone https://github.com/tu-usuario/citaplanner.git .
```

### Paso 2: Crear Directorio de Datos Persistentes

```bash
# Crear directorio para datos de PostgreSQL
mkdir -p ./data/postgres

# Establecer permisos correctos (usuario postgres en Docker usa UID 999)
sudo chown -R 999:999 ./data/postgres
sudo chmod -R 700 ./data/postgres

# Verificar permisos
ls -la ./data/
```

**Salida esperada:**
```
drwx------ 2 999 999 4096 Oct  1 12:00 postgres
```

### Paso 3: Configurar Variables de Entorno en Easypanel

#### 3.1 Acceder a la Configuración

1. Abre Easypanel en tu navegador: `https://tu-servidor.com:3000`
2. Navega a tu proyecto CitaPlanner
3. Ve a la sección **"Environment"** o **"Variables de Entorno"**

#### 3.2 Variables Obligatorias

Agrega las siguientes variables **una por una**:

| Variable | Valor de Ejemplo | Descripción |
|----------|------------------|-------------|
| `NODE_ENV` | `production` | Entorno de ejecución |
| `PORT` | `3000` | Puerto de la aplicación |
| `POSTGRES_PASSWORD` | `MiPassword123!Seguro` | Contraseña de PostgreSQL |
| `DATABASE_URL` | `postgresql://postgres:MiPassword123!Seguro@postgres:5432/citaplanner?sslmode=disable` | URL de conexión completa |
| `NEXTAUTH_URL` | `https://citaplanner.tu-dominio.com` | URL de tu aplicación |
| `NEXTAUTH_SECRET` | `[resultado de openssl rand -base64 32]` | Secret para NextAuth |
| `JWT_SECRET` | `[resultado de openssl rand -base64 32]` | Secret para JWT |

#### 3.3 Variables Opcionales (según necesites)

**OpenPay (Pagos):**
```
OPENPAY_MERCHANT_ID=tu_merchant_id
OPENPAY_PRIVATE_KEY=sk_tu_private_key
OPENPAY_PUBLIC_KEY=pk_tu_public_key
OPENPAY_API_KEY=tu_api_key
OPENPAY_PRODUCTION=false
OPENPAY_BASE_URL=https://sandbox-api.openpay.mx/v1
```

**Twilio (SMS/WhatsApp):**
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+521234567890
```

**Email/SMTP:**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu_password
SMTP_FROM=CitaPlanner <noreply@citaplanner.com>
```

### Paso 4: Generar Secrets Seguros

En tu terminal local o en el servidor:

```bash
# Generar NEXTAUTH_SECRET
openssl rand -base64 32

# Generar JWT_SECRET
openssl rand -base64 32

# Generar POSTGRES_PASSWORD (opcional, puedes usar tu propia contraseña)
openssl rand -base64 24
```

**Ejemplo de salida:**
```
Kx8fJ2mN9pQ3rT5vW7yZ1aB4cD6eF8gH0iJ2kL4mN6oP8qR0sT2uV4wX6yZ8
```

### Paso 5: Configurar Docker Compose en Easypanel

#### 5.1 Crear Nuevo Servicio

1. En Easypanel, ve a **"Services"** → **"Add Service"**
2. Selecciona **"Docker Compose"**
3. Pega el contenido de `docker-compose.easypanel.yml`

#### 5.2 Configurar Volúmenes Persistentes

En la sección de **"Volumes"** o **"Almacenamiento"**:

1. **Nombre del volumen**: `postgres-data`
2. **Ruta en el contenedor**: `/var/lib/postgresql/data`
3. **Ruta en el host**: `/home/usuario/citaplanner/data/postgres`
4. **Tipo**: `bind` (montaje directo)

### Paso 6: Deploy Inicial

```bash
# En el servidor, dentro del directorio del proyecto
docker-compose -f docker-compose.easypanel.yml up -d

# Ver logs en tiempo real
docker-compose -f docker-compose.easypanel.yml logs -f

# Verificar que los contenedores estén corriendo
docker-compose -f docker-compose.easypanel.yml ps
```

**Salida esperada:**
```
NAME                  STATUS              PORTS
citaplanner-db        Up 30 seconds       0.0.0.0:5432->5432/tcp
citaplanner-app       Up 25 seconds       0.0.0.0:3000->3000/tcp
```

### Paso 7: Verificar la Instalación

#### 7.1 Verificar PostgreSQL

```bash
# Conectarse a PostgreSQL
docker exec -it citaplanner-db psql -U postgres -d citaplanner

# Dentro de psql, ejecutar:
\dt  # Listar tablas
\l   # Listar bases de datos
\q   # Salir
```

#### 7.2 Verificar la Aplicación

```bash
# Ver logs de la aplicación
docker logs citaplanner-app --tail 50

# Buscar mensajes de éxito
docker logs citaplanner-app 2>&1 | grep -i "success\|ready\|listening"
```

#### 7.3 Probar en el Navegador

1. Abre tu navegador
2. Ve a `https://tu-dominio.com` o `http://tu-servidor-ip:3000`
3. Deberías ver la página de inicio de CitaPlanner

---

## 🔐 Variables de Entorno

### Variables Críticas (Obligatorias)

```bash
# Base de datos
DATABASE_URL=postgresql://postgres:PASSWORD@postgres:5432/citaplanner?sslmode=disable
POSTGRES_PASSWORD=tu_password_segura

# Autenticación
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=secret_generado_con_openssl
JWT_SECRET=otro_secret_generado_con_openssl

# Entorno
NODE_ENV=production
PORT=3000
```

### Formato de DATABASE_URL

```
postgresql://[usuario]:[contraseña]@[host]:[puerto]/[database]?[opciones]
```

**Componentes:**
- `usuario`: `postgres` (por defecto)
- `contraseña`: La que configuraste en `POSTGRES_PASSWORD`
- `host`: `postgres` (nombre del servicio en Docker Compose)
- `puerto`: `5432` (puerto estándar de PostgreSQL)
- `database`: `citaplanner` (nombre de la base de datos)
- `opciones`: `sslmode=disable` (SSL deshabilitado para conexión local)

**Ejemplo completo:**
```
postgresql://postgres:MiPassword123@postgres:5432/citaplanner?sslmode=disable
```

### Validar Variables de Entorno

```bash
# Ver variables de entorno del contenedor
docker exec citaplanner-app env | grep -E "DATABASE_URL|NEXTAUTH|JWT"

# Verificar conexión a la base de datos
docker exec citaplanner-app node -e "console.log(process.env.DATABASE_URL)"
```

---

## 💾 Almacenamiento Persistente

### Estructura de Directorios

```
/home/usuario/citaplanner/
├── docker-compose.easypanel.yml
├── Dockerfile
├── app/
│   └── ... (código de la aplicación)
└── data/
    └── postgres/              # ← Datos persistentes de PostgreSQL
        ├── pgdata/
        │   ├── base/
        │   ├── global/
        │   ├── pg_wal/
        │   └── ...
        └── ...
```

### Verificar Almacenamiento

```bash
# Ver tamaño del directorio de datos
du -sh ./data/postgres

# Ver archivos dentro
ls -lah ./data/postgres/pgdata/

# Verificar espacio disponible en disco
df -h
```

### Permisos Correctos

```bash
# PostgreSQL en Docker usa UID 999
sudo chown -R 999:999 ./data/postgres
sudo chmod -R 700 ./data/postgres

# Verificar
ls -la ./data/
```

### Montar Volumen en Docker Compose

En `docker-compose.easypanel.yml`:

```yaml
services:
  postgres:
    volumes:
      # Ruta relativa (recomendado)
      - ./data/postgres:/var/lib/postgresql/data
      
      # O ruta absoluta
      # - /home/usuario/citaplanner/data/postgres:/var/lib/postgresql/data
```

---

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
# Ver estado de los contenedores
docker-compose ps

# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Reiniciar servicios
docker-compose restart

# Ver logs
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f app
docker-compose logs -f postgres

# Reconstruir y reiniciar
docker-compose up -d --build
```

### Gestión de PostgreSQL

```bash
# Conectarse a PostgreSQL
docker exec -it citaplanner-db psql -U postgres -d citaplanner

# Ejecutar comando SQL directo
docker exec citaplanner-db psql -U postgres -d citaplanner -c "SELECT COUNT(*) FROM users;"

# Ver bases de datos
docker exec citaplanner-db psql -U postgres -c "\l"

# Ver tablas
docker exec citaplanner-db psql -U postgres -d citaplanner -c "\dt"

# Ver tamaño de la base de datos
docker exec citaplanner-db psql -U postgres -d citaplanner -c "SELECT pg_size_pretty(pg_database_size('citaplanner'));"

# Ver conexiones activas
docker exec citaplanner-db psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

### Migraciones de Prisma

```bash
# Ejecutar migraciones
docker exec citaplanner-app npx prisma migrate deploy

# Ver estado de migraciones
docker exec citaplanner-app npx prisma migrate status

# Generar cliente de Prisma
docker exec citaplanner-app npx prisma generate

# Abrir Prisma Studio (interfaz visual)
docker exec -it citaplanner-app npx prisma studio
```

### Monitoreo

```bash
# Ver uso de recursos
docker stats

# Ver uso de recursos de un contenedor específico
docker stats citaplanner-db

# Ver procesos dentro del contenedor
docker exec citaplanner-db ps aux

# Ver logs de PostgreSQL
docker exec citaplanner-db tail -f /var/lib/postgresql/data/pgdata/log/postgresql-*.log
```

---

## 💾 Backups y Restauración

### Backup Manual

#### Backup Completo de la Base de Datos

```bash
# Crear backup
docker exec citaplanner-db pg_dump -U postgres citaplanner > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup comprimido
docker exec citaplanner-db pg_dump -U postgres citaplanner | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Backup en formato custom (más rápido para restaurar)
docker exec citaplanner-db pg_dump -U postgres -Fc citaplanner > backup_$(date +%Y%m%d_%H%M%S).dump
```

#### Backup de Tablas Específicas

```bash
# Backup de una tabla
docker exec citaplanner-db pg_dump -U postgres -t users citaplanner > backup_users.sql

# Backup de múltiples tablas
docker exec citaplanner-db pg_dump -U postgres -t users -t appointments citaplanner > backup_tables.sql
```

#### Backup del Directorio de Datos

```bash
# Detener PostgreSQL primero
docker-compose stop postgres

# Crear backup del directorio
tar -czf backup_postgres_data_$(date +%Y%m%d).tar.gz ./data/postgres

# Reiniciar PostgreSQL
docker-compose start postgres
```

### Restauración

#### Restaurar desde SQL

```bash
# Restaurar backup SQL
docker exec -i citaplanner-db psql -U postgres citaplanner < backup_20241001_120000.sql

# Restaurar backup comprimido
gunzip -c backup_20241001_120000.sql.gz | docker exec -i citaplanner-db psql -U postgres citaplanner
```

#### Restaurar desde Dump Custom

```bash
# Restaurar backup en formato custom
docker exec -i citaplanner-db pg_restore -U postgres -d citaplanner < backup_20241001_120000.dump

# Restaurar con opciones
docker exec -i citaplanner-db pg_restore -U postgres -d citaplanner --clean --if-exists < backup.dump
```

#### Restaurar Directorio de Datos

```bash
# Detener servicios
docker-compose down

# Eliminar datos actuales
sudo rm -rf ./data/postgres/*

# Extraer backup
tar -xzf backup_postgres_data_20241001.tar.gz

# Restaurar permisos
sudo chown -R 999:999 ./data/postgres
sudo chmod -R 700 ./data/postgres

# Iniciar servicios
docker-compose up -d
```

### Automatizar Backups

#### Script de Backup Automático

Crear archivo `backup.sh`:

```bash
#!/bin/bash

# Configuración
BACKUP_DIR="/home/usuario/backups"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio de backups
mkdir -p $BACKUP_DIR

# Crear backup
docker exec citaplanner-db pg_dump -U postgres -Fc citaplanner > $BACKUP_DIR/backup_$DATE.dump

# Comprimir
gzip $BACKUP_DIR/backup_$DATE.dump

# Eliminar backups antiguos
find $BACKUP_DIR -name "backup_*.dump.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completado: backup_$DATE.dump.gz"
```

#### Configurar Cron

```bash
# Hacer el script ejecutable
chmod +x backup.sh

# Editar crontab
crontab -e

# Agregar línea para backup diario a las 2 AM
0 2 * * * /home/usuario/citaplanner/backup.sh >> /home/usuario/citaplanner/backup.log 2>&1
```

---

## 🔍 Troubleshooting

### Problema: PostgreSQL no inicia

**Síntomas:**
```
citaplanner-db exited with code 1
```

**Soluciones:**

1. **Verificar permisos:**
```bash
ls -la ./data/postgres
# Debe mostrar: drwx------ 2 999 999
sudo chown -R 999:999 ./data/postgres
sudo chmod -R 700 ./data/postgres
```

2. **Verificar logs:**
```bash
docker logs citaplanner-db
```

3. **Limpiar datos corruptos:**
```bash
docker-compose down
sudo rm -rf ./data/postgres/*
docker-compose up -d
```

### Problema: Error de conexión a la base de datos

**Síntomas:**
```
Error: P1001: Can't reach database server
```

**Soluciones:**

1. **Verificar que PostgreSQL esté corriendo:**
```bash
docker ps | grep postgres
```

2. **Verificar DATABASE_URL:**
```bash
docker exec citaplanner-app env | grep DATABASE_URL
```

3. **Probar conexión manualmente:**
```bash
docker exec citaplanner-app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$connect().then(() => console.log('✅ Conectado')).catch(e => console.error('❌ Error:', e));
"
```

4. **Verificar red de Docker:**
```bash
docker network ls
docker network inspect citaplanner-network
```

### Problema: Migraciones fallan

**Síntomas:**
```
Error: Migration failed to apply
```

**Soluciones:**

1. **Ver estado de migraciones:**
```bash
docker exec citaplanner-app npx prisma migrate status
```

2. **Resetear migraciones (⚠️ ELIMINA DATOS):**
```bash
docker exec citaplanner-app npx prisma migrate reset
```

3. **Aplicar migraciones manualmente:**
```bash
docker exec citaplanner-app npx prisma migrate deploy
```

### Problema: Espacio en disco lleno

**Síntomas:**
```
ERROR: could not extend file: No space left on device
```

**Soluciones:**

1. **Verificar espacio:**
```bash
df -h
du -sh ./data/postgres
```

2. **Limpiar logs de Docker:**
```bash
docker system prune -a
```

3. **Limpiar logs de PostgreSQL:**
```bash
docker exec citaplanner-db find /var/lib/postgresql/data/pgdata/log -name "*.log" -mtime +7 -delete
```

### Problema: Contraseña incorrecta

**Síntomas:**
```
FATAL: password authentication failed for user "postgres"
```

**Soluciones:**

1. **Verificar POSTGRES_PASSWORD:**
```bash
docker exec citaplanner-db env | grep POSTGRES_PASSWORD
```

2. **Verificar DATABASE_URL:**
```bash
docker exec citaplanner-app env | grep DATABASE_URL
```

3. **Recrear contenedor con nueva contraseña:**
```bash
docker-compose down
sudo rm -rf ./data/postgres/*
# Actualizar POSTGRES_PASSWORD en variables de entorno
docker-compose up -d
```

### Problema: Puerto 5432 ya en uso

**Síntomas:**
```
Error: bind: address already in use
```

**Soluciones:**

1. **Ver qué está usando el puerto:**
```bash
sudo lsof -i :5432
sudo netstat -tulpn | grep 5432
```

2. **Detener PostgreSQL local:**
```bash
sudo systemctl stop postgresql
```

3. **Cambiar puerto en docker-compose.yml:**
```yaml
ports:
  - "5433:5432"  # Usar puerto diferente
```

---

## 🔒 Seguridad

### Mejores Prácticas

#### 1. Contraseñas Seguras

```bash
# Generar contraseña segura
openssl rand -base64 32

# Usar contraseñas diferentes para cada entorno
# Desarrollo: password_dev_123
# Producción: [contraseña generada aleatoriamente]
```

#### 2. No Exponer Puerto de PostgreSQL

En `docker-compose.easypanel.yml`, **eliminar** la sección de ports si no necesitas acceso externo:

```yaml
postgres:
  # ports:
  #   - "5432:5432"  # ← Comentar o eliminar en producción
```

#### 3. Usar Secrets de Docker

```bash
# Crear secret
echo "mi_password_segura" | docker secret create postgres_password -

# Usar en docker-compose.yml
services:
  postgres:
    secrets:
      - postgres_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password

secrets:
  postgres_password:
    external: true
```

#### 4. Configurar Firewall

```bash
# Permitir solo tráfico necesario
sudo ufw allow 3000/tcp  # Aplicación
sudo ufw deny 5432/tcp   # PostgreSQL (solo interno)
sudo ufw enable
```

#### 5. SSL/TLS para la Aplicación

```bash
# Usar Nginx como proxy reverso con Let's Encrypt
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

#### 6. Backups Encriptados

```bash
# Backup encriptado
docker exec citaplanner-db pg_dump -U postgres citaplanner | \
  gpg --symmetric --cipher-algo AES256 > backup_encrypted.sql.gpg

# Restaurar
gpg --decrypt backup_encrypted.sql.gpg | \
  docker exec -i citaplanner-db psql -U postgres citaplanner
```

#### 7. Limitar Conexiones

En PostgreSQL, configurar `max_connections`:

```bash
docker exec citaplanner-db psql -U postgres -c "ALTER SYSTEM SET max_connections = 100;"
docker-compose restart postgres
```

#### 8. Monitoreo de Seguridad

```bash
# Ver intentos de conexión fallidos
docker exec citaplanner-db psql -U postgres -c "
SELECT * FROM pg_stat_database WHERE datname = 'citaplanner';
"

# Ver usuarios conectados
docker exec citaplanner-db psql -U postgres -c "
SELECT usename, application_name, client_addr, state 
FROM pg_stat_activity 
WHERE datname = 'citaplanner';
"
```

### Checklist de Seguridad

- [ ] Contraseñas seguras generadas con `openssl rand -base64 32`
- [ ] Puerto 5432 no expuesto públicamente
- [ ] Firewall configurado correctamente
- [ ] SSL/TLS habilitado para la aplicación
- [ ] Backups automáticos configurados
- [ ] Backups encriptados
- [ ] Variables de entorno no expuestas en logs
- [ ] Actualizaciones de seguridad aplicadas regularmente
- [ ] Monitoreo de logs activo
- [ ] Acceso SSH con clave pública (no contraseña)

---

## 📚 Recursos Adicionales

### Documentación Oficial

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Easypanel Documentation](https://easypanel.io/docs)

### Herramientas Útiles

- **pgAdmin**: Interfaz gráfica para PostgreSQL
- **DBeaver**: Cliente universal de bases de datos
- **Portainer**: Gestión visual de Docker
- **Grafana**: Monitoreo y visualización
- **Prometheus**: Métricas y alertas

### Comandos de Referencia Rápida

```bash
# Ver todos los contenedores
docker ps -a

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar todo
docker-compose restart

# Backup rápido
docker exec citaplanner-db pg_dump -U postgres citaplanner > backup.sql

# Restaurar rápido
docker exec -i citaplanner-db psql -U postgres citaplanner < backup.sql

# Ver espacio usado
du -sh ./data/postgres

# Limpiar Docker
docker system prune -a
```

---

## 🎉 Conclusión

Has configurado exitosamente CitaPlanner con PostgreSQL local en Easypanel. Ahora tienes:

✅ Base de datos PostgreSQL con almacenamiento persistente  
✅ Aplicación Next.js conectada a la base de datos  
✅ Variables de entorno configuradas correctamente  
✅ Sistema de backups documentado  
✅ Guía de troubleshooting completa  

### Próximos Pasos

1. **Configurar backups automáticos** usando el script proporcionado
2. **Configurar SSL/TLS** para tu dominio
3. **Monitorear recursos** del servidor regularmente
4. **Probar la aplicación** completamente
5. **Documentar** cualquier configuración adicional específica de tu caso

### Soporte

Si encuentras problemas:

1. Revisa la sección de [Troubleshooting](#troubleshooting)
2. Verifica los logs: `docker-compose logs -f`
3. Consulta la documentación oficial de cada herramienta
4. Abre un issue en el repositorio de GitHub

---

**¡Feliz deployment! 🚀**
