import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Mail,
  RefreshCw,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

export default function MasterLockModal() {
  const {
    isInitialized,
    userEmail: savedUserEmail,
    signUpWithEmail,
    loginWithEmail,
    sendPasswordResetEmail,
    setupDemoVault
  } = useAuth();

  // Modes: login | signup | forgot
  const [viewMode, setViewMode] = useState(
    isInitialized ? 'login' : 'signup'
  );

  // Form State
  const [email, setEmail] = useState(savedUserEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [duplicateAccount, setDuplicateAccount] = useState(false); // tracks duplicate email error

  // Password strength
  const getPasswordStrength = (pass) => {
    let score = 0;

    if (!pass) return score;

    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    return score;
  };

  const strength = getPasswordStrength(password);

  const strengthLabels = [
    '',
    'Weak',
    'Fair',
    'Strong',
    'Unbreakable'
  ];

  const strengthColors = [
    '',
    'var(--accent-rose)',
    'var(--accent-amber)',
    'var(--accent-cyan)',
    'var(--accent-emerald)'
  ];

  // -------------------------
  // LOGIN
  // -------------------------
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

  // -------------------------
  // SIGN UP
  // -------------------------
  const handleSignUp = async (e) => {
    e.preventDefault();

    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg(
        'Master password must be at least 6 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await signUpWithEmail(email, password);
    } catch (err) {
      const msg = err.message || 'Sign up failed.';
      // Check if it's a duplicate account error
      if (
        msg.toLowerCase().includes('already exists') ||
        msg.toLowerCase().includes('already has a vault') ||
        msg.includes('sign in instead') ||
        msg.includes('409')
      ) {
        setDuplicateAccount(true);
        setErrorMsg(msg);
      } else {
        setDuplicateAccount(false);
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // FORGOT PASSWORD
  // -------------------------
  const handleSendResetEmail = async (e) => {
    e.preventDefault();

    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(email);

      setSuccessMsg(
        `📧 Password reset email sent to ${email}. Check your inbox for instructions.`
      );
    } catch (err) {
      const msg = err.message || '';
      // Show the exact server message — it now always comes back as JSON
      // Add a helpful note for RESEND_API_KEY not configured
      if (msg.toLowerCase().includes('resend_api_key') || msg.toLowerCase().includes('not configured') || msg.toLowerCase().includes('environment')) {
        setErrorMsg('⚙️ Email service setup incomplete. Please add RESEND_API_KEY to Vercel environment variables to enable password reset emails.');
      } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('failed to fetch')) {
        setErrorMsg('🌐 Network error. Please check your internet connection and try again.');
      } else if (msg) {
        setErrorMsg(msg);
      } else {
        setErrorMsg('Failed to send password reset email. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // DEMO VAULT
  // -------------------------
  const handleDemoClick = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await setupDemoVault();
    } catch (err) {
      setErrorMsg('Failed loading demo vault.');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // CHANGE VIEW
  // -------------------------
  const changeView = (mode) => {
    setViewMode(mode);
    setErrorMsg('');
    setSuccessMsg('');
    setPassword('');
    setConfirmPassword('');
    setDuplicateAccount(false);
  };

  return (
    <div className="modal-overlay">
      <div
        className="glass-panel animate-fade-in auth-modal-panel"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '32px',
          position: 'relative',
          boxShadow:
            'var(--glow-cyan), 0 20px 50px rgba(0,0,0,0.8)'
        }}
      >

        {/* -------------------------
            HEADER
        ------------------------- */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '20px'
          }}
        >
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'var(--grad-cyan-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto',
              boxShadow:
                '0 0 24px rgba(0, 242, 254, 0.4)'
            }}
          >
            <Lock
              size={26}
              color="#050a14"
            />
          </div>

          <h2
            style={{
              fontSize: '1.4rem',
              marginBottom: '4px'
            }}
          >
            Vault Control Center
          </h2>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.84rem'
            }}
          >
            {viewMode === 'login' &&
              'Sign in to decrypt zero-knowledge vault.'}

            {viewMode === 'signup' &&
              'Create encrypted account with Email & Master Password.'}

            {viewMode === 'forgot' &&
              'Reset your master password using your registered email.'}
          </p>
        </div>

        {/* -------------------------
            DEMO MODE
        ------------------------- */}
        <div
          style={{
            background: 'rgba(0, 242, 254, 0.08)',
            border:
              '1px dashed var(--accent-cyan)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Sparkles
              size={16}
              color="var(--accent-cyan)"
            />

            <span
              style={{
                fontSize: '0.8rem',
                color: '#fff'
              }}
            >
              Evaluator Mode
            </span>
          </div>

          <button
            type="button"
            onClick={handleDemoClick}
            disabled={loading}
            className="btn-secondary"
            style={{
              padding: '4px 10px',
              fontSize: '0.76rem'
            }}
          >
            {loading ? (
              <RefreshCw
                size={12}
                className="spin"
              />
            ) : (
              'Load Demo Vault'
            )}
          </button>
        </div>

        {/* -------------------------
            ERROR
        ------------------------- */}
        {errorMsg && (
          <div
            style={{
              background: duplicateAccount
                ? 'rgba(251, 191, 36, 0.10)'
                : 'rgba(244, 63, 94, 0.12)',
              border: duplicateAccount
                ? '1px solid rgba(251, 191, 36, 0.4)'
                : '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              color: duplicateAccount
                ? 'var(--accent-amber)'
                : 'var(--accent-rose)',
              fontSize: '0.82rem',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{errorMsg}</span>
            </div>

            {/* Duplicate account: show quick "Sign In" action */}
            {duplicateAccount && (
              <button
                type="button"
                onClick={() => changeView('login')}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  padding: '8px 12px',
                  background: 'rgba(251, 191, 36, 0.15)',
                  border: '1px solid rgba(251, 191, 36, 0.5)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--accent-amber)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Key size={14} />
                Sign In to Existing Account →
              </button>
            )}
          </div>
        )}

        {/* -------------------------
            SUCCESS
        ------------------------- */}
        {successMsg && (
          <div
            style={{
              background:
                'rgba(16, 185, 129, 0.12)',
              border:
                '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              color: 'var(--accent-emerald)',
              fontSize: '0.82rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ==================================================
            LOGIN
        ================================================== */}
        {viewMode === 'login' && (
          <form onSubmit={handleLogin}>

            {/* Email */}
            <div style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px'
                }}
              >
                Account Email
              </label>

              <div
                style={{
                  position: 'relative'
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  className="glass-input"
                  required
                />

                <Mail
                  size={16}
                  color="var(--text-muted)"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform:
                      'translateY(-50%)'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '6px'
                }}
              >
                <label
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  Master Password
                </label>

                <button
                  type="button"
                  onClick={() =>
                    changeView('forgot')
                  }
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-cyan)',
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <div
                style={{
                  position: 'relative'
                }}
              >
                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter master password..."
                  className="glass-input"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform:
                      'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                marginTop: '16px',
                marginBottom: '12px'
              }}
              disabled={loading}
            >
              <Key size={18} />

              {loading
                ? 'Decrypting AES Key...'
                : 'Sign In & Unlock Vault'}
            </button>

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.76rem'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <span>or continue with</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setErrorMsg('Google Sign-In coming soon. Use email & password for now.');
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '11px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.88rem',
                cursor: 'pointer',
                marginBottom: '14px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.4 7 29.5 5 24 5 13 5 4 14 4 25s9 20 20 20 20-9 20-20c0-1.2-.1-2.3-.4-3.5z" fill="#FFC107"/>
                <path d="M6.3 15.2l6.6 4.8C14.6 16.5 19 14 24 14c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.4 8 29.5 6 24 6 16.3 6 9.6 9.7 6.3 15.2z" fill="#FF3D00"/>
                <path d="M24 44c5.4 0 10.2-1.9 13.9-5.1l-6.4-5.4C29.6 35.4 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.1C9.3 37.6 16.1 44 24 44z" fill="#4CAF50"/>
                <path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.4 5.4C41.9 35.6 44 30.7 44 25c0-1.2-.1-2.3-.4-3.5z" fill="#1976D2"/>
              </svg>
              Continue with Google
            </button>

            {/* Create Account */}
            <div
              style={{
                textAlign: 'center',
                fontSize: '0.82rem',
                color: 'var(--text-muted)'
              }}
            >
              Don't have an account?{' '}

              <button
                type="button"
                onClick={() =>
                  changeView('signup')
                }
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* ==================================================
            SIGN UP
        ================================================== */}
        {viewMode === 'signup' && (
          <form onSubmit={handleSignUp}>

            {/* Email */}
            <div style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px'
                }}
              >
                Account Email
              </label>

              <div
                style={{
                  position: 'relative'
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="Enter your email"
                  className="glass-input"
                  required
                />

                <Mail
                  size={16}
                  color="var(--text-muted)"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform:
                      'translateY(-50%)'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px'
                }}
              >
                Master Password
              </label>

              <div
                style={{
                  position: 'relative'
                }}
              >
                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Create strong password..."
                  className="glass-input"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform:
                      'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>

              {/* Password Strength */}
              {password && (
                <div
                  style={{
                    marginTop: '6px'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '4px',
                      height: '4px',
                      marginBottom: '4px'
                    }}
                  >
                    {[1, 2, 3, 4].map(
                      (step) => (
                        <div
                          key={step}
                          style={{
                            flex: 1,
                            borderRadius: '99px',
                            background:
                              step <= strength
                                ? strengthColors[
                                    strength
                                  ]
                                : 'rgba(255,255,255,0.1)'
                          }}
                        />
                      )
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '0.72rem',
                      color:
                        strengthColors[strength]
                    }}
                  >
                    Strength:{' '}
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '16px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px'
                }}
              >
                Confirm Master Password
              </label>

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Re-enter password..."
                className="glass-input"
                required
              />
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                marginBottom: '12px'
              }}
              disabled={loading}
            >
              <ShieldCheck size={18} />

              {loading
                ? 'Generating PBKDF2 Key...'
                : 'Create Account & Encrypt Vault'}
            </button>

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.76rem'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
              <span>or continue with</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Google Sign Up */}
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setErrorMsg('Google Sign-In coming soon. Use email & password for now.');
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '11px 16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.88rem',
                cursor: 'pointer',
                marginBottom: '14px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.4 7 29.5 5 24 5 13 5 4 14 4 25s9 20 20 20 20-9 20-20c0-1.2-.1-2.3-.4-3.5z" fill="#FFC107"/>
                <path d="M6.3 15.2l6.6 4.8C14.6 16.5 19 14 24 14c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.4 8 29.5 6 24 6 16.3 6 9.6 9.7 6.3 15.2z" fill="#FF3D00"/>
                <path d="M24 44c5.4 0 10.2-1.9 13.9-5.1l-6.4-5.4C29.6 35.4 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.1C9.3 37.6 16.1 44 24 44z" fill="#4CAF50"/>
                <path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.4 5.4C41.9 35.6 44 30.7 44 25c0-1.2-.1-2.3-.4-3.5z" fill="#1976D2"/>
              </svg>
              Sign up with Google
            </button>

            {/* Sign In */}
            <div
              style={{
                textAlign: 'center',
                fontSize: '0.82rem',
                color: 'var(--text-muted)'
              }}
            >
              Already registered?{' '}

              <button
                type="button"
                onClick={() =>
                  changeView('login')
                }
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-cyan)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* ==================================================
            FORGOT PASSWORD
        ================================================== */}
        {viewMode === 'forgot' && (
          <div>

            <form
              onSubmit={handleSendResetEmail}
              style={{
                marginBottom: '16px'
              }}
            >
              <div
                style={{
                  marginBottom: '16px'
                }}
              >
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '6px'
                  }}
                >
                  Enter Account Email
                </label>

                <div
                  style={{
                    position: 'relative'
                  }}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Enter your email"
                    className="glass-input"
                    required
                  />

                  <Mail
                    size={16}
                    color="var(--text-muted)"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform:
                        'translateY(-50%)'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{
                  width: '100%',
                  marginBottom: '12px'
                }}
                disabled={loading}
              >
                <Mail size={16} />

                {loading
                  ? 'Sending Reset Email...'
                  : 'Send Password Reset Email'}
              </button>
            </form>

            {/* Back to Sign In */}
            <button
              type="button"
              onClick={() =>
                changeView('login')
              }
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: '0 auto'
              }}
            >
              <ArrowLeft size={14} />

              <span>
                Back to Sign In
              </span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}