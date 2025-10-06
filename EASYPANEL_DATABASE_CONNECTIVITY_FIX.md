# 🔧 Solución al Problema de Conectividad con PostgreSQL en Easypanel

## 📊 Diagnóstico del Problema

### Error Actual
```
[2025-10-06 05:43:07] ❌ No se pudo conectar a PostgreSQL después de 30 intentos
```

### Causa Raíz Identificada
El `DATABASE_URL` está usando un **nombre de host incorrecto** para conectarse a PostgreSQL en Easypanel.

**Host actual en DATABASE_URL:** `cloudmx_citaplanner-db`  
**Host correcto según Easypanel:** Depende del nombre del servicio PostgreSQL

---

## 🎯 Solución

### Paso 1: Verificar el Nombre del Servicio PostgreSQL en Easypanel

1. Accede a tu panel de Easypanel
2. Ve a tu proyecto **CitaPlanner**
3. En la sección **Services**, busca el servicio de PostgreSQL
4. Anota el **nombre exacto del servicio**

Los nombres comunes son:
- `citaplanner-postgres`
- `citaplanner-db`
- `postgres`
- O el nombre personalizado que hayas usado

### Paso 2: Actualizar la Variable de Entorno DATABASE_URL

En Easypanel, ve a la configuración de tu aplicación **citaplanner-app** y actualiza la variable `DATABASE_URL`:

#### Formato Correcto:
```bash
postgresql://postgres:[TU_PASSWORD]@[NOMBRE_DEL_SERVICIO_POSTGRES]:5432/citaplanner-db
```

#### Ejemplos según el nombre del servicio:

**Si el servicio se llama `citaplanner-postgres`:**
```bash
DATABASE_URL=postgresql://postgres:674a351a07db86883d92@citaplanner-postgres:5432/citaplanner-db
```

**Si el servicio se llama `citaplanner-db`:**
```bash
DATABASE_URL=postgresql://postgres:674a351a07db86883d92@citaplanner-db:5432/citaplanner-db
```

**Si el servicio se llama `postgres`:**
```bash
DATABASE_URL=postgresql://postgres:674a351a07db86883d92@postgres:5432/citaplanner-db
```

### Paso 3: Verificar la Configuración de Red en Easypanel

Asegúrate de que ambos servicios estén en la **misma red interna**:

1. En Easypanel, ve a **Project Settings** → **Network**
2. Verifica que tanto `citaplanner-app` como el servicio de PostgreSQL estén en la misma red
3. Si no lo están, agrégalos a la misma red

### Paso 4: Verificar que PostgreSQL esté Corriendo

1. En Easypanel, ve a **Services**
2. Verifica que el servicio de PostgreSQL tenga el estado **"Running"** (verde)
3. Si está detenido o en error, revisa los logs del servicio PostgreSQL

### Paso 5: Redesplegar la Aplicación

1. Después de actualizar `DATABASE_URL`, guarda los cambios
2. Haz clic en **"Redeploy"** en el servicio `citaplanner-app`
3. Espera a que el contenedor se reinicie

---

## 🔍 Cómo Identificar el Nombre Correcto del Servicio

### Método 1: Desde la Interfaz de Easypanel
1. Ve a tu proyecto en Easypanel
2. En la lista de **Services**, el nombre del servicio PostgreSQL aparece claramente
3. Usa ese nombre exacto en el `DATABASE_URL`

### Método 2: Desde los Logs de la Aplicación
Si tienes acceso a los logs del contenedor de la aplicación, puedes intentar hacer ping:
```bash
ping citaplanner-postgres
ping citaplanner-db
ping postgres
```

### Método 3: Revisar la Configuración del Proyecto
En Easypanel, ve a **Project Settings** → **Services** y revisa la configuración JSON del proyecto.

---

## ✅ Verificación Post-Despliegue

Después de actualizar el `DATABASE_URL` y redesplegar, verifica los logs:

### Logs Exitosos Esperados:
```
[2025-10-06 XX:XX:XX] ✅ DATABASE_URL validado correctamente
[2025-10-06 XX:XX:XX] ✅ Conectado a PostgreSQL exitosamente
[2025-10-06 XX:XX:XX] ✅ Migraciones aplicadas correctamente
[2025-10-06 XX:XX:XX] ✅ Servidor iniciado en puerto 3000
```

### Si Aún Hay Errores:

#### Error: "could not translate host name"
- **Causa:** El nombre del servicio PostgreSQL es incorrecto
- **Solución:** Verifica el nombre exacto del servicio en Easypanel

#### Error: "password authentication failed"
- **Causa:** La contraseña en `DATABASE_URL` es incorrecta
- **Solución:** Verifica la contraseña del usuario `postgres` en la configuración del servicio PostgreSQL

#### Error: "database does not exist"
- **Causa:** El nombre de la base de datos es incorrecto
- **Solución:** Verifica que la base de datos se llame `citaplanner-db` o ajusta el nombre en `DATABASE_URL`

---

## 📝 Configuración Recomendada para Easypanel

### Variables de Entorno Completas:

```bash
# Node Environment
NODE_ENV=production
PORT=3000

# Database (AJUSTA EL HOST SEGÚN TU SERVICIO)
DATABASE_URL=postgresql://postgres:674a351a07db86883d92@citaplanner-postgres:5432/citaplanner-db

# NextAuth
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=[tu-secret-generado]

# Master Admin
MASTER_PASSWORD_HASH=[tu-hash-bcrypt]
```

### Configuración de Red:
- Ambos servicios deben estar en la misma red interna
- El servicio PostgreSQL NO necesita estar expuesto públicamente
- Solo la aplicación necesita un dominio público

---

## 🚨 Importante

### NO Modificar:
- ✅ `Dockerfile` - Ya funciona correctamente
- ✅ `docker-entrypoint.sh` - Ya funciona correctamente

### SÍ Modificar:
- ⚠️ `DATABASE_URL` en las variables de entorno de Easypanel
- ⚠️ Configuración de red si es necesario

---

## 📞 Soporte Adicional

Si después de seguir estos pasos el problema persiste:

1. **Verifica los logs del servicio PostgreSQL** en Easypanel
2. **Verifica que PostgreSQL esté escuchando en el puerto 5432**
3. **Verifica que no haya firewalls bloqueando la comunicación interna**
4. **Contacta al soporte de Easypanel** si el problema es de configuración de red

---

## 🎉 Resumen

El problema es simplemente un **nombre de host incorrecto** en el `DATABASE_URL`. Una vez que uses el nombre correcto del servicio PostgreSQL en Easypanel, la aplicación se conectará sin problemas.

**Pasos rápidos:**
1. Identifica el nombre del servicio PostgreSQL en Easypanel
2. Actualiza `DATABASE_URL` con el nombre correcto
3. Redesplega la aplicación
4. Verifica los logs

¡Eso es todo! 🚀
