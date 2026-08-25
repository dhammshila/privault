/**
 * Web Crypto API Utility for Vault
 * Provides zero-knowledge client-side AES-GCM 256-bit encryption with PBKDF2 key derivation.
 */

// Convert ArrayBuffer to Hex String
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert Hex String to Uint8Array
function hexToUint8Array(hexString) {
  const bytes = new Uint8Array(Math.ceil(hexString.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
  }
  return bytes;
}

// Generate 16-byte random salt in hex
export function generateSaltHex() {
  const salt = new Uint8Array(16);
  window.crypto.getRandomValues(salt);
  return bufferToHex(salt.buffer);
}

// Derive AES-GCM 256 Key from Master Password + Salt via PBKDF2 (100,000 iterations)
export async function deriveKey(masterPassword, saltHex) {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(masterPassword);
  const saltBuffer = hexToUint8Array(saltHex);

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return derivedKey;
}

// Hash password for master lock verification (SHA-256)
export async function hashPassword(masterPassword, saltHex) {
  const encoder = new TextEncoder();
  const data = encoder.encode(masterPassword + saltHex);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

// Encrypt plain text using AES-GCM
export async function encryptData(plainText, derivedKey) {
  if (!plainText) return { ciphertext: '', iv: '' };
  
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(plainText);
  
  // 12-byte IV for AES-GCM
  const iv = new Uint8Array(12);
  window.crypto.getRandomValues(iv);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    derivedKey,
    dataBuffer
  );

  return {
    ciphertext: bufferToHex(encryptedBuffer),
    iv: bufferToHex(iv.buffer)
  };
}

// Decrypt ciphertext using AES-GCM
export async function decryptData(encryptedObj, derivedKey) {
  if (!encryptedObj || !encryptedObj.ciphertext || !encryptedObj.iv) return '';

  const ciphertextBuffer = hexToUint8Array(encryptedObj.ciphertext);
  const ivBuffer = hexToUint8Array(encryptedObj.iv);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuffer },
      derivedKey,
      ciphertextBuffer
    );
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption failed. Invalid key or corrupted payload.', error);
    throw new Error('Decryption failed');
  }
}
