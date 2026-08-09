/**
 * Local Storage Wrapper for Vault App
 */

const STORAGE_KEYS = {
  VAULT_SALT: 'vault_salt_v1',
  VAULT_HASH: 'vault_auth_hash_v1',
  VAULT_USER_EMAIL: 'vault_user_email_v1',
  VAULT_RECOVERY_KEY: 'vault_recovery_key_v1',
  VAULT_ITEMS: 'vault_encrypted_items_v1',
  VAULT_TRASH: 'vault_encrypted_trash_v1',
  VAULT_SETTINGS: 'vault_settings_v1'
};

export function getVaultSalt() {
  return localStorage.getItem(STORAGE_KEYS.VAULT_SALT);
}

export function saveVaultSalt(saltHex) {
  localStorage.setItem(STORAGE_KEYS.VAULT_SALT, saltHex);
}

export function getVaultAuthHash() {
  return localStorage.getItem(STORAGE_KEYS.VAULT_HASH);
}

export function saveVaultAuthHash(hashHex) {
  localStorage.setItem(STORAGE_KEYS.VAULT_HASH, hashHex);
}

export function getVaultUserEmail() {
  return localStorage.getItem(STORAGE_KEYS.VAULT_USER_EMAIL);
}

export function saveVaultUserEmail(email) {
  localStorage.setItem(STORAGE_KEYS.VAULT_USER_EMAIL, email);
}

export function getVaultRecoveryKey() {
  return localStorage.getItem(STORAGE_KEYS.VAULT_RECOVERY_KEY);
}

export function saveVaultRecoveryKey(recoveryKey) {
  localStorage.setItem(STORAGE_KEYS.VAULT_RECOVERY_KEY, recoveryKey);
}

export function getEncryptedItems() {
  const raw = localStorage.getItem(STORAGE_KEYS.VAULT_ITEMS);
  return raw ? JSON.parse(raw) : [];
}

export function saveEncryptedItems(itemsArray) {
  localStorage.setItem(STORAGE_KEYS.VAULT_ITEMS, JSON.stringify(itemsArray));
}

export function getEncryptedTrash() {
  const raw = localStorage.getItem(STORAGE_KEYS.VAULT_TRASH);
  return raw ? JSON.parse(raw) : [];
}

export function saveEncryptedTrash(itemsArray) {
  localStorage.setItem(STORAGE_KEYS.VAULT_TRASH, JSON.stringify(itemsArray));
}

export function getVaultSettings() {
  const raw = localStorage.getItem(STORAGE_KEYS.VAULT_SETTINGS);
  return raw ? JSON.parse(raw) : { autoLockMinutes: 15, theme: 'dark' };
}

export function saveVaultSettings(settingsObj) {
  localStorage.setItem(STORAGE_KEYS.VAULT_SETTINGS, JSON.stringify(settingsObj));
}

export function clearVaultData() {
  localStorage.removeItem(STORAGE_KEYS.VAULT_SALT);
  localStorage.removeItem(STORAGE_KEYS.VAULT_HASH);
  localStorage.removeItem(STORAGE_KEYS.VAULT_USER_EMAIL);
  localStorage.removeItem(STORAGE_KEYS.VAULT_RECOVERY_KEY);
  localStorage.removeItem(STORAGE_KEYS.VAULT_ITEMS);
  localStorage.removeItem(STORAGE_KEYS.VAULT_TRASH);
}
