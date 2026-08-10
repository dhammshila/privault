import React, { createContext, useContext, useState, useEffect } from 'react';

import {
  getVaultSalt,
  saveVaultSalt,
  getVaultAuthHash,
  saveVaultAuthHash,
  getVaultUserEmail,
  saveVaultUserEmail,
  clearVaultData,
  saveEncryptedItems
} from '../utils/storage';

import {
  generateSaltHex,
  deriveKey,
  hashPassword,
  encryptData
} from '../utils/crypto';

import {
  DEMO_MASTER_PASSWORD,
  INITIAL_DEMO_ITEMS
} from '../utils/seedData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [derivedKey, setDerivedKey] = useState(null);
  const [salt, setSalt] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Check if vault has master setup & registered email
  useEffect(() => {
    const existingSalt = getVaultSalt();
    const existingHash = getVaultAuthHash();
    const existingEmail = getVaultUserEmail();

    if (existingSalt && existingHash) {
      setIsInitialized(true);
      setSalt(existingSalt);

      if (existingEmail) {
        setUserEmail(existingEmail);
      }
    } else {
      setIsInitialized(false);
    }
  }, []);

  // Sign Up with Email & Password
  const signUpWithEmail = async (email, password) => {
    const newSalt = generateSaltHex();
    const newHash = await hashPassword(password, newSalt);
    const newDerivedKey = await deriveKey(password, newSalt);

    saveVaultSalt(newSalt);
    saveVaultAuthHash(newHash);
    saveVaultUserEmail(email);

    setSalt(newSalt);
    setDerivedKey(newDerivedKey);
    setUserEmail(email);
    setIsInitialized(true);
    setIsUnlocked(true);
  };

  // Log In / Unlock Vault with Email & Password
  const loginWithEmail = async (email, password) => {
    const savedSalt = getVaultSalt();
    const savedHash = getVaultAuthHash();
    const savedEmail = getVaultUserEmail();

    if (!savedSalt || !savedHash) {
      return false;
    }

    // Verify email if registered
    if (
      savedEmail &&
      savedEmail.toLowerCase() !== email.toLowerCase()
    ) {
      throw new Error(
        'No registered account found with this email address.'
      );
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

  // Send Password Reset Email
  const sendPasswordResetEmail = async (email) => {
    const savedEmail = getVaultUserEmail();

    if (!savedEmail) {
      throw new Error('No registered email found.');
    }

    if (savedEmail.toLowerCase() !== email.toLowerCase()) {
      throw new Error(
        'Email address not registered in this Vault session.'
      );
    }

    const resetLink = `${window.location.origin}/reset-password`;

    const response = await fetch('/api/send-reset-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        resetLink,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Failed to send reset email.'
      );
    }

    return {
      success: true,
      message: `Password reset email sent to ${email}.`,
    };
  };

  // Lock Vault Session
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
    setIsDemoMode(false);
  };

  // Setup Demo Vault
  const setupDemoVault = async () => {
    const demoEmail = 'student.iiitl@iiitl.ac.in';
    const demoSalt = generateSaltHex();
    const demoHash = await hashPassword(
      DEMO_MASTER_PASSWORD,
      demoSalt
    );
    const demoKey = await deriveKey(
      DEMO_MASTER_PASSWORD,
      demoSalt
    );

    // Encrypt demo items
    const encryptedDemoItems = await Promise.all(
      INITIAL_DEMO_ITEMS.map(async (item) => {
        const payloadString = JSON.stringify(item.plainData);
        const encrypted = await encryptData(
          payloadString,
          demoKey
        );

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
    saveEncryptedItems(encryptedDemoItems);

    setSalt(demoSalt);
    setDerivedKey(demoKey);
    setUserEmail(demoEmail);
    setIsInitialized(true);
    setIsUnlocked(true);
    setIsDemoMode(true);
  };

  return (
    <AuthContext.Provider
      value={{
        isInitialized,
        isUnlocked,
        derivedKey,
        salt,
        userEmail,
        isDemoMode,
        signUpWithEmail,
        loginWithEmail,
        sendPasswordResetEmail,
        lockVault,
        wipeVault,
        setupDemoVault
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}