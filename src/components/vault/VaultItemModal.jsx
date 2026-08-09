import React, { useState, useEffect } from 'react';
import { useVault } from '../../context/VaultContext';
import { FileText, Key, Code, Bookmark, X, Save } from 'lucide-react';

export default function VaultItemModal() {
  const { isItemModalOpen, editingItem, closeModal, addItem, updateItem } = useVault();

  const [category, setCategory] = useState('notes');
  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Category specific state
  const [noteContent, setNoteContent] = useState('');
  const [credUsername, setCredUsername] = useState('');
  const [credSecretKey, setCredSecretKey] = useState('');
  const [credServiceUrl, setCredServiceUrl] = useState('');
  const [snippetLanguage, setSnippetLanguage] = useState('javascript');
  const [snippetCode, setSnippetCode] = useState('');
  const [bookmarkUrl, setBookmarkUrl] = useState('');
  const [bookmarkNotes, setBookmarkNotes] = useState('');

  useEffect(() => {
    if (editingItem) {
      setCategory(editingItem.category || 'notes');
      setTitle(editingItem.title || '');
      setTagsInput(editingItem.tags ? editingItem.tags.join(', ') : '');

      const plain = editingItem.plainData || {};
      setNoteContent(plain.content || '');
      setCredUsername(plain.username || '');
      setCredSecretKey(plain.secretKey || '');
      setCredServiceUrl(plain.serviceUrl || '');
      setSnippetLanguage(plain.language || 'javascript');
      setSnippetCode(plain.code || '');
      setBookmarkUrl(plain.url || '');
      setBookmarkNotes(plain.notes || '');
    } else {
      setCategory('notes');
      setTitle('');
      setTagsInput('#iiitl, #react');
      setNoteContent('');
      setCredUsername('');
      setCredSecretKey('');
      setCredServiceUrl('');
      setSnippetLanguage('javascript');
      setSnippetCode('');
      setBookmarkUrl('');
      setBookmarkNotes('');
    }
  }, [editingItem, isItemModalOpen]);

  if (!isItemModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)
      .map(t => (t.startsWith('#') ? t : `#${t}`));

    let plainData = {};
    if (category === 'notes') {
      plainData = { content: noteContent };
    } else if (category === 'credentials') {
      plainData = { username: credUsername, secretKey: credSecretKey, serviceUrl: credServiceUrl };
    } else if (category === 'snippets') {
      plainData = { language: snippetLanguage, code: snippetCode };
    } else if (category === 'bookmarks') {
      plainData = { url: bookmarkUrl, notes: bookmarkNotes };
    }

    if (editingItem && editingItem.id) {
      updateItem(editingItem.id, {
        category,
        title,
        tags: parsedTags,
        plainData
      });
    } else {
      addItem({
        category,
        title,
        tags: parsedTags,
        plainData
      });
    }

    closeModal();
  };

  const categories = [
    { id: 'notes', label: 'Note', icon: FileText },
    { id: 'credentials', label: 'Credential', icon: Key },
    { id: 'snippets', label: 'Snippet', icon: Code },
    { id: 'bookmarks', label: 'Bookmark', icon: Bookmark },
  ];

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div 
        className="glass-panel animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '540px',
          width: '100%',
          padding: '28px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: 'var(--glow-cyan), 0 20px 50px rgba(0,0,0,0.8)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
            {editingItem?.id ? 'Edit Vault Entry' : 'Create New Encrypted Entry'}
          </h2>
          <button 
            onClick={closeModal}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {categories.map(cat => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;

              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    fontSize: '0.8rem',
                    background: isSelected ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                    color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)'
                  }}
                >
                  <Icon size={15} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Entry Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AWS Secret Token, Project Blueprint..."
              className="glass-input"
              required
            />
          </div>

          {/* CATEGORY FORM FIELDS */}
          {category === 'notes' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Note Content (Markdown supported)
              </label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write encrypted personal notes..."
                className="glass-input"
                style={{ height: '120px', resize: 'vertical' }}
                required
              />
            </div>
          )}

          {category === 'credentials' && (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Username / Identifier
                </label>
                <input
                  type="text"
                  value={credUsername}
                  onChange={(e) => setCredUsername(e.target.value)}
                  placeholder="e.g. admin@iiitl.ac.in"
                  className="glass-input"
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Secret Key / Password
                </label>
                <input
                  type="text"
                  value={credSecretKey}
                  onChange={(e) => setCredSecretKey(e.target.value)}
                  placeholder="e.g. ghp_secretKeyToken2026..."
                  className="glass-input font-mono"
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Service URL
                </label>
                <input
                  type="url"
                  value={credServiceUrl}
                  onChange={(e) => setCredServiceUrl(e.target.value)}
                  placeholder="e.g. https://github.com"
                  className="glass-input"
                />
              </div>
            </>
          )}

          {category === 'snippets' && (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Programming Language
                </label>
                <select
                  value={snippetLanguage}
                  onChange={(e) => setSnippetLanguage(e.target.value)}
                  className="glass-input"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="sql">SQL</option>
                  <option value="html">HTML/CSS</option>
                  <option value="json">JSON</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Code Snippet
                </label>
                <textarea
                  value={snippetCode}
                  onChange={(e) => setSnippetCode(e.target.value)}
                  placeholder="// Paste code snippet..."
                  className="glass-input font-mono"
                  style={{ height: '130px', resize: 'vertical', fontSize: '0.82rem' }}
                  required
                />
              </div>
            </>
          )}

          {category === 'bookmarks' && (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Bookmark URL
                </label>
                <input
                  type="url"
                  value={bookmarkUrl}
                  onChange={(e) => setBookmarkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="glass-input"
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Notes / Context
                </label>
                <input
                  type="text"
                  value={bookmarkNotes}
                  onChange={(e) => setBookmarkNotes(e.target.value)}
                  placeholder="Key takeaways or summary..."
                  className="glass-input"
                />
              </div>
            </>
          )}

          {/* Tags Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. #iiitl, #react, #api"
              className="glass-input"
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={closeModal} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save size={16} />
              <span>{editingItem?.id ? 'Save Changes' : 'Encrypt & Save'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
