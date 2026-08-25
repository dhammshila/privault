import React from 'react';
import { useVault } from '../../context/VaultContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Download, ShieldCheck, Command, User, Menu } from 'lucide-react';
import { exportEncryptedVault } from '../../utils/exportImport';

export default function Header({ onMenuClick }) {
  const {
    items,
    activeCategory,
    searchQuery,
    setIsCommandPaletteOpen,
    openNewItemModal
  } = useVault();

  const { userEmail } = useAuth();

  const titles = {
    all: 'All Vault Entries',
    notes: 'Secure Notes & Documentation',
    credentials: 'API Keys & Encrypted Credentials',
    snippets: 'Developer Code Snippets',
    bookmarks: 'Encrypted Bookmarks & Links',
    graph: 'Personal Data Knowledge Graph',
    security: 'Security & Health Audit Dashboard'
  };

  const handleExport = () => exportEncryptedVault();

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-title-wrap">
          <h1>{titles[activeCategory] || 'Vault Data Control Center'}</h1>
          <div className="header-subtitle">
            {items.length} items encrypted with client-side AES-GCM 256-bit key
          </div>
        </div>
      </div>

      <div
        onClick={() => setIsCommandPaletteOpen(true)}
        className="glass-input header-search"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setIsCommandPaletteOpen(true);
        }}
      >
        <Search size={16} color="var(--text-muted)" />
        <span className="header-search-text">
          {searchQuery || 'Search vault or press Cmd+K...'}
        </span>
        <div className="header-shortcut">
          <Command size={11} />
          <span>K</span>
        </div>
      </div>

      <div className="header-actions">
        {userEmail && (
          <div className="badge badge-cyan header-user-email">
            <User size={13} />
            <span>{userEmail}</span>
          </div>
        )}

        <button
          onClick={handleExport}
          className="btn-secondary header-backup"
          title="Export Encrypted Backup JSON"
        >
          <Download size={15} />
          <span>Backup</span>
        </button>

        <div className="badge badge-emerald header-security">
          <ShieldCheck size={14} />
          <span>96% SECURE</span>
        </div>

        <button
          onClick={() => openNewItemModal(activeCategory === 'all' || activeCategory === 'graph' || activeCategory === 'security' ? 'notes' : activeCategory)}
          className="btn-primary header-new-entry"
        >
          <Plus size={18} />
          <span>New Entry</span>
        </button>
      </div>
    </header>
  );
}
