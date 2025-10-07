# 🚨 ACCIÓN INMEDIATA - Problema de Conexión a Base de Datos

> **Fecha:** 2025-10-06  
> **Problema:** La aplicación no puede conectarse a PostgreSQL  
> **Impacto:** La aplicación está online pero sin funcionalidad de base de datos

---

## 📊 Diagnóstico Rápido

### ❌ Problema Principal

**La aplicación CitaPlanner no pudo conectarse a PostgreSQL durante el despliegue:**

```
[2025-10-06 01:09:00] ❌ No se pudo conectar a la base de datos después de 30 intentos
```

**Consecuencias:**
- ❌ Las migraciones de Prisma NO se ejecutaron
- ❌ La tabla `master_admin_config` NO existe
- ❌ El login del master admin NO funciona
- ⚠️ La aplicación está corriendo pero sin acceso a la base de datos

---

## 🎯 PASOS INMEDIATOS (Hacer AHORA)

### Paso 1: Verificar que PostgreSQL Existe en Easypanel (2 minutos)

1. **Ir a Easypanel:** https://easypanel.io
2. **Seleccionar tu proyecto** (ejemplo: `cloudmx`)
3. **Buscar un servicio de base de datos** llamado:
   - `citaplanner-db` o
   - `postgres` o
   - Similar

#### ¿Existe el servicio PostgreSQL? 

<details>
<summary>✅ SÍ, existe → Ir al Paso 2</summary>

Perfecto, el servicio existe. Ahora verifica que esté corriendo.

</details>

<details>
<summary>❌ NO, no existe → CREAR SERVICIO AHORA</summary>

**El servicio PostgreSQL NO existe. Debes crearlo:**

1. En Easypanel, hacer clic en **"Add Service"** o **"Create Service"**
2. Seleccionar **"Database" → "PostgreSQL"**
3. Configurar:
   ```yaml
   Name: citaplanner-db
   Version: PostgreSQL 15
   ```
4. **Variables de Entorno:**
   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=674a351a07db86883d92
   POSTGRES_DB=citaplanner-db
   ```
5. **Volumen:**
   ```
   Mount Path: /var/lib/postgresql/data
   Volume Name: citaplanner-db-data
   ```
6. Hacer clic en **"Create"** o **"Deploy"**
7. **Esperar 1-2 minutos** hasta que el estado sea "Running" ✅

**Después de crear el servicio, ir al Paso 2.**

</details>

---

### Paso 2: Verificar el Estado del Servicio PostgreSQL (1 minuto)

1. **Hacer clic en el servicio PostgreSQL** en Easypanel
2. **Verificar que el estado sea "Running"** ✅

#### ¿El estado es "Running"?

<details>
<summary>✅ SÍ, está corriendo → Ir al Paso 3</summary>

Perfecto, PostgreSQL está corriendo.

</details>

<details>
<summary>❌ NO, está detenido o en error → REINICIAR</summary>

1. Hacer clic en **"Restart"** o **"Start"**
2. Esperar a que el estado cambie a "Running"
3. Si el error persiste, revisar los logs del servicio PostgreSQL
4. **Después de reiniciar, ir al Paso 3**

</details>

---

### Paso 3: Verificar el Nombre del Servicio (1 minuto)

1. **En el servicio PostgreSQL, copiar el nombre EXACTO**
   - Ejemplo: `citaplanner-db`
   - Puede incluir prefijos: `cloudmx_citaplanner-db`

2. **Ir al servicio CitaPlanner (aplicación Next.js)**

3. **Hacer clic en "Environment Variables" o "Settings"**

4. **Buscar la variable `DATABASE_URL`**

5. **Verificar que el hostname en DATABASE_URL coincida EXACTAMENTE con el nombre del servicio:**

   **Ejemplo correcto:**
   ```env
   # Si el servicio se llama: citaplanner-db
   DATABASE_URL=postgres://postgres:674a351a07db86883d92@citaplanner-db:5432/citaplanner-db?sslmode=disable
                                                            ^^^^^^^^^^^^^^^
                                                            Debe coincidir EXACTAMENTE
   ```

#### ¿El hostname coincide?

<details>
<summary>✅ SÍ, coincide → Ir al Paso 4</summary>

Perfecto, la configuración es correcta.

</details>

<details>
<summary>❌ NO, no coincide → CORREGIR AHORA</summary>

1. **Editar la variable `DATABASE_URL`**
2. **Cambiar el hostname para que coincida con el nombre del servicio:**
   ```env
   DATABASE_URL=postgres://postgres:674a351a07db86883d92@[NOMBRE_EXACTO_DEL_SERVICIO]:5432/citaplanner-db?sslmode=disable
   ```
3. **Guardar cambios**
4. **Ir al Paso 4**

</details>

---

### Paso 4: Re-desplegar la Aplicación (2 minutos)

1. **En el servicio CitaPlanner (aplicación Next.js)**
2. **Hacer clic en "Redeploy" o "Restart"**
3. **Esperar 2-3 minutos** mientras se re-despliega
4. **Ver los logs** durante el despliegue

#### ¿Qué buscar en los logs?

**✅ BUENO:** Deberías ver algo como:
```
✅ Conexión a base de datos exitosa
✅ Ejecutando migraciones de Prisma...
✅ Migraciones aplicadas exitosamente
✅ Inicialización completada
```

**❌ MALO:** Si ves:
```
⚠️ Intento 1/30 - Esperando conexión a la base de datos...
❌ No se pudo conectar a la base de datos después de 30 intentos
```

**Si sigues viendo el error, ir al Paso 5.**

---

### Paso 5: Diagnóstico Avanzado (Si el problema persiste)

Si después de los pasos anteriores el problema persiste, necesitas más información.

**Opción A: Usar el Script de Diagnóstico (Recomendado)**

1. **En Easypanel, ir al servicio CitaPlanner**
2. **Hacer clic en "Console" o "Shell"**
3. **Ejecutar el script de diagnóstico:**
   ```bash
   cd /app
   ./scripts/diagnose-db.sh
   ```
4. **Copiar toda la salida del script**
5. **Revisar qué checks fallaron (✗)**

**Opción B: Verificación Manual**

En la consola del servicio CitaPlanner, ejecutar:

```bash
# 1. Verificar variable de entorno
echo $DATABASE_URL

