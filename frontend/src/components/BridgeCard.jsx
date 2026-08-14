import React, { useState, useEffect } from 'react';
import {
  MapPin,
  QrCode,
  Clock,
  ShieldCheck,
  Footprints,
  Navigation,
  Sparkles,
  Flame,
  AlertTriangle,
  Send,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const BridgeCard = ({ bridge, onOpenQrModal, onStartDirect }) => {
  const { user, isAuthenticated } = useAuth();
  const [remainingMs, setRemainingMs] = useState(bridge.cooldown?.cooldownRemainingMs || 0);

  // Citizen Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [issueType, setIssueType] = useState('Lighting');
  const [reportNote, setReportNote] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    setRemainingMs(bridge.cooldown?.cooldownRemainingMs || 0);
  }, [bridge.cooldown?.cooldownRemainingMs]);

  useEffect(() => {
    if (remainingMs <= 0) return;

    const timer = setInterval(() => {
      setRemainingMs((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingMs]);

  const isAvailable = remainingMs <= 0;

  const formatCountdown = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to report a bridge safety or maintenance issue.');
      return;
    }
    setReportSubmitting(true);
    try {
      await api.bridges.report(bridge._id, issueType, reportNote);
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setReportModalOpen(false);
        setReportNote('');
      }, 2000);
    } catch (err) {
      alert(err.message || 'Failed to submit maintenance report');
    } finally {
      setReportSubmitting(false);
    }
  };

  // Google Maps navigation URL for exact bridge coordinates
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${bridge.latitude},${bridge.longitude}`;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Badge Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span className="badge badge-category">
            <MapPin size={11} /> {bridge.city}
          </span>
          <span
            className="badge"
            style={{
              backgroundColor: 'rgba(249, 115, 22, 0.15)',
              color: '#fb923c',
              border: '1px solid rgba(249, 115, 22, 0.3)',
            }}
          >
            <Flame size={11} fill="#fb923c" /> ~{bridge.caloriesPerClimb || 18} kcal
          </span>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            backgroundColor: 'var(--signal-green-dim)',
            border: '1px solid var(--signal-green-border)',
            color: 'var(--signal-green-light)',
            padding: '0.3rem 0.65rem',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 900,
            fontSize: '0.92rem',
            flexShrink: 0,
          }}
        >
          <Sparkles size={13} />
          <span>+{bridge.pointsPerCrossing} pts</span>
        </div>
      </div>

      {/* Bridge Name & Details */}
      <h3 style={{ fontSize: '1.2rem', lineHeight: '1.3', marginBottom: '0.35rem' }}>{bridge.name}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginBottom: '0.75rem', flex: 1, lineHeight: '1.5' }}>
        <strong>{bridge.locationLabel}</strong> — {bridge.description}
      </p>

      {/* Staircase Step & GPS Info Pill */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)',
          backgroundColor: 'var(--bg-deep)',
          padding: '0.45rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1rem',
        }}
      >
        <span>GPS: {bridge.latitude?.toFixed(4)}, {bridge.longitude?.toFixed(4)}</span>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--metro-blue)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            textDecoration: 'none',
            fontWeight: 700,
          }}
          title="Open directions in Google Maps"
        >
          <Navigation size={12} />
          <span>Directions</span>
        </a>
      </div>

      {/* Cooldown Status Pill */}
      <div style={{ marginBottom: '1.1rem' }}>
        {user ? (
          isAvailable ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--signal-green-light)',
                backgroundColor: 'var(--signal-green-dim)',
                border: '1px solid var(--signal-green-border)',
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem',
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={16} />
              <span>Available for Crossing Reward</span>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--hazard-yellow-light)',
                backgroundColor: 'var(--hazard-yellow-dim)',
                border: '1px solid var(--hazard-yellow-border)',
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.84rem',
                fontWeight: 700,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={15} />
                <span>6h Cooldown: Available in</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                {formatCountdown(remainingMs)}
              </span>
            </div>
          )
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-surface)',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
            }}
          >
            <span>Sign in to track your personal 6-hour cooldown</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <button
          onClick={() => onOpenQrModal(bridge)}
          className="btn btn-secondary"
          style={{ width: '100%', fontSize: '0.85rem', padding: '0.55rem 0.65rem' }}
        >
          <QrCode size={15} />
          <span>View QR Code</span>
        </button>

        <button
          onClick={() => onStartDirect(bridge)}
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '0.85rem', padding: '0.55rem 0.65rem' }}
        >
          <Footprints size={15} />
          <span>Scan / Cross</span>
        </button>
      </div>

      {/* Citizen Safety Report Link */}
      <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
        <button
          onClick={() => setReportModalOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            fontSize: '0.76rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <AlertTriangle size={12} color="var(--hazard-yellow)" />
          <span>Report maintenance / broken lights</span>
        </button>
      </div>

      {/* Citizen Safety Report Modal */}
      {reportModalOpen && (
        <div className="modal-overlay" onClick={() => setReportModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} color="var(--hazard-yellow)" />
                <h3 style={{ fontSize: '1.15rem' }}>Report Bridge Issue</h3>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {reportSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 size={40} color="var(--signal-green)" style={{ margin: '0 auto 0.75rem' }} />
                <h4 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Report Submitted</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Thank you! Your report for {bridge.name} has been routed to municipal road safety teams.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Help keep <strong>{bridge.name}</strong> clean, safe, and accessible for everyone.
                </p>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-input"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                  >
                    <option value="Lighting">Broken / Inadequate Lighting</option>
                    <option value="Cleanliness">Garbage / Cleanliness Issue</option>
                    <option value="Structural">Broken Handrail / Damaged Stairs</option>
                    <option value="Accessibility">Accessibility / Ramp Blockage</option>
                    <option value="Other">Other Safety Hazard</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Details / Notes</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="E.g., North staircase lights are not working at night..."
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={reportSubmitting}
                  >
                    <Send size={15} />
                    <span>{reportSubmitting ? 'Logging...' : 'Submit Report'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BridgeCard;
