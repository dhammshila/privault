import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, AlertTriangle, CheckCircle2, KeyRound, ArrowLeft } from 'lucide-react';
import { hashPassword, deriveKey } from '../../utils/crypto';
import {
  generateSaltHex,
  saveVaultSalt,
  saveVaultAuthHash,
  getVaultUserEmail,
  clearVaultData,
} from '../../utils/storage';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const savedEmail = getVaultUserEmail();

  // Password strength
  const getStrength = (p) => {
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const strength = getStrength(newPassword);
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#00f2fe'][strength];

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Clear old vault data (items encrypted with old key are unrecoverable)
      clearVaultData();

      // Create fresh vault with new password
      const newSalt = generateSaltHex();
      const newHash = await hashPassword(newPassword, newSalt);

      saveVaultSalt(newSalt);
      saveVaultAuthHash(newHash);
      if (savedEmail) {
        localStorage.setItem('vault_user_email_v1', savedEmail);
      }

      setDone(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 20% 50%, rgba(0,81,255,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,242,254,0.08) 0%, transparent 50%), #050a14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '24px',
        padding: '40px 36px',
        boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
      }}>

        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px', height: '64px',
            borderRadius: '20px',
            background: done
              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
              : 'linear-gradient(135deg, #00f2fe, #0051ff)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            boxShadow: done
              ? '0 0 32px rgba(34,197,94,0.4)'
              : '0 0 32px rgba(0,242,254,0.3)',
          }}>
            {done ? <CheckCircle2 size={30} color="#fff" /> : <KeyRound size={30} color="#fff" />}
          </div>

          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
            {done ? 'Password Reset!' : 'Reset Master Password'}
          </h1>
          <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            {done
              ? 'Your new master password has been set. You can now sign in.'
              : savedEmail
                ? `Resetting vault for ${savedEmail}`
                : 'Set a new master password for your vault'
            }
          </p>
        </div>

        {/* Success state */}
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              color: '#86efac',
              fontSize: '0.85rem',
              lineHeight: '1.6',
            }}>
              ✅ Your vault has been reset with the new password.<br />
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                Note: Previous vault items could not be recovered (zero-knowledge design).
              </span>
            </div>
            <a
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '14px',
                background: 'linear-gradient(135deg, #00f2fe, #0051ff)',
                color: '#050a14',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              <Lock size={18} />
              Go to Vault — Sign In
            </a>
          </div>
        ) : (
          <>
            {/* Warning */}
            <div style={{
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.25)',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '24px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
            }}>
              <AlertTriangle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ color: '#fbbf24', fontSize: '0.8rem', lineHeight: '1.5' }}>
                <strong>Your encrypted vault items will be wiped.</strong> This is by design — the old items were encrypted with your previous password and cannot be recovered without it.
              </span>
            </div>

            <form onSubmit={handleReset}>
              {/* New Password */}
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '6px' }}>
                New Master Password
              </label>
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new master password"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#64748b', padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength bar */}
              {newPassword && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '3px', borderRadius: '2px',
                        background: i <= strength ? strengthColor : 'rgba(255,255,255,0.08)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}

              {/* Confirm Password */}
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.82rem', marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new master password"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${confirmPassword && confirmPassword !== newPassword ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  marginBottom: '20px',
                }}
              />

              {/* Error */}
              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#fca5a5',
                  fontSize: '0.82rem',
                  marginBottom: '16px',
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                }}>
                  <AlertTriangle size={14} />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: loading || !newPassword || !confirmPassword
                    ? 'rgba(255,255,255,0.05)'
                    : 'linear-gradient(135deg, #00f2fe, #0051ff)',
                  color: loading || !newPassword || !confirmPassword ? '#64748b' : '#050a14',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: loading || !newPassword || !confirmPassword ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '16px', height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    Resetting vault...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Reset Master Password
                  </>
                )}
              </button>
            </form>

            {/* Back link */}
            <a
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '20px',
                color: '#64748b',
                fontSize: '0.82rem',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={14} />
              Back to Sign In
            </a>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #334155; }
        input:focus { border-color: rgba(0,242,254,0.4) !important; box-shadow: 0 0 0 3px rgba(0,242,254,0.08); }
      `}</style>
    </div>
  );
}
