import React from 'react';
import { useVault } from '../../context/VaultContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Download, ShieldCheck, Command, User, LogOut } from 'lucide-react';
import { exportEncryptedVault } from '../../utils/exportImport';

export default function Header() {
  const { 
    items, 
    activeCategory, 
    searchQuery, 
    setIsCommandPaletteOpen,
    openNewItemModal 
  } = useVault();

  const { userEmail, lockVault } = useAuth();

  const titles = {
    all: 'All Vault Entries',
    notes: 'Secure Notes & Documentation',
    credentials: 'API Keys & Encrypted Credentials',
    snippets: 'Developer Code Snippets',
    bookmarks: 'Encrypted Bookmarks & Links',
    graph: 'Personal Data Knowledge Graph',
    security: 'Security & Health Audit Dashboard'
  };

  const handleExport = () => {
    exportEncryptedVault();
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      position: 'fixed',
      top: 0,
      left: 'var(--sidebar-width)',
      right: 0,
      background: 'rgba(10, 14, 22, 0.85)',
      backdropFilter: 'var(--backdrop-blur)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      zIndex: 90
    }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
          {titles[activeCategory] || 'Vault Data Control Center'}
        </h1>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {items.length} items encrypted with client-side AES-GCM 256-bit key
        </div>
      </div>

      {/* Center Search / Cmd+K Launcher */}
      <div 
        onClick={() => setIsCommandPaletteOpen(true)}
        className="glass-input"
        style={{
          maxWidth: '360px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          padding: '8px 14px',
          background: 'rgba(18, 24, 36, 0.6)'
        }}
      >
        <Search size={16} color="var(--text-muted)" />
        <span style={{ fontSize: '0.84rem', color: searchQuery ? '#fff' : 'var(--text-muted)', flex: 1 }}>
          {searchQuery || 'Search vault or press Cmd+K...'}
        </span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '0.7rem',
          color: 'var(--text-secondary)'
        }}>
          <Command size={11} />
          <span>K</span>
        </div>
      </div>

      {/* Actions & User Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* User Email Pill */}
        {userEmail && (
          <div className="badge badge-cyan" style={{ padding: '5px 10px', fontSize: '0.75rem', textTransform: 'none', display: 'flex', gap: '6px' }}>
            <User size={13} />
            <span>{userEmail}</span>
          </div>
        )}

        {/* Export Backup */}
        <button 
          onClick={handleExport}
          className="btn-secondary"
          title="Export Encrypted Backup JSON"
          style={{ padding: '8px 12px', fontSize: '0.8rem' }}
        >
          <Download size={15} />
          <span>Backup</span>
        </button>

        {/* Security Health Pill */}
        <div className="badge badge-emerald" style={{ padding: '6px 12px', display: 'flex', gap: '6px' }}>
          <ShieldCheck size={14} />
          <span>96% SECURE</span>
        </div>

        {/* Quick Add Button */}
        <button 
          onClick={() => openNewItemModal(activeCategory === 'all' || activeCategory === 'graph' || activeCategory === 'security' ? 'notes' : activeCategory)}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <Plus size={18} />
          <span>New Entry</span>
        </button>
      </div>
    </header>
  );
}
