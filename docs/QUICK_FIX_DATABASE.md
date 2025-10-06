# 🚀 Solución Rápida: Error de Conexión a PostgreSQL en Easypanel

## ⚡ TL;DR - Solución en 2 Minutos

Si tu aplicación no puede conectarse a PostgreSQL en Easypanel, el problema es el **hostname incorrecto** en `DATABASE_URL`.

### ✅ Solución Inmediata

1. **Revisa los logs** de tu aplicación en Easypanel
2. **Busca esta línea:**
   ```
   ✅ Conexión exitosa usando hostname: citaplanner-db
   ```
3. **Copia el hostname que funcionó** (ej: `citaplanner-db`)
4. **Actualiza DATABASE_URL** en las variables de entorno:
   ```
   postgres://postgres:password@citaplanner-db:5432/citaplanner-db
                                 ^^^^^^^^^^^^^^
                                 Usa el hostname correcto aquí
   ```
5. **Redespliega** la aplicación

## 🎯 Regla de Oro

**El hostname en DATABASE_URL debe ser el nombre exacto del servicio PostgreSQL en Easypanel.**

### ❌ Incorrecto
```bash
# NO uses prefijos de proyecto
DATABASE_URL=postgres://user:pass@cloudmx_citaplanner-db:5432/db
DATABASE_URL=postgres://user:pass@project_postgres:5432/db
```

### ✅ Correcto
```bash
# Usa solo el nombre del servicio
DATABASE_URL=postgres://user:pass@citaplanner-db:5432/db
DATABASE_URL=postgres://user:pass@postgres:5432/db
```

## 🔍 Cómo Encontrar el Nombre Correcto

### Método 1: Desde los Logs (Recomendado)
Después de desplegar, los logs mostrarán automáticamente el hostname correcto:

```
[2025-10-06 06:09:16] 🔍 DIAGNÓSTICO DE CONECTIVIDAD DE RED
[2025-10-06 06:09:16] 4️⃣  Probando variantes del hostname...
[2025-10-06 06:09:16] ✅ Conexión exitosa usando hostname: citaplanner-db
                                                           ^^^^^^^^^^^^^^
                                                           Este es el correcto
```

### Método 2: Desde Easypanel UI
1. Ve a tu proyecto en Easypanel
2. Encuentra el servicio PostgreSQL
3. El **nombre del servicio** es el hostname que debes usar

## 🛠️ Nombres Comunes de Servicios

Dependiendo de tu configuración, el nombre podría ser:
- `citaplanner-db` ← Más común
- `postgres`
- `citaplanner-postgres`
- `db`

## 📝 Ejemplo Completo

### Configuración en Easypanel

**Servicio PostgreSQL:**
- Nombre: `citaplanner-db`
- Puerto interno: `5432`
- Usuario: `postgres`
- Contraseña: `tu_password_seguro`
- Base de datos: `citaplanner-db`

**DATABASE_URL correcta:**
```
postgres://postgres:tu_password_seguro@citaplanner-db:5432/citaplanner-db
```

## 🎉 Verificación Exitosa

Cuando la conexión funciona, verás:

```
[2025-10-06 06:09:16] ════════════════════════════════════════════════════════════════
[2025-10-06 06:09:16] ✅ CONEXIÓN A POSTGRESQL ESTABLECIDA
[2025-10-06 06:09:16] ════════════════════════════════════════════════════════════════
[2025-10-06 06:09:16] ✅ Migraciones aplicadas correctamente
[2025-10-06 06:09:16] ✅ Cliente Prisma generado correctamente
[2025-10-06 06:09:16] 🎯 Iniciando servidor Next.js standalone
```

## 🆘 ¿Aún no funciona?

Si después de corregir el hostname sigue fallando:

1. **Verifica que PostgreSQL esté ejecutándose** (estado: running en Easypanel)
2. **Confirma las credenciales** (usuario/contraseña)
3. **Espera 60 segundos** para que PostgreSQL esté completamente listo
4. **Revisa los logs de PostgreSQL** para errores específicos
5. **Consulta la guía completa:** [EASYPANEL_DATABASE_CONNECTIVITY.md](./EASYPANEL_DATABASE_CONNECTIVITY.md)

## 📚 Documentación Completa

Para más detalles sobre diagnósticos, troubleshooting y arquitectura de red:
- [Guía Completa de Conectividad](./EASYPANEL_DATABASE_CONNECTIVITY.md)

---

**Tiempo estimado de solución:** 2-5 minutos  
**Nivel de dificultad:** ⭐ Fácil
