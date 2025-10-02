
/**
 * Utilidades para autenticación con master password
 */

import bcrypt from 'bcryptjs'

/**
 * Verifica si el master password proporcionado es correcto
 */
export async function verifyMasterPassword(password: string): Promise<boolean> {
  const masterPasswordHash = process.env.MASTER_PASSWORD_HASH
  
  if (!masterPasswordHash) {
    console.error('MASTER_PASSWORD_HASH no está configurado en las variables de entorno')
    return false
  }

  try {
    return await bcrypt.compare(password, masterPasswordHash)
  } catch (error) {
    console.error('Error al verificar master password:', error)
    return false
  }
}

/**
 * Genera un hash para un master password
 * Útil para configurar el MASTER_PASSWORD_HASH inicial
 */
export async function generateMasterPasswordHash(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}
