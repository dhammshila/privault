import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { 
  getEncryptedItems, 
  saveEncryptedItems, 
  getEncryptedTrash, 
  saveEncryptedTrash 
} from '../utils/storage';
import { encryptData, decryptData } from '../utils/crypto';

const VaultContext = createContext();
const TRASH_RETENTION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function VaultProvider({ children }) {
  const { isUnlocked, derivedKey } = useAuth();

  const [items, setItems] = useState([]);
  const [trashedItems, setTrashedItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load and decrypt items and trashed items
  const reloadVaultItems = useCallback(async () => {
    if (!isUnlocked || !derivedKey) {
      setItems([]);
      setTrashedItems([]);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Active items
      const encryptedList = getEncryptedItems();
      const decryptedList = await Promise.all(
        encryptedList.map(async (item) => {
          try {
            const rawPayload = await decryptData(
              { ciphertext: item.ciphertext, iv: item.iv },
              derivedKey
            );
            const plainData = rawPayload ? JSON.parse(rawPayload) : {};
            return { ...item, plainData };
          } catch (err) {
            console.error(`Failed decrypting item ${item.id}:`, err);
            return { ...item, plainData: { content: '[Decryption Error]' } };
          }
        })
      );
      setItems(decryptedList);

      // 2. Trashed items + 24-hour auto purge check
      const encryptedTrash = getEncryptedTrash();
      const now = Date.now();
      const validEncryptedTrash = [];

      const decryptedTrashList = await Promise.all(
        encryptedTrash.map(async (item) => {
          const deletedTime = new Date(item.deletedAt || Date.now()).getTime();
          // Skip if older than 24 hours
          if (now - deletedTime > TRASH_RETENTION_MS) {
            return null;
          }
          validEncryptedTrash.push(item);

          try {
            const rawPayload = await decryptData(
              { ciphertext: item.ciphertext, iv: item.iv },
              derivedKey
            );
            const plainData = rawPayload ? JSON.parse(rawPayload) : {};
            return { ...item, plainData };
          } catch (err) {
            return { ...item, plainData: { content: '[Decryption Error]' } };
          }
        })
      );

      const activeTrash = decryptedTrashList.filter(Boolean);
      setTrashedItems(activeTrash);

      // Sync purged trash back to storage if any expired
      if (validEncryptedTrash.length !== encryptedTrash.length) {
        saveEncryptedTrash(validEncryptedTrash);
      }

    } catch (err) {
      console.error('Failed loading vault items:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isUnlocked, derivedKey]);

  useEffect(() => {
    reloadVaultItems();
  }, [reloadVaultItems]);

  // Sync Active items (encrypted)
  const syncToStorage = async (updatedItems) => {
    if (!derivedKey) return;
    const encryptedList = await Promise.all(
      updatedItems.map(async (item) => {
        const payloadString = JSON.stringify(item.plainData || {});
        const encrypted = await encryptData(payloadString, derivedKey);
        return {
          id: item.id,
          category: item.category,
          title: item.title,
          tags: item.tags || [],
          updatedAt: item.updatedAt || new Date().toISOString(),
          isFavorite: !!item.isFavorite,
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv
        };
      })
    );
    saveEncryptedItems(encryptedList);
  };

  // Sync Trashed items (encrypted)
  const syncTrashToStorage = async (updatedTrash) => {
    if (!derivedKey) return;
    const encryptedList = await Promise.all(
      updatedTrash.map(async (item) => {
        const payloadString = JSON.stringify(item.plainData || {});
        const encrypted = await encryptData(payloadString, derivedKey);
        return {
          id: item.id,
          category: item.category,
          title: item.title,
          tags: item.tags || [],
          updatedAt: item.updatedAt,
          deletedAt: item.deletedAt || new Date().toISOString(),
          isFavorite: !!item.isFavorite,
          ciphertext: encrypted.ciphertext,
          iv: encrypted.iv
        };
      })
    );
    saveEncryptedTrash(encryptedList);
  };

  // Add Item
  const addItem = async (newItemData) => {
    const item = {
      id: `vault-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      category: newItemData.category,
      title: newItemData.title,
      tags: newItemData.tags || [],
      updatedAt: new Date().toISOString(),
      isFavorite: false,
      plainData: newItemData.plainData
    };

    const updated = [item, ...items];
    setItems(updated);
    await syncToStorage(updated);
  };

  // Update Item
  const updateItem = async (id, updatedFields) => {
    const updated = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...updatedFields,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
    setItems(updated);
    await syncToStorage(updated);
  };

  // Delete Item -> Move to Trash Bin with 24-hour timestamp
  const deleteItem = async (id) => {
    const targetItem = items.find(i => i.id === id);
    if (!targetItem) return;

    const trashedItem = {
      ...targetItem,
      deletedAt: new Date().toISOString()
    };

    const updatedItems = items.filter(i => i.id !== id);
    const updatedTrash = [trashedItem, ...trashedItems];

    setItems(updatedItems);
    setTrashedItems(updatedTrash);

    await syncToStorage(updatedItems);
    await syncTrashToStorage(updatedTrash);
  };

  // Restore Item from Trash Bin back to Active Vault
  const restoreItem = async (id) => {
    const targetItem = trashedItems.find(i => i.id === id);
    if (!targetItem) return;

    const { deletedAt, ...restoredItem } = targetItem;
    restoredItem.updatedAt = new Date().toISOString();

    const updatedTrash = trashedItems.filter(i => i.id !== id);
    const updatedItems = [restoredItem, ...items];

    setTrashedItems(updatedTrash);
    setItems(updatedItems);

    await syncTrashToStorage(updatedTrash);
    await syncToStorage(updatedItems);
  };

  // Permanently Delete Item from Trash Bin
  const permanentlyDeleteItem = async (id) => {
    const updatedTrash = trashedItems.filter(i => i.id !== id);
    setTrashedItems(updatedTrash);
    await syncTrashToStorage(updatedTrash);
  };

  // Empty Entire Trash Bin
  const emptyTrash = async () => {
    setTrashedItems([]);
    saveEncryptedTrash([]);
  };

  // Toggle Favorite
  const toggleFavorite = async (id) => {
    const updated = items.map(item => {
      if (item.id === id) {
        return { ...item, isFavorite: !item.isFavorite };
      }
      return item;
    });
    setItems(updated);
    await syncToStorage(updated);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  const openNewItemModal = (category = 'notes') => {
    setEditingItem({ category });
    setIsItemModalOpen(true);
  };

  const closeModal = () => {
    setEditingItem(null);
    setIsItemModalOpen(false);
  };

  const allTags = Array.from(
    new Set(items.flatMap(item => item.tags || []))
  );

  return (
    <VaultContext.Provider value={{
      items,
      trashedItems,
      isLoading,
      activeCategory,
      setActiveCategory,
      selectedTag,
      setSelectedTag,
      searchQuery,
      setSearchQuery,
      isCommandPaletteOpen,
      setIsCommandPaletteOpen,
      isItemModalOpen,
      setIsItemModalOpen,
      editingItem,
      openEditModal,
      openNewItemModal,
      closeModal,
      addItem,
      updateItem,
      deleteItem,
      restoreItem,
      permanentlyDeleteItem,
      emptyTrash,
      toggleFavorite,
      allTags,
      reloadVaultItems
    }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  return useContext(VaultContext);
}
