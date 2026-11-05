import React, { useState } from 'react';
import { adminFetch, setCsrfToken } from './adminApi';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (email: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await adminFetch('/api/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.success && data.csrfToken) {
        setCsrfToken(data.csrfToken);
        onLoginSuccess(data.email);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--admin-bg)',
        padding: '20px',
      }}
    >
      <div
        className="admin-card"
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '36px 30px',
          boxShadow: 'var(--admin-shadow-lg)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img
            src="/logo.png"
            alt="Amol Veg Resto"
            style={{ width: '64px', height: '64px', borderRadius: '12px', marginBottom: '14px' }}
          />
          <h1 className="admin-heading-serif" style={{ fontSize: '24px', margin: '0 0 6px 0' }}>
            Owner Portal
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--admin-text-muted)', margin: 0 }}>
            Sign in to manage menus, content and reviews
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--admin-danger-soft)',
              color: 'var(--admin-danger)',
              borderRadius: 'var(--admin-radius-md)',
              fontSize: '13.5px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              marginBottom: '20px',
              lineHeight: 1.4,
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-label">Owner Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="admin-input"
                style={{ paddingLeft: '40px' }}
                autoComplete="email"
              />
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '13px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--admin-text-dim)',
                }}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="admin-input"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                autoComplete="current-password"
              />
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '13px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--admin-text-dim)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--admin-text-dim)',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn admin-btn-primary"
            style={{ width: '100%', marginTop: '10px' }}
          >
            {loading ? 'Verifying Credentials...' : 'Sign In to Admin'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <a
            href="/"
            style={{
              fontSize: '13px',
              color: 'var(--admin-text-muted)',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            ← Back to Public Website
          </a>
        </div>
      </div>
    </div>
  );
};

