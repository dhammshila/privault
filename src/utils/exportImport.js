import { getEncryptedItems, getVaultSalt } from './storage';

export function exportEncryptedVault() {
  const salt = getVaultSalt();
  const items = getEncryptedItems();

  const backupData = {
    app: 'Vault Data Control Center',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    salt,
    itemsCount: items.length,
    items
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `vault-backup-${new Date().toISOString().slice(0, 10)}.vault`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
