
# Automatización de Easypanel para CitaPlanner

Esta guía explica cómo usar el sistema de automatización completo para desplegar CitaPlanner en Easypanel.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración Inicial](#configuración-inicial)
3. [Uso del Script de Automatización](#uso-del-script-de-automatización)
4. [Configuración Manual (Alternativa)](#configuración-manual-alternativa)
5. [Despliegue de la Aplicación](#despliegue-de-la-aplicación)
6. [Troubleshooting](#troubleshooting)
7. [Seguridad](#seguridad)

## 🔧 Requisitos Previos

Antes de comenzar, asegúrate de tener:

1. **Cuenta en Easypanel**
   - Acceso a tu servidor Easypanel
   - URL del servidor (ej: `https://adm.whatscloud.site`)

2. **Token de API de Easypanel**
   - Ve a Settings > Users en Easypanel
   - Haz clic en "Generate API Key"
   - Copia el token generado

3. **Node.js instalado** (v18 o superior)
   - Para ejecutar los scripts de automatización

4. **Repositorio de GitHub**
   - Fork o acceso al repositorio `qhosting/citaplanner`

## ⚙️ Configuración Inicial

### 1. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con tus credenciales de Easypanel:

```bash
# Credenciales de Easypanel
EASYPANEL_URL="https://adm.whatscloud.site"
EASYPANEL_TOKEN="tu-token-de-api-aqui"
```

**⚠️ IMPORTANTE:** Nunca compartas este archivo ni lo subas al repositorio.

### 2. Instalar Dependencias

```bash
npm install
```

## 🚀 Uso del Script de Automatización

El script `setup-easypanel.js` automatiza completamente el proceso de configuración.

### Ejecución Básica

```bash
node scripts/setup-easypanel.js
```

Este comando:
1. ✅ Verifica la conexión con Easypanel
2. ✅ Crea o verifica el proyecto "CitaPlanner"
3. ✅ Crea un servicio PostgreSQL con credenciales seguras
4. ✅ Genera el archivo `.env` con todas las variables necesarias
5. ✅ Configura las variables de entorno en Easypanel (si la app existe)
6. ✅ Valida la configuración completa

### Opciones Avanzadas

#### Modo Dry Run (Simulación)

Para ver qué haría el script sin hacer cambios reales:

```bash
node scripts/setup-easypanel.js --dry-run
```

#### Omitir Creación de PostgreSQL

Si ya tienes una base de datos configurada:

```bash
node scripts/setup-easypanel.js --skip-postgres
```

#### Personalizar Nombres

```bash
node scripts/setup-easypanel.js \
  --project-name="MiProyecto" \
  --service-name="mi-app" \
  --db-service-name="mi-db"
```

### Salida del Script

El script mostrará un resumen completo al finalizar:

```
=======================================================================
CONFIGURACIÓN COMPLETADA
=======================================================================

📊 Credenciales de PostgreSQL:
   Host:     citaplanner-db
   Puerto:   5432
   Base de datos: citaplanner
   Usuario:  citaplanner
   Password: [generado automáticamente]

📝 Próximos pasos:
   1. Revisa el archivo .env generado
   2. Configura el servicio de la aplicación en Easypanel
   3. Conecta el repositorio de GitHub
   4. Configura las variables de entorno en Easypanel
   5. Despliega la aplicación

⚠️  Importante:
   - Guarda las credenciales de la base de datos en un lugar seguro
   - No compartas el archivo .env en el repositorio
   - Configura las variables de email y SMS cuando estés listo
```

## 🔨 Configuración Manual (Alternativa)

Si prefieres configurar manualmente o el script automático falla:

### 1. Crear Proyecto en Easypanel

1. Accede a tu panel de Easypanel
2. Haz clic en "New Project"
3. Nombre: `CitaPlanner`

### 2. Crear Servicio PostgreSQL

1. En el proyecto, haz clic en "New Service"
2. Selecciona "Postgres"
3. Configuración:
   - **Service Name:** `citaplanner-db`
   - **Image:** `postgres:16-alpine`
   - **Environment Variables:**
     ```
     POSTGRES_USER=citaplanner
     POSTGRES_PASSWORD=[genera un password seguro]
     POSTGRES_DB=citaplanner
     ```
4. Haz clic en "Deploy"

### 3. Generar Archivo .env

Usa el script generador:

```bash
node scripts/generate-env.js \
  --db-host=citaplanner-db \
  --db-pass=[password de postgres] \
  --app-url=https://citaplanner.com
```

O copia `.env.example` y edita manualmente:

```bash
cp .env.example .env
# Edita .env con tus valores
```

### 4. Crear Servicio de Aplicación

1. En el proyecto, haz clic en "New Service"
2. Selecciona "App"
3. Configuración:
   - **Service Name:** `citaplanner-app`
   - **Source:** GitHub
   - **Repository:** `qhosting/citaplanner`
   - **Branch:** `main`
   - **Build Method:** Nixpacks
   - **Port:** 3000

4. En la pestaña "Environment", pega el contenido de tu archivo `.env`

5. En la pestaña "Domains", configura:
   - **Domain:** `citaplanner.com`
   - **HTTPS:** Enabled
   - **Port:** 3000

6. Haz clic en "Deploy"

## 🌐 Despliegue de la Aplicación

### Verificar Estado de los Servicios

1. Ve a tu proyecto en Easypanel
2. Verifica que ambos servicios estén "Running":
   - ✅ `citaplanner-db` (PostgreSQL)
   - ✅ `citaplanner-app` (Aplicación)

### Ejecutar Migraciones de Base de Datos

Las migraciones se ejecutan automáticamente al iniciar la aplicación gracias al script `docker-entrypoint.sh`.

Si necesitas ejecutarlas manualmente:

1. Abre la terminal del servicio `citaplanner-app` en Easypanel
2. Ejecuta:
   ```bash
   npx prisma migrate deploy
   ```

### Verificar Despliegue

1. Accede a tu dominio: `https://citaplanner.com`
2. Deberías ver la página de inicio de CitaPlanner
3. Prueba el acceso al panel master: `https://citaplanner.com/admin/master`

## 🔍 Troubleshooting

### Error: "Cannot connect to Easypanel"

**Causa:** Token de API inválido o URL incorrecta

**Solución:**
1. Verifica que `EASYPANEL_URL` sea correcta
2. Regenera el token de API en Easypanel
3. Asegúrate de que el token esté correctamente configurado

### Error: "Project already exists"

**Causa:** El proyecto ya fue creado previamente

**Solución:**
- El script detectará el proyecto existente y continuará
- Si quieres empezar de cero, elimina el proyecto en Easypanel primero

### Error: "Service already exists"

**Causa:** El servicio PostgreSQL ya existe

**Solución:**
- Usa `--skip-postgres` para omitir la creación
- O elimina el servicio existente en Easypanel

### Error: "Cannot connect to database"

**Causa:** Credenciales incorrectas o servicio no iniciado

**Solución:**
1. Verifica que el servicio PostgreSQL esté "Running"
2. Revisa las credenciales en el archivo `.env`
3. Asegúrate de que `DATABASE_URL` use el nombre correcto del servicio

### La aplicación no inicia

**Causa:** Variables de entorno faltantes o incorrectas

**Solución:**
1. Verifica que todas las variables requeridas estén configuradas
2. Revisa los logs del servicio en Easypanel
3. Asegúrate de que `NEXTAUTH_SECRET` esté configurado

### Error 502 Bad Gateway

**Causa:** La aplicación no está escuchando en el puerto correcto

**Solución:**
1. Verifica que `PORT=3000` esté configurado
2. Asegúrate de que el puerto en Easypanel coincida (3000)
3. Revisa los logs para ver si hay errores de inicio

## 🔒 Seguridad

### Mejores Prácticas

1. **Nunca compartas credenciales**
   - No subas archivos `.env` al repositorio
   - Usa `.gitignore` para excluir archivos sensibles

2. **Usa contraseñas seguras**
   - Genera passwords con al menos 32 caracteres
   - Usa el generador incluido: `node scripts/generate-env.js`

3. **Rota credenciales regularmente**
   - Cambia el token de API cada 3-6 meses
   - Actualiza passwords de base de datos periódicamente

4. **Configura SSL/HTTPS**
   - Easypanel configura Let's Encrypt automáticamente
   - Asegúrate de que HTTPS esté habilitado en todos los dominios

5. **Limita acceso al panel master**
   - Usa una contraseña fuerte para el master admin
   - Considera agregar autenticación de dos factores

### Variables Sensibles

Las siguientes variables contienen información sensible:

- `DATABASE_URL` - Credenciales de base de datos
- `NEXTAUTH_SECRET` - Secret para sesiones
- `MASTER_PASSWORD_HASH` - Hash de contraseña maestra
- `EASYPANEL_TOKEN` - Token de API

**⚠️ Nunca las compartas públicamente**

### Backup de Credenciales

1. Guarda una copia segura del archivo `.env`
2. Usa un gestor de contraseñas (1Password, Bitwarden, etc.)
3. Documenta las credenciales en un lugar seguro
4. Configura backups automáticos de la base de datos en Easypanel

## 📚 Recursos Adicionales

- [Documentación de Easypanel](https://easypanel.io/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Repositorio de CitaPlanner](https://github.com/qhosting/citaplanner)

## 🆘 Soporte

Si encuentras problemas:

1. Revisa esta documentación completa
2. Consulta los logs en Easypanel
3. Verifica la configuración en `easypanel.config.json`
4. Abre un issue en el repositorio de GitHub

---

**Última actualización:** Octubre 2025
**Versión:** 1.0.0
