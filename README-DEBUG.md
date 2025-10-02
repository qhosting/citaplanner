# Guía de Debug para Problema de Autenticación Master

## Problema Actual
El hash `$2b$10$HR7Cx57ULUAEkjRlk7wYQOLJn1pzRcn0ese632RKujWq0GFqySnRC` está configurado en Easypanel pero no reconoce el password `x0420EZS$$$$$`.

## Herramientas de Debug Creadas

### 1. Ruta de Debug API
**Endpoint:** `GET /api/admin/master/debug`

Esta ruta muestra información sobre la configuración sin exponer el hash completo:
- Si la variable de entorno está configurada
- Longitud del hash
- Primeros y últimos caracteres
- Formato del hash (debe ser $2a$, $2b$ o $2y$)
- Variables de entorno relacionadas

**Cómo usar:**
```bash
# En desarrollo local
curl http://localhost:3000/api/admin/master/debug

# En producción (Easypanel)
curl https://tu-dominio.com/api/admin/master/debug
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

En Easypanel, revisa los logs del contenedor para ver mensajes de debug:
- `[DEBUG] Master Auth - Verificando password`
- `[DEBUG] MASTER_PASSWORD_HASH presente: true/false`
- `[DEBUG] Hash prefix: $2b$10$`

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
