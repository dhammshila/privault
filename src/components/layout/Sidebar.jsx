import React from 'react';
import { useVault } from '../../context/VaultContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Shield, 
  FileText, 
  Key, 
  Code, 
  Bookmark, 
  Network, 
  ShieldAlert, 
  Lock, 
  Tag, 
  Sparkles,
  Layers,
  User,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const { 
    items, 
    activeCategory, 
    setActiveCategory, 
    selectedTag, 
    setSelectedTag,
    allTags 
  } = useVault();

  const { lockVault, userEmail, isDemoMode } = useAuth();

  const counts = {
    all: items.length,
    notes: items.filter(i => i.category === 'notes').length,
    credentials: items.filter(i => i.category === 'credentials').length,
    snippets: items.filter(i => i.category === 'snippets').length,
    bookmarks: items.filter(i => i.category === 'bookmarks').length,
  };

  const navItems = [
    { id: 'all', label: 'All Vault Items', icon: Layers, count: counts.all },
    { id: 'notes', label: 'Secure Notes', icon: FileText, count: counts.notes },
    { id: 'credentials', label: 'API Keys & Passwords', icon: Key, count: counts.credentials },
    { id: 'snippets', label: 'Code Snippets', icon: Code, count: counts.snippets },
    { id: 'bookmarks', label: 'Bookmarks & Links', icon: Bookmark, count: counts.bookmarks },
    { id: 'graph', label: 'Knowledge Graph', icon: Network },
    { id: 'security', label: 'Security Health Audit', icon: ShieldAlert },
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      background: 'rgba(10, 14, 22, 0.85)',
      backdropFilter: 'var(--backdrop-blur)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 14px',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100
    }}>
      {/* Brand Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 8px 18px 8px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '16px'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--grad-cyan-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--glow-cyan)'
        }}>
          <Shield size={22} color="#050a14" />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#fff' }}>
            VAULT <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}>v1.0</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Zero-Knowledge Core
          </div>
        </div>
      </div>

      {/* Demo Badge */}
      {isDemoMode && (
        <div style={{
          margin: '0 4px 14px 4px',
          padding: '6px 10px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          color: 'var(--accent-amber)'
        }}>
          <Sparkles size={14} />
          <span>Demo Data Loaded</span>
        </div>
      )}

      {/* Navigation Modules */}
      <nav style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px', paddingLeft: '8px' }}>
          VAULT MODULES
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeCategory === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveCategory(item.id);
                    setSelectedTag(null);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: isActive ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                    color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={18} />
                    <span style={{ fontSize: '0.86rem' }}>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '2px 7px',
                      borderRadius: '99px',
                      background: isActive ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                      color: isActive ? '#fff' : 'var(--text-muted)'
                    }}>
                      {item.count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              fontSize: '0.7rem', 
              fontWeight: 700, 
              color: 'var(--text-muted)', 
              letterSpacing: '0.05em', 
              marginBottom: '10px', 
              paddingLeft: '8px' 
            }}>
              <span>TAG FILTER</span>
              {selectedTag && (
                <button 
                  onClick={() => setSelectedTag(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontSize: '0.7rem' }}
                >
                  Clear
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '0 4px' }}>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`badge ${selectedTag === tag ? 'badge-cyan' : ''}`}
                  style={{
                    background: selectedTag === tag ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: selectedTag === tag ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    fontSize: '0.72rem'
                  }}
                >
                  <Tag size={10} />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* User Footer Profile & Lock */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: 'auto' }}>
        {userEmail && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '10px',
            padding: '6px 8px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.03)'
          }}>
            <User size={16} color="var(--accent-cyan)" />
            <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.78rem', color: '#fff' }}>
              {userEmail}
            </div>
          </div>
        )}

        <button
          onClick={lockVault}
          className="btn-secondary"
          style={{ width: '100%', justifyContent: 'center', color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.3)', padding: '8px' }}
        >
          <LogOut size={15} />
          <span>Lock / Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
