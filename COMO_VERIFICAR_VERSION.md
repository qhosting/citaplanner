
# Cómo Verificar la Versión de CitaPlanner

Este documento explica cómo verificar qué versión de CitaPlanner está desplegada y corriendo en tu entorno.

## 📋 Tabla de Contenidos

1. [Ver la Versión en la Interfaz de Usuario](#ver-la-versión-en-la-interfaz-de-usuario)
2. [Consultar el Endpoint de Versión](#consultar-el-endpoint-de-versión)
3. [Verificar la Versión en Easypanel](#verificar-la-versión-en-easypanel)
4. [Desplegar una Versión Específica](#desplegar-una-versión-específica)

---

## 🖥️ Ver la Versión en la Interfaz de Usuario

La forma más sencilla de verificar la versión es directamente en la aplicación:

1. **Accede a CitaPlanner** en tu navegador
2. **Busca en la esquina inferior derecha** de la pantalla
3. Verás un pequeño badge con el número de versión: `v1.3.0`
4. **Haz clic en el badge** para ver información detallada:
   - Versión de la aplicación
   - Fecha y hora del build
   - Hash del commit de Git
   - Entorno (production/development)

### Ejemplo Visual

```
┌─────────────────────────────────────┐
│                                     │
│     CitaPlanner Dashboard           │
│                                     │
│                                     │
│                                     │
│                              v1.3.0 │ ← Haz clic aquí
└─────────────────────────────────────┘
```

---

## 🔌 Consultar el Endpoint de Versión

Puedes consultar la versión programáticamente usando el endpoint API:

### Usando cURL

```bash
curl https://tu-dominio.com/api/version
```

### Usando el Navegador

Simplemente visita:
```
https://tu-dominio.com/api/version
```

### Respuesta Esperada

```json
{
  "success": true,
  "data": {
    "version": "1.3.0",
    "buildDate": "2025-10-09T04:45:00Z",
    "commit": "9329d76",
    "environment": "production"
  }
}
```

### Campos de la Respuesta

- **version**: Versión semántica de la aplicación (del package.json)
- **buildDate**: Fecha y hora en que se construyó la imagen Docker
- **commit**: Hash corto del commit de Git usado en el build
- **environment**: Entorno de ejecución (production/development)

---

## 🚀 Verificar la Versión en Easypanel

Para verificar qué versión está desplegada en Easypanel:

### Método 1: Variables de Entorno

1. Accede a tu panel de Easypanel
2. Ve a tu aplicación CitaPlanner
3. Navega a la sección **"Environment"** o **"Variables de Entorno"**
4. Busca las siguientes variables:
   - `APP_VERSION`: Versión de la aplicación
   - `GIT_COMMIT_SHA`: Hash del commit
   - `BUILD_DATE`: Fecha del build

### Método 2: Logs de Deployment

1. En Easypanel, ve a la sección **"Deployments"** o **"Despliegues"**
2. Revisa el log del último deployment exitoso
3. Busca líneas como:
   ```
   🔧 Generando información de versión...
      ✓ Git disponible - SHA: 9329d76
      - Versión: 1.3.0
      - Commit SHA: 9329d76
      - Fecha de build: 2025-10-09T04:45:00Z
   ```

### Método 3: Inspeccionar el Contenedor

Si tienes acceso SSH al servidor:

```bash
# Ver las variables de entorno del contenedor
docker exec <container-id> env | grep -E "APP_VERSION|GIT_COMMIT|BUILD_DATE"

# Ver el package.json
docker exec <container-id> cat /app/package.json | grep version
```

---

## 📦 Desplegar una Versión Específica

### Opción 1: Desplegar desde un Tag de Git

Para desplegar una versión específica usando tags de Git:

1. **En Easypanel**, ve a la configuración de tu aplicación
2. En la sección **"Source"** o **"Fuente"**:
   - **Repository**: `qhosting/citaplanner`
   - **Branch**: Cambia de `main` a `refs/tags/v1.3.0`
   - O usa el formato: `tags/v1.3.0`

3. **Guarda los cambios** y haz clic en **"Deploy"**

### Opción 2: Desplegar desde una Rama Específica

```
Branch: main          → Última versión en desarrollo
Branch: v1.3.0        → Rama de release (si existe)
Tag: v1.3.0          → Versión estable específica
```

### Opción 3: Desplegar Manualmente con Docker

Si prefieres construir y desplegar manualmente:

```bash
# 1. Clonar el repositorio en la versión específica
git clone --branch v1.3.0 https://github.com/qhosting/citaplanner.git
cd citaplanner

# 2. Construir la imagen Docker
docker build -t citaplanner:1.3.0 -f Dockerfile .

# 3. Ejecutar el contenedor
docker run -d \
  --name citaplanner \
  -p 3000:3000 \
  --env-file .env.production \
  citaplanner:1.3.0
```

---

## 🏷️ Versiones Disponibles

Para ver todas las versiones disponibles:

### En GitHub

1. Ve a: https://github.com/qhosting/citaplanner/releases
2. Verás todas las versiones publicadas con sus notas de cambio

### Usando Git

```bash
# Listar todos los tags
git tag -l

# Ver información de un tag específico
git show v1.3.0

# Ver el changelog entre versiones
git log v1.2.0..v1.3.0 --oneline
```

---

## 🔍 Troubleshooting

### El badge de versión no aparece

1. Verifica que el componente `VersionDisplay` esté importado en el layout principal
2. Revisa la consola del navegador para errores
3. Verifica que el endpoint `/api/version` responda correctamente

### El endpoint retorna "unknown" en commit o buildDate

Esto puede ocurrir si:
- El build se hizo sin Git disponible
- Las variables de entorno no se configuraron correctamente
- El script `generate-version.sh` no se ejecutó durante el build

**Solución**: Asegúrate de que el prebuild script esté configurado en package.json:
```json
"scripts": {
  "prebuild": "sh scripts/generate-version.sh",
  "build": "next build"
}
```

### La versión en la UI no coincide con el tag de Git

Esto puede indicar que:
- El deployment no se hizo desde el tag correcto
- El package.json no se actualizó con la versión correcta
- Hay un caché de build antiguo

**Solución**: 
1. Verifica que estás desplegando desde el tag correcto
2. Limpia el caché de build en Easypanel
3. Fuerza un nuevo deployment

---

## 📚 Recursos Adicionales

- **Documentación del Checkpoint v1.3.0**: Ver `CHECKPOINT_v1.3.0.md`
- **Guía de Deployment**: Ver `DEPLOYMENT.md`
- **Changelog**: Ver `CHANGELOG.md`
- **Releases en GitHub**: https://github.com/qhosting/citaplanner/releases

---

## 💡 Mejores Prácticas

1. **Siempre verifica la versión** después de un deployment
2. **Usa tags de Git** para deployments de producción
3. **Documenta los cambios** en cada versión
4. **Mantén sincronizados** el package.json y los tags de Git
5. **Prueba en staging** antes de desplegar a producción

---

**Última actualización**: 9 de octubre de 2025  
**Versión del documento**: 1.0  
**Mantenido por**: Equipo CitaPlanner
