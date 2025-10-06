# Guía de Conectividad de Base de Datos en Easypanel

## 🎯 Resumen del Problema

Cuando se despliega CitaPlanner en Easypanel con PostgreSQL, la aplicación puede fallar al conectarse a la base de datos debido a un **hostname incorrecto** en la variable de entorno `DATABASE_URL`.

## 🔍 Diagnóstico del Problema

### Síntomas
- La aplicación se reinicia continuamente
- Los logs muestran 30 intentos fallidos de conexión a PostgreSQL
- El mensaje de error indica: "No se pudo conectar a PostgreSQL después de 30 intentos"

### Causa Raíz
El hostname en `DATABASE_URL` no coincide con el nombre real del servicio PostgreSQL en Easypanel.

**Ejemplo de configuración incorrecta:**
```
DATABASE_URL=postgres://postgres:password@cloudmx_citaplanner-db:5432/citaplanner-db
                                         ^^^^^^^^^^^^^^^^^^^^^^
                                         Este hostname puede ser incorrecto
```

## 🏗️ Arquitectura de Red en Easypanel

### Cómo Funciona Docker Networking en Easypanel

Easypanel utiliza Docker y Docker Compose para gestionar servicios. Los contenedores se comunican entre sí usando **nombres de servicio** como hostnames, gracias al DNS interno de Docker.

**Principios clave:**
1. **Cada servicio tiene un nombre único** definido en Easypanel
2. **Los servicios se resuelven por su nombre** dentro de la misma red Docker
3. **NO se usan prefijos de proyecto** en el hostname para comunicación interna
4. **El puerto interno** (5432 para PostgreSQL) se usa para comunicación entre contenedores

### Ejemplo de Configuración Correcta

Si tu servicio PostgreSQL en Easypanel se llama `citaplanner-db`, entonces:

```bash
# ✅ CORRECTO - Usa el nombre del servicio directamente
DATABASE_URL=postgres://postgres:password@citaplanner-db:5432/citaplanner-db

# ❌ INCORRECTO - No uses prefijos del proyecto
DATABASE_URL=postgres://postgres:password@cloudmx_citaplanner-db:5432/citaplanner-db
```

## 🛠️ Solución Implementada

### Diagnósticos Automáticos en el Entrypoint

El script `docker-entrypoint.sh` ahora incluye diagnósticos avanzados que:

1. **Verifica resolución DNS** del hostname configurado
2. **Prueba conectividad de red** con ping
3. **Verifica el puerto TCP** (5432) está abierto
4. **Intenta variantes del hostname** automáticamente:
   - Hostname original (ej: `cloudmx_citaplanner-db`)
   - Sin prefijo (ej: `citaplanner-db`)
   - Solo nombre del servicio (ej: `citaplanner-db`)

### Recuperación Automática

Si el hostname original falla pero una variante funciona, el script:
- ✅ Detecta automáticamente el hostname correcto
- ✅ Actualiza `DATABASE_URL` en tiempo de ejecución
- ✅ Continúa con el despliegue exitosamente
- ✅ Registra el hostname correcto en los logs

## 📋 Cómo Identificar el Nombre Correcto del Servicio

### Opción 1: Panel de Easypanel
1. Ve a tu proyecto en Easypanel
2. Busca el servicio PostgreSQL
3. El **nombre del servicio** es lo que debes usar como hostname

### Opción 2: Revisar los Logs
Después de desplegar con el nuevo entrypoint, los logs mostrarán:

```
[2025-10-06 06:09:16] 🔍 DIAGNÓSTICO DE CONECTIVIDAD DE RED
[2025-10-06 06:09:16] 1️⃣  Verificando resolución DNS para: cloudmx_citaplanner-db
[2025-10-06 06:09:16] ❌ No se pudo resolver DNS para: cloudmx_citaplanner-db
[2025-10-06 06:09:16] 4️⃣  Probando variantes del hostname...
[2025-10-06 06:09:16]    Variante sin prefijo: citaplanner-db
[2025-10-06 06:09:16] ✅ Conexión exitosa usando hostname: citaplanner-db
[2025-10-06 06:09:16] ⚠️  El hostname original 'cloudmx_citaplanner-db' no funcionó
[2025-10-06 06:09:16] ✅ Usando hostname alternativo: citaplanner-db
[2025-10-06 06:09:16] 📝 DATABASE_URL actualizada para usar: citaplanner-db
```

