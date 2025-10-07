
/**
 * Encryption utilities for storing sensitive calendar credentials
 * Uses AES-256-CBC encryption with node-forge
 */

import forge from 'node-forge';

// Get encryption key from environment variable
// In production, this should be stored in a secure secrets manager
const ENCRYPTION_KEY = process.env.CALENDAR_ENCRYPTION_KEY || 'default-key-change-in-production-32';

// Ensure key is exactly 32 bytes for AES-256
function getEncryptionKey(): string {
  const key = ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32);
  return key;
}

/**
 * Encrypt a string using AES-256-CBC
 * @param plaintext - The text to encrypt
 * @returns Base64-encoded encrypted string with IV prepended
 */
export function encrypt(plaintext: string): string {
  try {
    const key = getEncryptionKey();
    const iv = forge.random.getBytesSync(16); // 16 bytes IV for AES
    
    const cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(plaintext, 'utf8'));
    cipher.finish();
    
    const encrypted = cipher.output;
    
    // Prepend IV to encrypted data
    const combined = forge.util.createBuffer();
    combined.putBytes(iv);
    combined.putBytes(encrypted.bytes());
    
    // Return as base64
    return forge.util.encode64(combined.bytes());
  } catch (error: unknown) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt a string encrypted with encrypt()
 * @param encryptedData - Base64-encoded encrypted string with IV prepended
 * @returns Decrypted plaintext
 */
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    
    // Decode from base64
    const combined = forge.util.decode64(encryptedData);
    
    // Extract IV (first 16 bytes) and encrypted data
    const iv = combined.substring(0, 16);
    const encrypted = combined.substring(16);
    
    const decipher = forge.cipher.createDecipher('AES-CBC', key);
    decipher.start({ iv });
    decipher.update(forge.util.createBuffer(encrypted, 'raw'));
    const success = decipher.finish();
    
    if (!success) {
      throw new Error('Decryption failed');
    }
    
    return decipher.output.toString();
  } catch (error: unknown) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Validate that encryption/decryption is working correctly
 */
export function validateEncryption(): boolean {
  try {
    const testString = 'test-encryption-validation';
    const encrypted = encrypt(testString);
    const decrypted = decrypt(encrypted);
    return decrypted === testString;
  } catch (error: unknown) {
    console.error('Encryption validation failed:', error);
    return false;
  }
}