# 2. Verificar si puede resolver el hostname
ping -c 2 citaplanner-db
# (Reemplaza 'citaplanner-db' con el nombre de tu servicio)

# 3. Verificar si el puerto está abierto
nc -zv citaplanner-db 5432

# 4. Intentar conectar con psql (si está instalado)
apt-get update && apt-get install -y postgresql-client
psql "$DATABASE_URL" -c "SELECT version();"
```

**Si alguno de estos comandos falla, ve a "Soluciones por Tipo de Error" más abajo.**

---

## 🔧 Soluciones por Tipo de Error

### Error: "No se pudo resolver el hostname"

**Causa:** El nombre del servicio es incorrecto o los servicios no están en la misma red.

**Solución:**
1. Verificar que el nombre en `DATABASE_URL` coincida EXACTAMENTE con el nombre del servicio PostgreSQL
2. Verificar que ambos servicios estén en el mismo proyecto de Easypanel
3. En algunos casos, puede necesitar el prefijo del proyecto: `[proyecto]_[servicio]`

---

### Error: "Connection refused" o "Port 5432 closed"

**Causa:** PostgreSQL no está corriendo o no está escuchando en el puerto correcto.

**Solución:**
1. Verificar que el servicio PostgreSQL esté en estado "Running"
2. Reiniciar el servicio PostgreSQL
3. Verificar que no hay errores en los logs de PostgreSQL

---

### Error: "Authentication failed"

**Causa:** Las credenciales no coinciden.

**Solución:**
1. Ir al servicio PostgreSQL → Environment Variables
2. Copiar los valores de:
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DB`
3. Actualizar `DATABASE_URL` para que coincida:
   ```env
   DATABASE_URL=postgres://[USER]:[PASSWORD]@[HOST]:5432/[DATABASE]?sslmode=disable
   ```

---

### Error: "Table master_admin_config does not exist"

**Causa:** Las migraciones no se han ejecutado.

**Solución:**

**Una vez que la conexión funcione:**

1. **En la consola del servicio CitaPlanner:**
   ```bash
   cd /app
   npx prisma migrate deploy
   ```

2. **Verificar que se aplicó:**
   ```bash
   npx prisma migrate status
   ```

3. **Re-intentar el login** en `/admin/master`

---

## 📚 Recursos Adicionales

| Recurso | Ubicación |
|---------|-----------|
| **Guía Completa de Troubleshooting** | `docs/troubleshooting_database.md` |
| **Script de Diagnóstico** | `scripts/diagnose-db.sh` |
| **Logs de la Aplicación** | Easypanel → CitaPlanner Service → Logs |
| **Logs de PostgreSQL** | Easypanel → PostgreSQL Service → Logs |

---

## ✅ Verificación Final

Después de completar los pasos, verifica que todo funcione:

- [ ] El servicio PostgreSQL está en estado "Running" ✅
- [ ] Los logs de CitaPlanner muestran "Conexión exitosa" ✅
- [ ] El script de diagnóstico pasa todos los checks ✅
- [ ] Las migraciones se aplicaron exitosamente ✅
- [ ] La tabla `master_admin_config` existe ✅
- [ ] El endpoint `/api/admin/master/test-hash` funciona ✅
- [ ] Puedes hacer login en `/admin/master` ✅

---

## 🆘 Si Nada Funciona

Si después de seguir todos estos pasos el problema persiste:

1. **Recopilar información:**
   - Ejecutar: `./scripts/diagnose-db.sh > diagnostico.txt`
   - Descargar logs de CitaPlanner y PostgreSQL desde Easypanel
   - Tomar capturas de pantalla de la configuración

2. **Revisar la guía completa:**
   - Leer `docs/troubleshooting_database.md` en detalle

3. **Verificar configuración de red:**
   - Asegurar que ambos servicios estén en el mismo proyecto
   - Verificar que no haya firewalls o restricciones de red

---

## 🎯 Resultado Esperado

Al finalizar estos pasos, deberías poder:

1. ✅ Conectarte a PostgreSQL desde la aplicación
2. ✅ Ver las migraciones aplicadas
3. ✅ Acceder al endpoint de test: `https://citaplanner.com/api/admin/master/test-hash`
4. ✅ Hacer login en: `https://citaplanner.com/admin/master`

---

**Última actualización:** 2025-10-06  
**Tiempo estimado:** 5-10 minutos
