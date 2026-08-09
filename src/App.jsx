import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VaultProvider, useVault } from './context/VaultContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CommandPalette from './components/layout/CommandPalette';
import MasterLockModal from './components/auth/MasterLockModal';
import VaultCard from './components/vault/VaultCard';
import VaultItemModal from './components/vault/VaultItemModal';
import KnowledgeGraph from './components/graph/KnowledgeGraph';
import SecurityAudit from './components/dashboard/SecurityAudit';
import { Shield, Plus } from 'lucide-react';
import './styles/index.css';

function MainVaultView() {
  const { isUnlocked } = useAuth();
  const { items, activeCategory, selectedTag, searchQuery, openNewItemModal } = useVault();

  if (!isUnlocked) {
    return <MasterLockModal />;
  }

  // Filter items
  const filteredItems = items.filter(item => {
    // Filter by Category
    if (activeCategory !== 'all' && activeCategory !== 'graph' && activeCategory !== 'security') {
      if (item.category !== activeCategory) return false;
    }
    // Filter by Tag
    if (selectedTag) {
      if (!item.tags || !item.tags.includes(selectedTag)) return false;
    }
    // Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchTags = item.tags && item.tags.some(t => t.toLowerCase().includes(q));
      const matchPlain = item.plainData && JSON.stringify(item.plainData).toLowerCase().includes(q);
      if (!matchTitle && !matchTags && !matchPlain) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        paddingTop: 'calc(var(--header-height) + 24px)',
        paddingLeft: '28px',
        paddingRight: '28px',
        paddingBottom: '40px',
        minHeight: '100vh'
      }}>
        {/* Top Floating Header */}
        <Header />

        {/* Dynamic Viewport */}
        {activeCategory === 'graph' ? (
          <KnowledgeGraph />
        ) : activeCategory === 'security' ? (
          <SecurityAudit />
        ) : (
          <div>
            {/* Filter Pill Header */}
            {selectedTag && (
              <div style={{
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(0, 242, 254, 0.08)',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 16px'
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                  Filtering by tag: <strong>{selectedTag}</strong>
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ({filteredItems.length} entries found)
                </span>
              </div>
            )}

            {/* Grid of Cards */}
            {filteredItems.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px'
              }}>
                {filteredItems.map(item => (
                  <VaultCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              /* Empty View State */
              <div className="glass-panel" style={{
                padding: '60px 20px',
                textAlign: 'center',
                maxWidth: '480px',
                margin: '40px auto'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}>
                  <Shield size={32} color="var(--text-muted)" />
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#fff' }}>
                  No Encrypted Items Found
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  {searchQuery || selectedTag 
                    ? 'No entries match your search criteria or tag filter.' 
                    : 'Your encrypted vault is empty. Click below to add your first note, credential, or code snippet.'}
                </p>
                <button
                  onClick={() => openNewItemModal('notes')}
                  className="btn-primary"
                  style={{ margin: '0 auto' }}
                >
                  <Plus size={18} />
                  <span>Add First Vault Entry</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Modals */}
      <CommandPalette />
      <VaultItemModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <VaultProvider>
        <MainVaultView />
      </VaultProvider>
    </AuthProvider>
  );
}
