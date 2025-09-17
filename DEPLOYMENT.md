
# 🚀 Guía de Despliegue - CitaPlanner MVP

## Opciones de Despliegue

### 1. Vercel (Recomendado)
Despliegue más simple para aplicaciones Next.js:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel

# Configurar variables de entorno en dashboard de Vercel
# - DATABASE_URL
# - NEXTAUTH_URL
# - NEXTAUTH_SECRET
# - OPENPAY_*
```

### 2. Railway

```bash
# Conectar a Railway
railway login
railway init
railway add postgresql

# Configurar variables de entorno
railway variables:set NEXTAUTH_URL=https://tu-app.railway.app
railway variables:set NEXTAUTH_SECRET=tu-secret

# Desplegar
railway up
```

### 3. Docker

```bash
# Build de la imagen
docker build -t citaplanner .

# Ejecutar con base de datos
docker-compose up -d
```

## Configuración de Base de Datos en Producción

### PostgreSQL (Recomendado)
```bash
# Aplicar migraciones
yarn prisma db push

# Generar cliente de producción  
yarn prisma generate
```

### Variables de Entorno Críticas
```bash
DATABASE_URL="postgresql://user:pass@host:port/db"
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="clave-super-segura-de-32-caracteres"

# OpenPay Producción
OPENPAY_MODE="production"
OPENPAY_ID="tu-merchant-id-produccion"
OPENPAY_PRIVATE_KEY="clave-privada-produccion"
```

## Lista de Verificación Pre-despliegue

- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Base de datos PostgreSQL lista
- [ ] ✅ Migraciones aplicadas
- [ ] ✅ Build exitoso (`yarn build`)
- [ ] ✅ Tests pasando
- [ ] ✅ SSL/HTTPS habilitado
- [ ] ✅ Dominio personalizado configurado
- [ ] ✅ Monitoreo configurado

## Configuración de Dominio Personalizado

### DNS Records Necesarios:
```
A     @     tu-ip-servidor
CNAME www   tu-dominio.com
```

### SSL/HTTPS:
- Usar certificados de Let's Encrypt
- Configurar redirección HTTP → HTTPS

## Monitoreo y Mantenimiento

### Logs Importantes:
```bash
# Logs de Next.js
tail -f /var/log/nextjs/app.log

# Logs de PostgreSQL
tail -f /var/log/postgresql/postgresql.log
```

### Respaldos Automatizados:
```bash
# Respaldo diario de BD
0 2 * * * pg_dump citaplanner_prod > backup-$(date +%Y%m%d).sql
```

## Solución de Problemas

### Error: Build Failed
```bash
# Limpiar caché
rm -rf .next node_modules
yarn install
yarn build
```

### Error: Database Connection
- Verificar DATABASE_URL
- Comprobar reglas de firewall
- Validar credenciales de BD

### Error: 500 Internal Server
- Revisar logs de aplicación
- Verificar variables de entorno
- Comprobar permisos de archivos

## Optimizaciones de Producción

### Performance:
- Habilitar compresión gzip
- CDN para archivos estáticos
- Caché de imágenes
- Lazy loading activado

### Seguridad:
- Headers de seguridad configurados
- Rate limiting habilitado
- Validación de entrada estricta
- Logs de auditoría activados

## Escalamiento

### Horizontal:
- Load balancer (Nginx/HAProxy)
- Múltiples instancias de la aplicación
- Base de datos con réplicas de lectura

### Vertical:
- Incrementar recursos del servidor
- Optimización de consultas de BD
- Caché Redis para sesiones

---

Para más ayuda: soporte@citaplanner.com
