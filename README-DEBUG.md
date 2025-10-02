# Guía de Debug para Problema de Autenticación Master

## ⚙️ Control de Debug mediante Variable de Entorno

**IMPORTANTE:** El endpoint de debug y los logs de debugging ahora están controlados por la variable de entorno `ENABLE_MASTER_DEBUG`.

### Cómo Habilitar el Debug

#### En Desarrollo Local
```bash
# Opción 1: En el archivo .env.local
ENABLE_MASTER_DEBUG=true

# Opción 2: Al ejecutar el servidor
ENABLE_MASTER_DEBUG=true npm run dev

# Opción 3: Exportar la variable en tu terminal
export ENABLE_MASTER_DEBUG=true
npm run dev
```

#### En Producción (Easypanel)
1. Ve a la configuración de tu aplicación en Easypanel
2. Navega a la sección de **Variables de Entorno**
3. Agrega o edita la variable:
   - **Nombre:** `ENABLE_MASTER_DEBUG`
   - **Valor:** `true` o `1`
4. Guarda los cambios y reinicia el contenedor

### Cómo Deshabilitar el Debug

Simplemente elimina la variable `ENABLE_MASTER_DEBUG` o configúrala con cualquier otro valor diferente a `true` o `1`:

```bash
# Deshabilitar
ENABLE_MASTER_DEBUG=false

# O simplemente no configurarla
```

**Nota de Seguridad:** Por defecto, el debug está **DESHABILITADO**. Solo se activa cuando explícitamente configuras `ENABLE_MASTER_DEBUG=true` o `ENABLE_MASTER_DEBUG=1`.

---

## Problema Actual
El hash `$2b$10$HR7Cx57ULUAEkjRlk7wYQOLJn1pzRcn0ese632RKujWq0GFqySnRC` está configurado en Easypanel pero no reconoce el password `x0420EZS$$$$$`.

## Herramientas de Debug Creadas

### 1. Ruta de Debug API
**Endpoint:** `GET /api/admin/master/debug`

**⚠️ REQUIERE:** `ENABLE_MASTER_DEBUG=true` o `ENABLE_MASTER_DEBUG=1`

Esta ruta muestra información sobre la configuración sin exponer el hash completo:
- Si la variable de entorno está configurada
- Longitud del hash
- Primeros y últimos caracteres
- Formato del hash (debe ser $2a$, $2b$ o $2y$)
- Variables de entorno relacionadas

**Cómo usar:**
```bash
# En desarrollo local (con debug habilitado)
ENABLE_MASTER_DEBUG=true npm run dev
curl http://localhost:3000/api/admin/master/debug

# En producción (Easypanel) - primero habilita ENABLE_MASTER_DEBUG en Easypanel
curl https://tu-dominio.com/api/admin/master/debug
```

**Nota:** Si el debug no está habilitado, el endpoint retornará un error 404 con el mensaje:
```json
{
  "success": false,
  "error": "Debug endpoint is disabled",
  "message": "Set ENABLE_MASTER_DEBUG=true or ENABLE_MASTER_DEBUG=1 to enable this endpoint"
}
```

### 2. Script de Test Local
**Archivo:** `scripts/test-hash.js`

Este script prueba localmente si el hash funciona con el password.

**Cómo usar:**
```bash
# Opción 1: Con variable de entorno
MASTER_PASSWORD_HASH='$2b$10$HR7Cx57ULUAEkjRlk7wYQOLJn1pzRcn0ese632RKujWq0GFqySnRC' node scripts/test-hash.js

# Opción 2: El script ya tiene el hash hardcodeado para pruebas
cd app
node ../scripts/test-hash.js
```

## Posibles Causas del Problema

### 1. Caracteres Especiales en Variables de Entorno
Los símbolos `$` en el hash pueden causar problemas en algunas configuraciones:

**En Easypanel, prueba estas variantes:**

```bash
# Opción 1: Con comillas simples (recomendado)
MASTER_PASSWORD_HASH='$2b$10$HR7Cx57ULUAEkjRlk7wYQOLJn1pzRcn0ese632RKujWq0GFqySnRC'

# Opción 2: Escapando cada $
MASTER_PASSWORD_HASH=\$2b\$10\$HR7Cx57ULUAEkjRlk7wYQOLJn1pzRcn0ese632RKujWq0GFqySnRC

# Opción 3: Con comillas dobles y escape
MASTER_PASSWORD_HASH="\$2b\$10\$HR7Cx57ULUAEkjRlk7wYQOLJn1pzRcn0ese632RKujWq0GFqySnRC"
```

### 2. Password con Caracteres Especiales
El password `x0420EZS$$$$$` contiene 5 símbolos `$` que pueden estar causando problemas:

**Pruebas a realizar:**
1. Verificar que los `$` no se estén perdiendo al pasar el password
2. Probar con un password más simple temporalmente
3. Verificar que no haya espacios invisibles

### 3. Problemas de Configuración en Easypanel
- Verificar que la variable se esté leyendo correctamente
- Reiniciar el contenedor después de cambiar variables
- Verificar logs del contenedor

## Pasos para Resolver

### Paso 1: Verificar Configuración Remota
```bash
# Llamar a la ruta de debug en tu servidor
curl https://tu-dominio.com/api/admin/master/debug
```

Verifica que:
- `hashConfigured` sea `true`
- `hashLength` sea `60`
- `hashPrefix` sea `$2b$10$`

### Paso 2: Probar Localmente
```bash
cd app
MASTER_PASSWORD_HASH='$2b$10$HR7Cx57ULUAEkjRlk7wYQOLJn1pzRcn0ese632RKujWq0GFqySnRC' node ../scripts/test-hash.js
```

Si el test local funciona pero el remoto no, el problema está en cómo Easypanel maneja la variable de entorno.

### Paso 3: Ajustar Configuración en Easypanel
1. Ve a la configuración de variables de entorno en Easypanel
2. Edita `MASTER_PASSWORD_HASH`
3. Usa comillas simples alrededor del valor completo
4. Guarda y reinicia el contenedor
5. Verifica con la ruta de debug

### Paso 4: Si Nada Funciona
Genera un nuevo hash sin caracteres especiales en el password:

```bash
# En el script test-hash.js, cambia el password a algo simple
# Por ejemplo: 'MasterPass2024'
# El script generará un nuevo hash que puedes usar
```

## Verificación de Logs

**⚠️ REQUIERE:** `ENABLE_MASTER_DEBUG=true` o `ENABLE_MASTER_DEBUG=1`

En Easypanel, revisa los logs del contenedor para ver mensajes de debug (solo aparecerán si el debug está habilitado):
- `[DEBUG] Master Auth - Verificando password`
- `[DEBUG] MASTER_PASSWORD_HASH presente: true/false`
- `[DEBUG] Hash prefix: $2b$10$`
- `[DEBUG] Resultado de verificación: true/false`

**Nota:** Los logs de error (`[ERROR]`) siempre se mostrarán, independientemente de si el debug está habilitado o no.

## Limpieza Después de Resolver

**IMPORTANTE:** Una vez resuelto el problema, elimina:
1. La ruta de debug: `app/api/admin/master/debug/route.ts`
2. Este archivo: `README-DEBUG.md`
3. Opcionalmente: `scripts/test-hash.js` (o déjalo para futuras referencias)

## Contacto y Soporte

Si necesitas más ayuda, proporciona:
1. Resultado de `curl /api/admin/master/debug`
2. Logs del contenedor en Easypanel
3. Resultado del script de test local
