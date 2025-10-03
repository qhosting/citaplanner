
/**
 * Utilidades para autenticación con master password
 * 
 * CONFIGURACIÓN:
 * - El hash del master password puede configurarse mediante la variable de entorno MASTER_PASSWORD_HASH
 * - Si no se proporciona la variable de entorno, se usa un hash hardcoded como fallback
 * - Password por defecto (fallback): x0420EZS2025*
 * - Para sobrescribir, configurar MASTER_PASSWORD_HASH en las variables de entorno
 * 
 * DEBUG:
 * - Habilitar debug con ENABLE_MASTER_DEBUG=true en variables de entorno
 */

import bcrypt from 'bcryptjs'

// Hash hardcoded como fallback para el password: x0420EZS2025*
// Este hash puede ser sobrescrito configurando la variable de entorno MASTER_PASSWORD_HASH
const DEFAULT_MASTER_PASSWORD_HASH = '$2b$10$P/AV363LeWhZGK0kkrON3eGmAlkmiTHKuzZzDKCAppFV.0Gzf0ZaO'

/**
 * Verifica si el debug está habilitado mediante variable de entorno
 */
export const isDebugEnabled = (): boolean => {
  return process.env.ENABLE_MASTER_DEBUG === 'true' || process.env.ENABLE_MASTER_DEBUG === '1'
}

/**
 * Verifica si se está usando el hash de variable de entorno o el fallback
 */
export const isUsingEnvHash = (): boolean => {
  return !!process.env.MASTER_PASSWORD_HASH
}

/**
 * Obtiene información de configuración del sistema
 */
export const getMasterAuthConfig = () => {
  const usingEnvHash = isUsingEnvHash()
  const debugEnabled = isDebugEnabled()
  const hash = process.env.MASTER_PASSWORD_HASH ?? DEFAULT_MASTER_PASSWORD_HASH
  
  return {
    usingEnvHash,
    debugEnabled,
    hashSource: usingEnvHash ? 'environment_variable' : 'hardcoded_fallback',
    hashPrefix: hash.substring(0, 7),
    hashLength: hash.length,
    isValidFormat: hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')
  }
}

/**
 * Verifica si el master password proporcionado es correcto
 */
export async function verifyMasterPassword(password: string): Promise<boolean> {
  // Usar variable de entorno si está disponible, sino usar el hash por defecto
  const masterPasswordHash = process.env.MASTER_PASSWORD_HASH ?? DEFAULT_MASTER_PASSWORD_HASH
  const config = getMasterAuthConfig()
  
  // Debug logging (solo si ENABLE_MASTER_DEBUG está habilitado)
  if (config.debugEnabled) {
    console.log('[MASTER-AUTH-DEBUG] 🔍 === INICIO VERIFICACIÓN ===')
    console.log('[MASTER-AUTH-DEBUG] 📋 Configuración:')
    console.log('[MASTER-AUTH-DEBUG]   - Usando hash de:', config.hashSource)
    console.log('[MASTER-AUTH-DEBUG]   - Hash prefix:', config.hashPrefix)
    console.log('[MASTER-AUTH-DEBUG]   - Hash length:', config.hashLength)
    console.log('[MASTER-AUTH-DEBUG]   - Formato válido:', config.isValidFormat)
    console.log('[MASTER-AUTH-DEBUG]   - Debug habilitado:', config.debugEnabled)
    console.log('[MASTER-AUTH-DEBUG] 🔐 Password recibido:')
    console.log('[MASTER-AUTH-DEBUG]   - Length:', password.length)
    console.log('[MASTER-AUTH-DEBUG]   - Preview:', password.substring(0, 3) + '***')
  }
  
  if (!masterPasswordHash) {
    console.error('[MASTER-AUTH] ❌ ERROR: No hay hash de master password disponible')
    console.error('[MASTER-AUTH] 💡 Debe configurar MASTER_PASSWORD_HASH o usar el fallback')
    return false
  }

  // Validar formato del hash
  if (!config.isValidFormat) {
    console.error('[MASTER-AUTH] ❌ ERROR: MASTER_PASSWORD_HASH no tiene un formato bcrypt válido')
    console.error('[MASTER-AUTH] 📝 Hash actual:', masterPasswordHash.substring(0, 10) + '...')
    console.error('[MASTER-AUTH] 💡 Debe comenzar con $2a$, $2b$ o $2y$')
    return false
  }

  try {
    const startTime = Date.now()
    const isValid = await bcrypt.compare(password, masterPasswordHash)
    const duration = Date.now() - startTime
    
    if (config.debugEnabled) {
      console.log('[MASTER-AUTH-DEBUG] ⏱️  Tiempo de verificación:', duration, 'ms')
      console.log('[MASTER-AUTH-DEBUG] 🎯 Resultado:', isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO')
      console.log('[MASTER-AUTH-DEBUG] 🔍 === FIN VERIFICACIÓN ===')
    }
    
    if (!isValid) {
      console.warn('[MASTER-AUTH] ⚠️  Password no coincide con el hash')
      console.warn('[MASTER-AUTH] 💡 Verifique:')
      console.warn('[MASTER-AUTH]   1. Que el password sea correcto')
      console.warn('[MASTER-AUTH]   2. Que el hash en MASTER_PASSWORD_HASH sea válido')
      console.warn('[MASTER-AUTH]   3. Que no haya espacios extra en el password')
    }
    
    return isValid
  } catch (error) {
    console.error('[MASTER-AUTH] 🔥 ERROR al verificar master password:', error)
    if (error instanceof Error) {
      console.error('[MASTER-AUTH] 📝 Mensaje:', error.message)
      console.error('[MASTER-AUTH] 📚 Stack:', error.stack)
    }
    return false
  }
}

/**
 * Genera un hash para un master password usando bcryptjs
 * Útil para configurar el MASTER_PASSWORD_HASH inicial
 * 
 * IMPORTANTE: Este hash es compatible con bcryptjs (Node.js)
 * y genera hashes con prefijo $2a$ que son compatibles con
 * la mayoría de implementaciones de bcrypt
 */
export async function generateMasterPasswordHash(password: string): Promise<string> {
  // Usar 12 rounds es un buen balance entre seguridad y performance
  const hash = await bcrypt.hash(password, 12)
  
  if (isDebugEnabled()) {
    console.log('[MASTER-AUTH] ✅ Hash generado exitosamente')
    console.log('[MASTER-AUTH] 📋 Prefijo del hash:', hash.substring(0, 7))
    console.log('[MASTER-AUTH] 💡 Este hash es compatible con bcryptjs')
  }
  
  return hash
}
