import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Footprints, QrCode, Award, Trophy, MapPin, User, LogOut, Menu, X, Shield, Flame } from 'lucide-react';

export const Navbar = ({ onOpenScanner }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon">
            <Footprints size={20} strokeWidth={2.5} />
          </div>
          <span>SafeBridge</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-links" style={{ display: 'none', '@media (min-width: 900px)': { display: 'flex' } }}>
          {/* We will handle responsiveness cleanly with CSS classes */}
        </div>

        {/* Navigation items (Desktop) */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/bridges" className={`nav-link ${isActive('/bridges') ? 'active' : ''}`}>
            <MapPin size={17} />
            <span>FOB Bridges</span>
          </Link>
          <Link to="/rewards" className={`nav-link ${isActive('/rewards') ? 'active' : ''}`}>
            <Award size={17} />
            <span>Rewards</span>
          </Link>
          <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard') ? 'active' : ''}`}>
            <Trophy size={17} />
            <span>Leaderboard</span>
          </Link>

          {isAuthenticated && (
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
              <User size={17} />
              <span>Dashboard</span>
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
              <Shield size={17} color="var(--road-yellow)" />
              <span>Admin</span>
            </Link>
          )}

          {/* Quick Scanner Action Button */}
          <button
            id="nav-scan-qr-btn"
            className="btn btn-primary"
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.88rem' }}
            onClick={onOpenScanner}
            title="Scan physical QR code using camera"
          >
            <QrCode size={17} />
            <span>Scan QR</span>
          </button>

          {/* Points & Streak Indicator or Auth Buttons */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="points-pill" title="Current Points & Streak">
                {user?.currentStreak > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#f97316' }}>
                    <Flame size={14} fill="#f97316" /> {user.currentStreak}d
                  </span>
                )}
                <span>{user?.points || 0} pts</span>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                title="Log out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.45rem 0.85rem', fontSize: '0.88rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-signal-green" style={{ padding: '0.45rem 0.85rem', fontSize: '0.88rem' }}>
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            padding: '0.4rem',
          }}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-subtle)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <Link
            to="/bridges"
            className="nav-link"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.5rem 0' }}
          >
            <MapPin size={18} /> FOB Bridges Directory
          </Link>
          <Link
            to="/rewards"
            className="nav-link"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.5rem 0' }}
          >
            <Award size={18} /> Rewards Catalog
          </Link>
          <Link
            to="/leaderboard"
            className="nav-link"
            onClick={() => setMobileMenuOpen(false)}
            style={{ padding: '0.5rem 0' }}
          >
            <Trophy size={18} /> Leaderboard
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="nav-link"
                onClick={() => setMobileMenuOpen(false)}
                style={{ padding: '0.5rem 0' }}
              >
                <User size={18} /> My Dashboard ({user?.points || 0} pts)
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ padding: '0.5rem 0' }}
                >
                  <Shield size={18} /> Admin Console
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Link
                to="/login"
                className="btn btn-outline"
                onClick={() => setMobileMenuOpen(false)}
                style={{ width: '100%' }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-signal-green"
                onClick={() => setMobileMenuOpen(false)}
                style={{ width: '100%' }}
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