## 🔧 Cómo Corregir la Configuración

### Paso 1: Identificar el Nombre del Servicio
Revisa los logs del despliegue para ver qué hostname funcionó.

### Paso 2: Actualizar DATABASE_URL en Easypanel
1. Ve a tu servicio de aplicación en Easypanel
2. Navega a la sección de **Variables de Entorno**
3. Edita `DATABASE_URL` con el hostname correcto
4. Guarda los cambios

**Formato correcto:**
```
postgres://[usuario]:[contraseña]@[nombre-del-servicio]:5432/[nombre-db]
```

**Ejemplo real:**
```
postgres://postgres:674a351a07db86883d92@citaplanner-db:5432/citaplanner-db
```

### Paso 3: Redesplegar
Después de actualizar `DATABASE_URL`, redespliega la aplicación para que use la configuración correcta desde el inicio.

## 🎓 Nombres de Servicio Comunes en Easypanel

Dependiendo de cómo nombraste tu servicio PostgreSQL, el hostname podría ser:

- `citaplanner-db` (recomendado)
- `postgres`
- `citaplanner-postgres`
- `db`

**Regla general:** Usa el nombre exacto que le diste al servicio PostgreSQL en Easypanel, sin prefijos de proyecto.

## 🚨 Troubleshooting

### El script encuentra el hostname correcto pero sigue fallando

**Posibles causas:**
1. **PostgreSQL no está listo:** Espera unos segundos más
2. **Credenciales incorrectas:** Verifica usuario/contraseña
3. **Base de datos no existe:** Crea la base de datos manualmente
4. **Problema de permisos:** Verifica que el usuario tenga acceso

### Los logs muestran "DNS resuelto" pero la conexión falla

Esto indica que el hostname se resuelve pero PostgreSQL no está aceptando conexiones:
- Verifica que PostgreSQL esté ejecutándose
- Revisa los logs del servicio PostgreSQL
- Confirma que el puerto 5432 esté configurado correctamente

### Ninguna variante de hostname funciona

Si todas las variantes fallan:
1. Verifica que ambos servicios estén en el **mismo proyecto** de Easypanel
2. Confirma que PostgreSQL esté **ejecutándose** (estado: running)
3. Revisa la configuración de red en Easypanel
4. Intenta conectarte manualmente desde el terminal del contenedor

## 📚 Referencias

- [Documentación de Easypanel](https://easypanel.io/docs)
- [Docker Networking](https://docs.docker.com/engine/network/)
- [Easypanel Services](https://easypanel.io/docs/services)
- [PostgreSQL en Easypanel](https://easypanel.io/docs/services/postgres)

## ✅ Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] El servicio PostgreSQL está ejecutándose en Easypanel
- [ ] Ambos servicios (app y PostgreSQL) están en el mismo proyecto
- [ ] El hostname en DATABASE_URL coincide con el nombre del servicio
- [ ] Las credenciales (usuario/contraseña) son correctas
- [ ] El nombre de la base de datos existe
- [ ] Los logs muestran los diagnósticos de conectividad
- [ ] Has esperado al menos 60 segundos para que PostgreSQL esté listo

## 🎉 Resultado Esperado

Después de aplicar esta solución, deberías ver en los logs:

```
[2025-10-06 06:09:16] ════════════════════════════════════════════════════════════════
[2025-10-06 06:09:16] ✅ CONEXIÓN A POSTGRESQL ESTABLECIDA
[2025-10-06 06:09:16] ════════════════════════════════════════════════════════════════
[2025-10-06 06:09:16] ✅ Migraciones aplicadas correctamente
[2025-10-06 06:09:16] ✅ Cliente Prisma generado correctamente
[2025-10-06 06:09:16] 🎯 Iniciando servidor Next.js standalone
```

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0  
**Autor:** CitaPlanner Team
