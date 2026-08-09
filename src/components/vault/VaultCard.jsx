import React, { useState } from 'react';
import { useVault } from '../../context/VaultContext';
import { 
  FileText, 
  Key, 
  Code, 
  Bookmark, 
  Star, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Tag 
} from 'lucide-react';

export default function VaultCard({ item }) {
  const { toggleFavorite, deleteItem, openEditModal } = useVault();
  
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  const getCategoryTheme = (cat) => {
    switch (cat) {
      case 'notes': return { icon: FileText, badge: 'badge-cyan', color: 'var(--accent-cyan)' };
      case 'credentials': return { icon: Key, badge: 'badge-rose', color: 'var(--accent-rose)' };
      case 'snippets': return { icon: Code, badge: 'badge-violet', color: '#c084fc' };
      case 'bookmarks': return { icon: Bookmark, badge: 'badge-emerald', color: 'var(--accent-emerald)' };
      default: return { icon: FileText, badge: 'badge-cyan', color: 'var(--accent-cyan)' };
    }
  };

  const theme = getCategoryTheme(item.category);
  const CategoryIcon = theme.icon;

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const data = item.plainData || {};

  return (
    <div className="glass-panel glass-card-interactive" style={{ padding: '20px', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CategoryIcon size={16} color={theme.color} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>{item.title}</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Updated {new Date(item.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Favorite & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => toggleFavorite(item.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: item.isFavorite ? 'var(--accent-amber)' : 'var(--text-muted)',
              padding: '4px'
            }}
          >
            <Star size={16} fill={item.isFavorite ? 'var(--accent-amber)' : 'none'} />
          </button>
          <button
            onClick={() => openEditModal(item)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={() => deleteItem(item.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Category Content Renderer */}
      <div style={{ marginBottom: '16px' }}>
        {/* CREDENTIALS CATEGORY */}
        {item.category === 'credentials' && (
          <div style={{
            background: 'rgba(10, 14, 22, 0.6)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            border: '1px solid var(--border-subtle)'
          }}>
            {data.username && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Username:</span>
                <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{data.username}</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Key/Secret:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  color: showSecret ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  letterSpacing: showSecret ? '0' : '2px'
                }}>
                  {showSecret ? data.secretKey : '••••••••••••••••'}
                </span>
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={() => handleCopy(data.secretKey)}
                  className="btn-secondary"
                  style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                >
                  {copied ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            {data.serviceUrl && (
              <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <a href={data.serviceUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span>{data.serviceUrl}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        )}

        {/* NOTES CATEGORY */}
        {item.category === 'notes' && (
          <div style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            whiteSpace: 'pre-wrap',
            maxHeight: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: '1.6'
          }}>
            {data.content || 'No text note content.'}
          </div>
        )}

        {/* SNIPPETS CATEGORY */}
        {item.category === 'snippets' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="badge badge-violet" style={{ fontSize: '0.65rem' }}>{data.language || 'code'}</span>
              <button
                onClick={() => handleCopy(data.code)}
                className="btn-secondary"
                style={{ padding: '3px 8px', fontSize: '0.72rem' }}
              >
                {copied ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre style={{
              background: '#07090e',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              fontSize: '0.8rem',
              color: 'var(--accent-cyan)',
              maxHeight: '120px',
              overflow: 'hidden',
              fontFamily: 'var(--font-mono)'
            }}>
              <code>{data.code || '// Empty code snippet'}</code>
            </pre>
          </div>
        )}

        {/* BOOKMARKS CATEGORY */}
        {item.category === 'bookmarks' && (
          <div>
            <a 
              href={data.url} 
              target="_blank" 
              rel="noreferrer" 
              style={{ fontSize: '0.9rem', color: 'var(--accent-blue)', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}
            >
              <span>{data.url}</span>
              <ExternalLink size={14} />
            </a>
            {data.notes && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{data.notes}</div>
            )}
          </div>
        )}
      </div>

      {/* Footer Tags */}
      {item.tags && item.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {item.tags.map(tag => (
            <span key={tag} className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
              <Tag size={10} />
              <span>{tag}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
