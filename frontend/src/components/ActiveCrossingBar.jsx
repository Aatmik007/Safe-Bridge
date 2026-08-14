import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Footprints, Clock, CheckCircle2, AlertTriangle, ArrowRight, X } from 'lucide-react';
import api from '../services/api';

export const ActiveCrossingBar = ({ onOpenScanner }) => {
  const { activeCrossing, refreshActiveCrossing } = useAuth();
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);

  const crossing = activeCrossing?.crossing;
  const minSeconds = activeCrossing?.minCrossingSeconds || 12;
  const maxSeconds = activeCrossing?.maxCrossingSeconds || 180;

  useEffect(() => {
    if (!crossing || !crossing.entryTimestamp) return;

    const updateTimer = () => {
      const startMs = new Date(crossing.entryTimestamp).getTime();
      const currentSeconds = Math.max(0, Math.round((Date.now() - startMs) / 1000));
      setElapsed(currentSeconds);

      if (currentSeconds > maxSeconds) {
        refreshActiveCrossing();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [crossing, maxSeconds, refreshActiveCrossing]);

  if (!crossing || crossing.status !== 'pending') {
    return null;
  }

  const isMinReached = elapsed >= minSeconds;
  const isExpired = elapsed > maxSeconds;
  const progressPercent = Math.min(100, Math.round((elapsed / maxSeconds) * 100));

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCancel = async () => {
    if (window.confirm('Cancel your ongoing bridge crossing session?')) {
      try {
        await api.crossings.cancel();
        refreshActiveCrossing();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="active-crossing-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, flexWrap: 'wrap' }}>
        <div className="active-crossing-pulse" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              Crossing in Progress: {crossing.bridge?.name || 'Bridge'}
            </span>
            <span
              className="badge"
              style={{
                backgroundColor: isMinReached ? 'var(--signal-green-bg)' : 'var(--road-yellow-bg)',
                color: isMinReached ? 'var(--signal-green-light)' : 'var(--road-yellow-light)',
                border: `1px solid ${isMinReached ? 'var(--signal-green-border)' : 'var(--road-yellow-border)'}`,
              }}
            >
              {isMinReached ? 'Ready to Exit' : `Climbing: ${minSeconds - elapsed}s min`}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontFamily: 'var(--font-mono)' }}>
              <Clock size={14} color="var(--road-yellow)" />
              Elapsed: {formatTime(elapsed)} / {formatTime(maxSeconds)} max
            </span>
            <span>•</span>
            <span>Walk to the opposite stairs and scan the Exit QR</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={() => {
            const bId = crossing.bridge?._id || crossing.bridge;
            if (bId) {
              navigate(`/scan/${bId}/exit?token=demo-token`);
            } else {
              navigate('/bridges');
            }
          }}
          className="btn btn-signal-green"
          style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
        >
          <span>Complete Exit</span>
          <ArrowRight size={15} />
        </button>

        <button
          onClick={handleCancel}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.3rem',
          }}
          title="Abandon crossing session"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ActiveCrossingBar;
