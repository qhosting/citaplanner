# 🔐 Troubleshooting: Master Password Authentication

## 📋 Resumen del Problema

Si no puedes acceder a `/admin/master` con la contraseña `x0420EZS2025*`, este documento te ayudará a diagnosticar y resolver el problema.

## ✅ Verificación Realizada

**Estado del Hash Hardcoded:**
- ✅ El hash hardcoded en el código es **CORRECTO**
- ✅ El hash funciona correctamente con la contraseña `x0420EZS2025*`
- ✅ Las pruebas locales confirman que la autenticación funciona

**Hash Actual en el Código:**
```
$2b$10$P/AV363LeWhZGK0kkrON3eGmAlkmiTHKuzZzDKCAppFV.0Gzf0ZaO
```

## 🔍 Posibles Causas del Problema

### 1. Variable de Entorno Incorrecta en Easypanel

**Problema:** Si existe una variable `MASTER_PASSWORD_HASH` en Easypanel con un valor incorrecto, sobrescribirá el hash hardcoded.

**Solución:**
1. Ve a Easypanel → Tu Aplicación → Environment
2. Busca la variable `MASTER_PASSWORD_HASH`
3. **Opción A:** Elimina la variable para usar el hash hardcoded
4. **Opción B:** Actualiza el valor con el hash correcto:
   ```
   $2b$10$P/AV363LeWhZGK0kkrON3eGmAlkmiTHKuzZzDKCAppFV.0Gzf0ZaO
   ```
5. Guarda los cambios y **reinicia el contenedor**

### 2. Espacios Extra en el Password

**Problema:** El password es case-sensitive y no debe tener espacios.

**Solución:**
- Asegúrate de escribir exactamente: `x0420EZS2025*`
- Sin espacios al inicio o al final
- Respetando mayúsculas y minúsculas

**Variaciones que NO funcionan:**
- ❌ `x0420EZS2025* ` (espacio al final)
- ❌ ` x0420EZS2025*` (espacio al inicio)
- ❌ `X0420EZS2025*` (primera letra mayúscula)
- ❌ `x0420ezs2025*` (todo minúsculas)

### 3. Caché del Navegador

**Problema:** El navegador puede estar guardando un password incorrecto.

**Solución:**
1. Limpia el caché del navegador
2. Prueba en modo incógnito/privado
3. Prueba en otro navegador
4. Desactiva el autocompletado de contraseñas

### 4. Problema de Compilación/Build

**Problema:** El código desplegado puede no estar actualizado.

**Solución:**
1. En Easypanel, fuerza un nuevo build
2. Verifica que el deployment sea exitoso
3. Revisa los logs del contenedor

## 🔧 Herramientas de Diagnóstico

### Habilitar Modo Debug

Para ver logs detallados de la autenticación:

1. En Easypanel → Environment, agrega:
   ```
   ENABLE_MASTER_DEBUG=true
   ```
2. Reinicia el contenedor
3. Intenta autenticarte
4. Revisa los logs del contenedor

**Logs que verás con debug habilitado:**
```
[MASTER-AUTH-DEBUG] 🔍 === INICIO VERIFICACIÓN ===
[MASTER-AUTH-DEBUG] 📋 Configuración:
[MASTER-AUTH-DEBUG]   - Usando hash de: environment_variable / hardcoded_fallback
[MASTER-AUTH-DEBUG]   - Hash prefix: $2b$10$
[MASTER-AUTH-DEBUG]   - Hash length: 60
[MASTER-AUTH-DEBUG]   - Formato válido: true
[MASTER-AUTH-DEBUG] 🔐 Password recibido:
[MASTER-AUTH-DEBUG]   - Length: 14
[MASTER-AUTH-DEBUG]   - Preview: x04***
[MASTER-AUTH-DEBUG] ⏱️  Tiempo de verificación: XX ms
[MASTER-AUTH-DEBUG] 🎯 Resultado: ✅ VÁLIDO / ❌ INVÁLIDO
```

### Endpoint de Test (Desarrollo)

Existe un endpoint de diagnóstico en: `/api/admin/master/test-hash`

**Nota:** Este endpoint debe ser removido en producción por seguridad.

### Script de Diagnóstico Local

Ejecuta el script de diagnóstico:

```bash
cd app
node scripts/diagnostic-master-auth.js
```

Este script verificará:
- Variables de entorno
- Hash efectivo que se está usando
- Validación del password
- Recomendaciones específicas

## 📊 Checklist de Verificación

Sigue estos pasos en orden:

- [ ] **Paso 1:** Verifica que estás usando el password correcto: `x0420EZS2025*`
- [ ] **Paso 2:** Verifica que no hay espacios extra
- [ ] **Paso 3:** Prueba en modo incógnito
- [ ] **Paso 4:** Revisa variables de entorno en Easypanel
- [ ] **Paso 5:** Habilita debug mode (`ENABLE_MASTER_DEBUG=true`)
- [ ] **Paso 6:** Revisa los logs del contenedor
- [ ] **Paso 7:** Fuerza un nuevo build/deployment
- [ ] **Paso 8:** Contacta soporte si el problema persiste

## 🔐 Información Técnica

### Hash Actual (Correcto)
```
Password: x0420EZS2025*
Hash: $2b$10$P/AV363LeWhZGK0kkrON3eGmAlkmiTHKuzZzDKCAppFV.0Gzf0ZaO
Algoritmo: bcryptjs
Salt Rounds: 10
Prefijo: $2b$ (bcrypt versión 2b)
```

### Ubicación en el Código
- **Archivo:** `app/lib/master-auth.ts`
- **Constante:** `DEFAULT_MASTER_PASSWORD_HASH`
- **Función:** `verifyMasterPassword()`

### Orden de Prioridad
1. Si existe `MASTER_PASSWORD_HASH` en variables de entorno → usa ese hash
2. Si no existe → usa el hash hardcoded (fallback)

## 🆘 Soporte Adicional

Si después de seguir todos los pasos el problema persiste:

1. **Ejecuta el diagnóstico:**
   ```bash
   cd app
   node scripts/diagnostic-master-auth.js
   ```

2. **Captura los logs con debug habilitado:**
   - Habilita `ENABLE_MASTER_DEBUG=true`
   - Intenta autenticarte
   - Copia los logs del contenedor

3. **Información a proporcionar:**
   - Logs del contenedor
   - Resultado del script de diagnóstico
   - Variables de entorno configuradas (sin valores sensibles)
   - Navegador y versión utilizada

## 📝 Notas Importantes

- ⚠️ El password es **case-sensitive** (distingue mayúsculas/minúsculas)
- ⚠️ No debe haber espacios al inicio o al final
- ⚠️ Después de cambiar variables de entorno, **siempre reinicia el contenedor**
- ⚠️ El modo debug debe deshabilitarse en producción
- ⚠️ El endpoint `/api/admin/master/test-hash` debe removerse en producción

## ✅ Solución Rápida (Más Común)

**Si el problema es que hay una variable de entorno incorrecta:**

1. Ve a Easypanel → Environment
2. Elimina `MASTER_PASSWORD_HASH` (para usar el fallback)
3. O actualiza con: `$2b$10$P/AV363LeWhZGK0kkrON3eGmAlkmiTHKuzZzDKCAppFV.0Gzf0ZaO`
4. Reinicia el contenedor
5. Prueba nuevamente con: `x0420EZS2025*`

---

**Última actualización:** 2025-10-03
**Hash verificado:** ✅ Correcto
**Password verificado:** ✅ Funciona localmente
