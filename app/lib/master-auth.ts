
/**
 * Utilidades para autenticación con master password
 * 
 * CONFIGURACIÓN:
 * - Sistema de primer acceso: Si no hay contraseña en BD, permite acceso directo
 * - Prioridad de autenticación:
 *   1. Hash almacenado en base de datos (MasterAdminConfig)
 *   2. Variable de entorno MASTER_PASSWORD_HASH (fallback)
 *   3. Hash hardcoded (fallback final)
 * - Password por defecto (fallback): x0420EZS2025*
 * 
 * DEBUG:
 * - Habilitar debug con ENABLE_MASTER_DEBUG=true en variables de entorno
 */

import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
 * Obtiene el hash de la contraseña master desde la base de datos
 */
export const getMasterPasswordHashFromDB = async (): Promise<string | null> => {
  try {
    const config = await prisma.masterAdminConfig.findUnique({
      where: { id: 'singleton' }
    })
    return config?.passwordHash || null
  } catch (error) {
    console.error('[MASTER-AUTH] Error al obtener hash de BD:', error)
    return null
  }
}

/**
 * Verifica si es el primer acceso (no hay contraseña configurada en BD)
 */
export const isFirstTimeAccess = async (): Promise<boolean> => {
  try {
    const config = await prisma.masterAdminConfig.findUnique({
      where: { id: 'singleton' }
    })
    return !config
  } catch (error) {
    console.error('[MASTER-AUTH] Error al verificar primer acceso:', error)
    return false
  }
}

/**
 * Obtiene información de configuración del sistema
 */
export const getMasterAuthConfig = async () => {
  const dbHash = await getMasterPasswordHashFromDB()
  const usingEnvHash = isUsingEnvHash()
  const debugEnabled = isDebugEnabled()
  const isFirstAccess = await isFirstTimeAccess()
  
  // Determinar qué hash se está usando
  let hash: string
  let hashSource: string
  
  if (dbHash) {
    hash = dbHash
    hashSource = 'database'
  } else if (process.env.MASTER_PASSWORD_HASH) {
    hash = process.env.MASTER_PASSWORD_HASH
    hashSource = 'environment_variable'
  } else {
    hash = DEFAULT_MASTER_PASSWORD_HASH
    hashSource = 'hardcoded_fallback'
  }
  
  return {
    usingEnvHash,
    debugEnabled,
    hashSource,
    hashPrefix: hash.substring(0, 7),
    hashLength: hash.length,
    isValidFormat: hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$'),
    isFirstAccess,
    hasDbPassword: !!dbHash
  }
}

/**
 * Verifica si el master password proporcionado es correcto
 * Si es el primer acceso (no hay contraseña en BD), retorna true automáticamente
 */
export async function verifyMasterPassword(password: string): Promise<boolean> {
  const config = await getMasterAuthConfig()
  
  // Si es primer acceso, permitir entrada sin contraseña
  if (config.isFirstAccess) {
    if (config.debugEnabled) {
      console.log('[MASTER-AUTH-DEBUG] 🎉 Primer acceso detectado - permitiendo entrada sin contraseña')
    }
    return true
  }
  
  // Obtener hash con prioridad: DB > ENV > Fallback
  let masterPasswordHash: string
  
  if (config.hasDbPassword) {
    const dbHash = await getMasterPasswordHashFromDB()
    masterPasswordHash = dbHash!
  } else if (process.env.MASTER_PASSWORD_HASH) {
    masterPasswordHash = process.env.MASTER_PASSWORD_HASH
  } else {
    masterPasswordHash = DEFAULT_MASTER_PASSWORD_HASH
  }
  
  // Debug logging (solo si ENABLE_MASTER_DEBUG está habilitado)
  if (config.debugEnabled) {
    console.log('[MASTER-AUTH-DEBUG] 🔍 === INICIO VERIFICACIÓN ===')
    console.log('[MASTER-AUTH-DEBUG] 📋 Configuración:')
    console.log('[MASTER-AUTH-DEBUG]   - Usando hash de:', config.hashSource)
    console.log('[MASTER-AUTH-DEBUG]   - Hash prefix:', config.hashPrefix)
    console.log('[MASTER-AUTH-DEBUG]   - Hash length:', config.hashLength)
    console.log('[MASTER-AUTH-DEBUG]   - Formato válido:', config.isValidFormat)
    console.log('[MASTER-AUTH-DEBUG]   - Debug habilitado:', config.debugEnabled)
    console.log('[MASTER-AUTH-DEBUG]   - Primer acceso:', config.isFirstAccess)
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

/**
 * Guarda o actualiza la contraseña master en la base de datos
 */
export async function saveMasterPassword(password: string, currentPassword?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const isFirstAccess = await isFirstTimeAccess()
    
    // Si no es primer acceso, verificar contraseña actual
    if (!isFirstAccess && currentPassword) {
      const isCurrentValid = await verifyMasterPassword(currentPassword)
      if (!isCurrentValid) {
        return { success: false, error: 'Contraseña actual incorrecta' }
      }
    }
    
    // Validar requisitos mínimos de seguridad
    if (password.length < 8) {
      return { success: false, error: 'La contraseña debe tener al menos 8 caracteres' }
    }
    
    // Generar hash
    const passwordHash = await generateMasterPasswordHash(password)
    
    // Guardar en BD
    await prisma.masterAdminConfig.upsert({
      where: { id: 'singleton' },
      update: {
        passwordHash,
        lastPasswordChange: new Date()
      },
      create: {
        id: 'singleton',
        passwordHash,
        lastPasswordChange: new Date()
      }
    })
    
    console.log('[MASTER-AUTH] ✅ Contraseña master guardada exitosamente en BD')
    return { success: true }
  } catch (error) {
    console.error('[MASTER-AUTH] 🔥 Error al guardar contraseña:', error)
    return { success: false, error: 'Error al guardar la contraseña' }
  }
}
