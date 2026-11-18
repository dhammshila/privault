import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Plus, Download, ShieldCheck, Command, User, Menu, X, Lock, Cpu, Database, Eye, Globe, Shield } from 'lucide-react';
import { exportEncryptedVault } from '../../utils/exportImport';

function SecurityInfoModal({ onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--glass-bg)', border: '1px solid rgba(16,185,129,0.4)',
          borderRadius: '20px', padding: '28px', maxWidth: '460px', width: '100%',
          boxShadow: '0 0 40px rgba(16,185,129,0.25), 0 20px 60px rgba(0,0,0,0.8)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'var(--grad-emerald-teal)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16,185,129,0.4)'
            }}>
              <ShieldCheck size={22} color="#050a14" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '2px' }}>99% Security Rating</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Why is your vault this secure?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.84rem' }}>
          {[
            { icon: <Lock size={16} />, color: 'var(--accent-cyan)', title: 'AES-GCM 256-bit Encryption', desc: 'Military-grade cipher — same standard used by governments & banks.' },
            { icon: <Cpu size={16} />, color: 'var(--accent-emerald)', title: 'PBKDF2 Key Derivation (100k rounds)', desc: 'Your master password is stretched with 100,000 iterations, making brute-force attacks computationally infeasible.' },
            { icon: <Database size={16} />, color: '#c084fc', title: 'Zero Server Storage', desc: 'Nothing is ever sent to a server. All data lives encrypted in your browser.' },
            { icon: <Eye size={16} />, color: 'var(--accent-amber)', title: 'Zero-Knowledge Architecture', desc: 'Even if someone hacks the server, they get nothing — your keys never leave your device.' },
            { icon: <Globe size={16} />, color: 'var(--accent-rose)', title: 'Client-Side Only Decryption', desc: 'Data is decrypted in memory only. No logs, no traces on disk in plaintext.' },
            { icon: <Shield size={16} />, color: 'var(--accent-cyan)', title: 'Why 99% and not 100%?', desc: 'No system is 100% secure. The 1% accounts for browser-level risks outside our control (e.g. extensions, OS vulnerabilities).' },
          ].map(({ icon, color, title, desc }) => (
            <div key={title} style={{
              display: 'flex', gap: '12px', padding: '12px',
              background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ color, flexShrink: 0, marginTop: '2px' }}>{icon}</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, marginBottom: '4px' }}>{title}</div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Header({ onMenuClick }) {
  const {
    items,
    activeCategory,
    searchQuery,
    setIsCommandPaletteOpen,
    openNewItemModal
  } = useVault();

  const { userEmail } = useAuth();
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [showVaultId, setShowVaultId] = useState(false);

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
    <>
      {showSecurityInfo && <SecurityInfoModal onClose={() => setShowSecurityInfo(false)} />}

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
            <div
              className="badge badge-cyan header-user-email"
              style={{ cursor: 'pointer', position: 'relative' }}
              onClick={() => setShowVaultId(!showVaultId)}
              title="Click to see your Vault ID"
            >
              <User size={13} />
              <span>{userEmail}</span>
              {showVaultId && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  background: 'var(--glass-bg)', border: '1px solid rgba(0,242,254,0.3)',
                  borderRadius: '12px', padding: '14px 16px', minWidth: '280px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.8)', zIndex: 1000,
                  textAlign: 'left'
                }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Vault Identity</div>
                  <div style={{ fontSize: '0.84rem', color: '#fff', fontWeight: 600, marginBottom: '8px' }}>{userEmail}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px' }}>
                    Your vault is locally encrypted and tied to this email address. Only you can unlock it with your master password.
                  </div>
                </div>
              )}
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

          <div
            className="badge badge-emerald header-security"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowSecurityInfo(true)}
            title="Click to understand your security rating"
          >
            <ShieldCheck size={14} />
            <span>99% SECURE</span>
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
    </>
  );
}
