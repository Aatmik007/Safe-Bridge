import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Footprints, Lock, Mail, AlertCircle, ArrowRight, Smartphone } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('test@safebridge.app');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingIntent, setPendingIntent] = useState(null);

  const { login, getPendingScanIntent, clearPendingScanIntent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const intent = getPendingScanIntent();
    if (intent) {
      setPendingIntent(intent);
    }
  }, [getPendingScanIntent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);

      // Check if user landed from a deep-link scan intent
      const intent = getPendingScanIntent();
      if (intent && intent.bridgeId && intent.type) {
        clearPendingScanIntent();
        navigate(`/scan/${intent.bridgeId}/${intent.type}${intent.token ? `?token=${encodeURIComponent(intent.token)}` : ''}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2rem auto 4rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        {/* Brand Icon Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="brand-icon" style={{ width: '44px', height: '44px', margin: '0 auto 0.75rem' }}>
            <Footprints size={24} />
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.35rem' }}>Sign In to SafeBridge</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Earn points and build streaks for using foot over bridges
          </p>
        </div>

        {/* Pending Scan Intent Notice */}
        {pendingIntent && (
          <div
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid var(--road-yellow-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontSize: '0.85rem',
              color: 'var(--road-yellow-light)',
            }}
          >
            <Smartphone size={18} flexShrink={0} />
            <div>
              <strong>QR Scan Saved:</strong> Log in and we will automatically resume your bridge {pendingIntent.type} crossing without re-scanning!
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            style={{
              backgroundColor: 'var(--signal-red-bg)',
              border: '1px solid var(--signal-red-border)',
              color: 'var(--signal-red)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type="password"
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Demo account autofill pills */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
              Quick Demo Accounts:
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="badge badge-category"
                style={{ cursor: 'pointer', border: '1px solid var(--border-prominent)' }}
                onClick={() => {
                  setEmail('test@safebridge.app');
                  setPassword('Password123!');
                }}
              >
                Pedestrian (Alex)
              </button>
              <button
                type="button"
                className="badge badge-category"
                style={{ cursor: 'pointer', border: '1px solid var(--border-prominent)' }}
                onClick={() => {
                  setEmail('admin@safebridge.app');
                  setPassword('Admin@123456');
                }}
              >
                Admin Account
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            disabled={isLoading}
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center',
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
          }}
        >
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--road-yellow)', fontWeight: 600 }}>
            Create one free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
