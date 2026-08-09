import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Key, ShieldCheck, Eye, EyeOff, Sparkles, Mail, RefreshCw, AlertTriangle, ArrowLeft, CheckCircle2, Copy, Check } from 'lucide-react';

export default function MasterLockModal() {
  const { 
    isInitialized, 
    userEmail: savedUserEmail,
    signUpWithEmail, 
    loginWithEmail, 
    sendPasswordResetEmail,
    resetPasswordWithKey,
    setupDemoVault,
    wipeVault 
  } = useAuth();

  // Mode: 'login' | 'signup' | 'forgot' | 'resetWithKey'
  const [viewMode, setViewMode] = useState(isInitialized ? 'login' : 'signup');

  // Form State
  const [email, setEmail] = useState(savedUserEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [inputRecoveryKey, setInputRecoveryKey] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [generatedRecoveryKey, setGeneratedRecoveryKey] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [loading, setLoading] = useState(false);

  // Compute password strength
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return score;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(password || newPassword);
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong', 'Unbreakable'];
  const strengthColors = ['', 'var(--accent-rose)', 'var(--accent-amber)', 'var(--accent-cyan)', 'var(--accent-emerald)'];

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your master password.');
      return;
    }

    setLoading(true);
    try {
      const success = await loginWithEmail(email, password);
      if (!success) {
        setErrorMsg('Invalid Password. Master Key hash mismatch.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Master password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const recoveryCode = await signUpWithEmail(email, password);
      setGeneratedRecoveryKey(recoveryCode);
    } catch (err) {
      setErrorMsg(err.message || 'Sign up failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password (Send Email)
  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendPasswordResetEmail(email);
      setSuccessMsg(`📧 Password reset email dispatched to ${email}! Check your inbox or use your Recovery Key below.`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset with Recovery Key
  const handleResetWithKey = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !inputRecoveryKey || !newPassword) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const newKey = await resetPasswordWithKey(email, inputRecoveryKey, newPassword);
      setSuccessMsg(`Password successfully reset! Your new Recovery Key is: ${newKey}`);
    } catch (err) {
      setErrorMsg(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setLoading(true);
    try {
      await setupDemoVault();
    } catch (err) {
      setErrorMsg('Failed loading demo vault.');
    } finally {
      setLoading(false);
    }
  };

  const copyRecoveryKey = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '32px',
        position: 'relative',
        boxShadow: 'var(--glow-cyan), 0 20px 50px rgba(0,0,0,0.8)'
      }}>
        {/* Top Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'var(--grad-cyan-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px auto',
            boxShadow: '0 0 24px rgba(0, 242, 254, 0.4)'
          }}>
            <Lock size={26} color="#050a14" />
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>Vault Control Center</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
            {viewMode === 'login' && 'Sign in to decrypt zero-knowledge vault.'}
            {viewMode === 'signup' && 'Create encrypted account with Email & Master Password.'}
            {viewMode === 'forgot' && 'Reset your password via Email & Recovery Key.'}
            {viewMode === 'resetWithKey' && 'Enter Recovery Key to set a new password.'}
          </p>
        </div>

        {/* Evaluator Demo Fast-Track Pill */}
        <div style={{
          background: 'rgba(0, 242, 254, 0.08)',
          border: '1px dashed var(--accent-cyan)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.8rem', color: '#fff' }}>Evaluator Mode</span>
          </div>
          <button 
            type="button"
            onClick={handleDemoClick}
            disabled={loading}
            className="btn-secondary" 
            style={{ padding: '4px 10px', fontSize: '0.76rem' }}
          >
            {loading ? <RefreshCw size={12} className="spin" /> : 'Load Demo Vault'}
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            color: 'var(--accent-rose)',
            fontSize: '0.82rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            color: 'var(--accent-emerald)',
            fontSize: '0.82rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* VIEW 1: LOGIN FORM */}
        {viewMode === 'login' && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Account Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@iiitl.ac.in"
                  className="glass-input"
                  required
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Master Password</label>
                <button
                  type="button"
                  onClick={() => { setViewMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter master password..."
                  className="glass-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '16px', marginBottom: '12px' }} disabled={loading}>
              <Key size={18} />
              {loading ? 'Decrypting AES Key...' : 'Sign In & Unlock Vault'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setViewMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600 }}
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* VIEW 2: SIGN UP FORM */}
        {viewMode === 'signup' && (
          <form onSubmit={handleSignUp}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Account Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@iiitl.ac.in"
                  className="glass-input"
                  required
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Master Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create strong password..."
                  className="glass-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {password && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ display: 'flex', gap: '4px', height: '4px', marginBottom: '4px' }}>
                    {[1, 2, 3, 4].map(step => (
                      <div key={step} style={{ flex: 1, borderRadius: '99px', background: step <= strength ? strengthColors[strength] : 'rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: strengthColors[strength] }}>
                    Strength: {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Confirm Master Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password..."
                className="glass-input"
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '12px' }} disabled={loading}>
              <ShieldCheck size={18} />
              {loading ? 'Generating PBKDF2 Key...' : 'Create Account & Encrypt Vault'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => { setViewMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600 }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: FORGOT PASSWORD (EMAIL RESET) */}
        {viewMode === 'forgot' && (
          <div>
            <form onSubmit={handleSendResetEmail} style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Enter Account Email for Password Reset
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="registered.email@iiitl.ac.in"
                    className="glass-input"
                    required
                  />
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '12px' }} disabled={loading}>
                <Mail size={16} />
                {loading ? 'Dispatching Mail...' : 'Send Password Reset Email'}
              </button>
            </form>

            {/* Alternative: Reset with Recovery Key */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                Have a Backup Recovery Key?
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                If you saved your 16-character recovery key during signup, you can reset your password immediately.
              </p>
              <button
                type="button"
                onClick={() => { setViewMode('resetWithKey'); setErrorMsg(''); setSuccessMsg(''); }}
                className="btn-secondary"
                style={{ width: '100%', fontSize: '0.8rem', justifyContent: 'center' }}
              >
                Reset via Recovery Key
              </button>
            </div>

            <button
              type="button"
              onClick={() => { setViewMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </button>
          </div>
        )}

        {/* VIEW 4: RESET WITH RECOVERY KEY */}
        {viewMode === 'resetWithKey' && (
          <form onSubmit={handleResetWithKey}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Account Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="registered.email@iiitl.ac.in"
                className="glass-input"
                required
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Recovery Key Code
              </label>
              <input
                type="text"
                value={inputRecoveryKey}
                onChange={(e) => setInputRecoveryKey(e.target.value)}
                placeholder="KEY-ABCD-1234-EFGH"
                className="glass-input font-mono"
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                New Master Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new master password..."
                className="glass-input"
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', marginBottom: '12px' }} disabled={loading}>
              <Key size={16} />
              {loading ? 'Resetting Key...' : 'Reset Master Password'}
            </button>

            <button
              type="button"
              onClick={() => { setViewMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
