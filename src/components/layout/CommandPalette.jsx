import React, { useState, useEffect, useRef } from 'react';
import { useVault } from '../../context/VaultContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, 
  FileText, 
  Key, 
  Code, 
  Bookmark, 
  Plus, 
  Lock, 
  Network, 
  ShieldAlert, 
  Download, 
  Tag 
} from 'lucide-react';
import { exportEncryptedVault } from '../../utils/exportImport';

export default function CommandPalette() {
  const { 
    items, 
    isCommandPaletteOpen, 
    setIsCommandPaletteOpen,
    openNewItemModal,
    openEditModal,
    setActiveCategory
  } = useVault();

  const { lockVault } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Global hotkey listener for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Filter items matching query
  const matchingItems = items.filter(item => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(q))) ||
      item.category.toLowerCase().includes(q)
    );
  }).slice(0, 6);

  // System Actions
  const systemActions = [
    { id: 'new-note', label: 'Create Secure Note', icon: Plus, action: () => openNewItemModal('notes') },
    { id: 'new-cred', label: 'Add API Key / Password', icon: Key, action: () => openNewItemModal('credentials') },
    { id: 'new-snippet', label: 'Save Code Snippet', icon: Code, action: () => openNewItemModal('snippets') },
    { id: 'view-graph', label: 'Open Knowledge Graph', icon: Network, action: () => setActiveCategory('graph') },
    { id: 'view-security', label: 'Run Security Health Audit', icon: ShieldAlert, action: () => setActiveCategory('security') },
    { id: 'export-backup', label: 'Export Encrypted Vault Backup', icon: Download, action: exportEncryptedVault },
    { id: 'lock-session', label: 'Lock Vault Session', icon: Lock, action: lockVault },
  ].filter(a => !query || a.label.toLowerCase().includes(query.toLowerCase()));

  const totalResults = matchingItems.length + systemActions.length;

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (totalResults || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalResults) % (totalResults || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < matchingItems.length) {
        const item = matchingItems[selectedIndex];
        openEditModal(item);
      } else {
        const actionIdx = selectedIndex - matchingItems.length;
        if (systemActions[actionIdx]) {
          systemActions[actionIdx].action();
        }
      }
      setIsCommandPaletteOpen(false);
    }
  };

  const getItemIcon = (cat) => {
    switch (cat) {
      case 'notes': return FileText;
      case 'credentials': return Key;
      case 'snippets': return Code;
      case 'bookmarks': return Bookmark;
      default: return FileText;
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCommandPaletteOpen(false)}>
      <div 
        className="glass-panel animate-fade-in command-palette-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '600px',
          width: '100%',
          overflow: 'hidden',
          padding: '0',
          boxShadow: 'var(--glow-cyan), 0 24px 60px rgba(0,0,0,0.9)'
        }}
      >
        {/* Search Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <Search size={20} color="var(--accent-cyan)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search vault items..."
            style={{
              background: 'none',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '1rem',
              width: '100%',
              fontFamily: 'var(--font-sans)'
            }}
          />
          <kbd style={{
            fontSize: '0.7rem',
            background: 'rgba(255,255,255,0.08)',
            padding: '2px 6px',
            borderRadius: '4px',
            color: 'var(--text-muted)'
          }}>ESC</kbd>
        </div>

        {/* Results Body */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
          {/* Vault Items Match */}
          {matchingItems.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '6px 12px' }}>
                MATCHING VAULT ENTRIES
              </div>
              {matchingItems.map((item, idx) => {
                const Icon = getItemIcon(item.category);
                const isSelected = selectedIndex === idx;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      openEditModal(item);
                      setIsCommandPaletteOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Icon size={18} color={isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)'} />
                      <div>
                        <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 500 }}>{item.title}</div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                          {item.tags?.map(t => (
                            <span key={t} style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{item.category}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* System Actions Match */}
          {systemActions.length > 0 && (
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '6px 12px' }}>
                QUICK SYSTEM ACTIONS
              </div>
              {systemActions.map((act, idx) => {
                const globalIdx = matchingItems.length + idx;
                const Icon = act.icon;
                const isSelected = selectedIndex === globalIdx;

                return (
                  <div
                    key={act.id}
                    onClick={() => {
                      act.action();
                      setIsCommandPaletteOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <Icon size={18} color={isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                    <span style={{ fontSize: '0.88rem', color: isSelected ? '#fff' : 'var(--text-secondary)' }}>
                      {act.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {totalResults === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              No matching commands or vault items found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
