import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for GCM
const AUTH_TAG_LENGTH = 16;
const KEY_HEX = process.env.ENCRYPTION_KEY;

if (!KEY_HEX || KEY_HEX.length !== 64) {
  throw new Error('Invalid or missing ENCRYPTION_KEY. Must be a 32-byte (64 char) hex string.');
}

const KEY = Buffer.from(KEY_HEX, 'hex');

/**
 * Encrypts diagnostic or personal text using AES-256-GCM.
 * Output format: iv_hex:auth_tag_hex:encrypted_data_hex
 */
export function encrypt(text: string): string {
  if (!text) return text;
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:tag:data
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts text previously encrypted with the above encrypt() function.
 */
export function decrypt(hash: string): string {
  if (!hash || !hash.includes(':')) return hash; // Return as is if not our format
  
  try {
    const [ivHex, authTagHex, encryptedHex] = hash.split(':');
    
    if (!ivHex || !authTagHex || !encryptedHex) return hash;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed. Data might be corrupted or key mismatched.', error);
    return '[ENCRYPTED DATA]'; // Return placeholder on failure
  }
}
