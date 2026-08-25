import React, { useState } from 'react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isUnlocked) {
    return <MasterLockModal />;
  }

  const filteredItems = items.filter(item => {
    if (activeCategory !== 'all' && activeCategory !== 'graph' && activeCategory !== 'security') {
      if (item.category !== activeCategory) return false;
    }
    if (selectedTag) {
      if (!item.tags || !item.tags.includes(selectedTag)) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchTags = item.tags && item.tags.some(t => t.toLowerCase().includes(q));
      const matchPlain = item.plainData && JSON.stringify(item.plainData).toLowerCase().includes(q);
      if (!matchTitle && !matchTags && !matchPlain) return false;
    }
    return true;
  });

  const handleSidebarChange = () => setIsSidebarOpen(false);

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarChange} />

      <div className="main-content">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="page-content">
          {activeCategory === 'graph' ? (
            <KnowledgeGraph />
          ) : activeCategory === 'security' ? (
            <SecurityAudit />
          ) : (
            <div>
              {selectedTag && (
                <div className="filter-pill">
                  <span>
                    Filtering by tag: <strong>{selectedTag}</strong>
                  </span>
                  <span className="filter-count">({filteredItems.length} entries found)</span>
                </div>
              )}

              {filteredItems.length > 0 ? (
                <div className="vault-grid">
                  {filteredItems.map(item => (
                    <VaultCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="glass-panel empty-state">
                  <div className="empty-state-icon">
                    <Shield size={32} color="var(--text-muted)" />
                  </div>
                  <h3>No Encrypted Items Found</h3>
                  <p>
                    {searchQuery || selectedTag
                      ? 'No entries match your search criteria or tag filter.'
                      : 'Your encrypted vault is empty. Click below to add your first note, credential, or code snippet.'}
                  </p>
                  <button
                    onClick={() => openNewItemModal('notes')}
                    className="btn-primary"
                  >
                    <Plus size={18} />
                    <span>Add First Vault Entry</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

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
