import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getVaultSalt, 
  saveVaultSalt, 
  getVaultAuthHash, 
  saveVaultAuthHash,
  getVaultUserEmail,
  saveVaultUserEmail,
  getVaultRecoveryKey,
  saveVaultRecoveryKey,
  clearVaultData,
  saveEncryptedItems
} from '../utils/storage';
import { 
  generateSaltHex, 
  deriveKey, 
  hashPassword,
  encryptData
} from '../utils/crypto';
import { DEMO_MASTER_PASSWORD, INITIAL_DEMO_ITEMS } from '../utils/seedData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [derivedKey, setDerivedKey] = useState(null);
  const [salt, setSalt] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Check if vault has master setup & registered email
  useEffect(() => {
    const existingSalt = getVaultSalt();
    const existingHash = getVaultAuthHash();
    const existingEmail = getVaultUserEmail();
    const existingRecovery = getVaultRecoveryKey();

    if (existingSalt && existingHash) {
      setIsInitialized(true);
      setSalt(existingSalt);
      if (existingEmail) setUserEmail(existingEmail);
      if (existingRecovery) setRecoveryKey(existingRecovery);
    } else {
      setIsInitialized(false);
    }
  }, []);

  // Generate 12-word style random recovery key string
  const generateRecoveryKey = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let key = 'KEY-';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) key += '-';
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  // Sign Up with Email & Password
  const signUpWithEmail = async (email, password) => {
    const newSalt = generateSaltHex();
    const newHash = await hashPassword(password, newSalt);
    const newDerivedKey = await deriveKey(password, newSalt);
    const newRecoveryKey = generateRecoveryKey();

    saveVaultSalt(newSalt);
    saveVaultAuthHash(newHash);
    saveVaultUserEmail(email);
    saveVaultRecoveryKey(newRecoveryKey);

    setSalt(newSalt);
    setDerivedKey(newDerivedKey);
    setUserEmail(email);
    setRecoveryKey(newRecoveryKey);
    setIsInitialized(true);
    setIsUnlocked(true);
    return newRecoveryKey;
  };

  // Log In / Unlock Vault with Email & Password
  const loginWithEmail = async (email, password) => {
    const savedSalt = getVaultSalt();
    const savedHash = getVaultAuthHash();
    const savedEmail = getVaultUserEmail();

    if (!savedSalt || !savedHash) return false;

    // Verify email if registered
    if (savedEmail && savedEmail.toLowerCase() !== email.toLowerCase()) {
      throw new Error('No registered account found with this email address.');
    }

    const inputHash = await hashPassword(password, savedSalt);
    if (inputHash === savedHash) {
      const key = await deriveKey(password, savedSalt);
      setDerivedKey(key);
      setUserEmail(email);
      setIsUnlocked(true);
      return true;
    }
    return false;
  };

  // Send Reset Password Email Notification
  const sendPasswordResetEmail = async (email) => {
    const savedEmail = getVaultUserEmail();
    if (savedEmail && savedEmail.toLowerCase() !== email.toLowerCase()) {
      throw new Error('Email address not registered in this Vault session.');
    }

    // Simulate dispatching reset link to user's email
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `Password reset link dispatched to ${email}. You can reset your password or use your Recovery Key.`
        });
      }, 1000);
    });
  };

  // Reset Master Password using Recovery Key or Reset Link
  const resetPasswordWithKey = async (email, providedRecoveryKey, newPassword) => {
    const savedRecoveryKey = getVaultRecoveryKey();
    const savedEmail = getVaultUserEmail();

    if (savedEmail && savedEmail.toLowerCase() !== email.toLowerCase()) {
      throw new Error('Email does not match registered account.');
    }

    if (savedRecoveryKey && savedRecoveryKey.toUpperCase().trim() !== providedRecoveryKey.toUpperCase().trim()) {
      throw new Error('Invalid Recovery Key. Please check your backup recovery key code.');
    }

    // Reset password with new key derivation
    const newSalt = generateSaltHex();
    const newHash = await hashPassword(newPassword, newSalt);
    const newDerivedKey = await deriveKey(newPassword, newSalt);
    const updatedRecoveryKey = generateRecoveryKey();

    saveVaultSalt(newSalt);
    saveVaultAuthHash(newHash);
    saveVaultUserEmail(email);
    saveVaultRecoveryKey(updatedRecoveryKey);

    setSalt(newSalt);
    setDerivedKey(newDerivedKey);
    setUserEmail(email);
    setRecoveryKey(updatedRecoveryKey);
    setIsUnlocked(true);
    return updatedRecoveryKey;
  };

  // Lock Vault session
  const lockVault = () => {
    setDerivedKey(null);
    setIsUnlocked(false);
  };

  // Reset / Wipe Data
  const wipeVault = () => {
    clearVaultData();
    setDerivedKey(null);
    setIsUnlocked(false);
    setIsInitialized(false);
    setSalt(null);
    setUserEmail('');
    setRecoveryKey('');
    setIsDemoMode(false);
  };

  // Setup Demo Vault
  const setupDemoVault = async () => {
    const demoEmail = 'student.iiitl@iiitl.ac.in';
    const demoSalt = generateSaltHex();
    const demoHash = await hashPassword(DEMO_MASTER_PASSWORD, demoSalt);
    const demoKey = await deriveKey(DEMO_MASTER_PASSWORD, demoSalt);
    const demoRecovery = 'KEY-IIITL-2026-DEMO';

    // Encrypt demo items
    const encryptedDemoItems = await Promise.all(
      INITIAL_DEMO_ITEMS.map(async (item) => {
        const payloadString = JSON.stringify(item.plainData);
        const encrypted = await encryptData(payloadString, demoKey);
        return {
          id: item.id,
          category: item.category,
          title: item.title,
          tags: item.tags,
          updatedAt: item.updatedAt,
          isFavorite: item.isFavorite,
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv
        };
      })
    );

    saveVaultSalt(demoSalt);
    saveVaultAuthHash(demoHash);
    saveVaultUserEmail(demoEmail);
    saveVaultRecoveryKey(demoRecovery);
    saveEncryptedItems(encryptedDemoItems);

    setSalt(demoSalt);
    setDerivedKey(demoKey);
    setUserEmail(demoEmail);
    setRecoveryKey(demoRecovery);
    setIsInitialized(true);
    setIsUnlocked(true);
    setIsDemoMode(true);
  };

  return (
    <AuthContext.Provider value={{
      isInitialized,
      isUnlocked,
      derivedKey,
      salt,
      userEmail,
      recoveryKey,
      isDemoMode,
      signUpWithEmail,
      loginWithEmail,
      sendPasswordResetEmail,
      resetPasswordWithKey,
      lockVault,
      wipeVault,
      setupDemoVault
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
