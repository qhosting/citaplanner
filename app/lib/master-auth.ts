

/**
 * Utilidades para autenticación con master password
 */

import bcrypt from 'bcryptjs'

/**
 * Verifica si el debug está habilitado mediante variable de entorno
 */
const isDebugEnabled = (): boolean => {
  return process.env.ENABLE_MASTER_DEBUG === 'true' || process.env.ENABLE_MASTER_DEBUG === '1'
}

/**
 * Verifica si el master password proporcionado es correcto
 */
export async function verifyMasterPassword(password: string): Promise<boolean> {
  const masterPasswordHash = process.env.MASTER_PASSWORD_HASH
  
  // Debug logging (solo si ENABLE_MASTER_DEBUG está habilitado)
  if (isDebugEnabled()) {
    console.log('[DEBUG] Master Auth - Verificando password')
    console.log('[DEBUG] MASTER_PASSWORD_HASH presente:', !!masterPasswordHash)
    if (masterPasswordHash) {
      console.log('[DEBUG] Hash prefix:', masterPasswordHash.substring(0, 7))
      console.log('[DEBUG] Hash length:', masterPasswordHash.length)
    }
  }
  
  if (!masterPasswordHash) {
    console.error('[ERROR] MASTER_PASSWORD_HASH no está configurado en las variables de entorno')
    return false
  }

  // Validar formato del hash
  if (!masterPasswordHash.startsWith('$2a$') && !masterPasswordHash.startsWith('$2b$') && !masterPasswordHash.startsWith('$2y$')) {
    console.error('[ERROR] MASTER_PASSWORD_HASH no tiene un formato bcrypt válido')
    console.error('[ERROR] Debe comenzar con $2a$, $2b$ o $2y$')
    return false
  }

  try {
    const isValid = await bcrypt.compare(password, masterPasswordHash)
    
    if (isDebugEnabled()) {
      console.log('[DEBUG] Resultado de verificación:', isValid)
    }
    
    return isValid
  } catch (error) {
    console.error('[ERROR] Error al verificar master password:', error)
    if (error instanceof Error) {
      console.error('[ERROR] Mensaje:', error.message)
      console.error('[ERROR] Stack:', error.stack)
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
    console.log('[INFO] Hash generado exitosamente')
    console.log('[INFO] Prefijo del hash:', hash.substring(0, 7))
    console.log('[INFO] Este hash es compatible con bcryptjs')
  }
  
  return hash
}

