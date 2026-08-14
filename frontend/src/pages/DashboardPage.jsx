import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Footprints,
  Flame,
  Award,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Leaf,
  Activity,
  Zap,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, activeCrossing, refreshActiveCrossing } = useAuth();
  const [crossings, setCrossings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.crossings.getMy(p);
      setCrossings(res.data?.crossings || []);
      setTotalPages(res.data?.pages || 1);
      setPage(res.data?.page || 1);
    } catch (err) {
      console.error('Error fetching crossing history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
    refreshActiveCrossing();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Tier progression logic
  const totalCrossings = user?.totalCrossings || 0;
  let tier = { name: 'Bronze Walker', class: 'tier-bronze', nextThreshold: 10, nextTier: 'Silver Climber' };
  if (totalCrossings >= 25) {
    tier = { name: 'Platinum Vision Zero Champion', class: 'tier-platinum', nextThreshold: 50, nextTier: 'Master' };
  } else if (totalCrossings >= 10) {
    tier = { name: 'Gold Overpass Pioneer', class: 'tier-gold', nextThreshold: 25, nextTier: 'Platinum Champion' };
  } else if (totalCrossings >= 5) {
    tier = { name: 'Silver Climber', class: 'tier-silver', nextThreshold: 10, nextTier: 'Gold Pioneer' };
  }

  // Health & Environmental metrics calculations
  const caloriesBurned = totalCrossings * 18;
  const stairsClimbed = totalCrossings * 42;
  const co2OffsetKg = ((totalCrossings * 120) / 1000).toFixed(1);

  return (
    <div>
      {/* Welcome & Tier Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
              <span className={`tier-badge ${tier.class}`}>{tier.name}</span>
              <span className="badge badge-category">Vision Zero Commuter</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', color: '#fff' }}>Welcome back, {user?.name || 'Commuter'}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              Your verified FOB crossings protect lives and earn high-value transit rewards.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Link to="/rewards" className="btn btn-primary">
              <Award size={16} />
              <span>Redeem Points</span>
            </Link>
            <Link to="/bridges" className="btn btn-secondary">
              <Footprints size={16} />
              <span>Cross a Bridge</span>
            </Link>
          </div>
        </div>

        {/* 4 Key Stat Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Total Points */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--hazard-yellow-dim)',
                color: 'var(--hazard-yellow-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Award size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Safety Points</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--hazard-yellow-light)' }}>
                {user?.points || 0}
              </div>
            </div>
          </div>

          {/* Current Streak */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(249, 115, 22, 0.15)',
                color: '#f97316',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Flame size={26} fill="#f97316" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Daily Streak</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#f97316' }}>
                {user?.currentStreak || 0} Days
              </div>
            </div>
          </div>

          {/* Total Crossings */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--signal-green-dim)',
                color: 'var(--signal-green-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Footprints size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Safe Crossings</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--signal-green-light)' }}>
                {totalCrossings}
              </div>
            </div>
          </div>

          {/* Longest Streak */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--metro-blue-dim)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Trophy size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Longest Streak</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#60a5fa' }}>
                {user?.longestStreak || user?.currentStreak || 0} Days
              </div>
            </div>
          </div>
        </div>

        {/* Health & Eco Impact Widget */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(90deg, #131d2a, #162436)',
            borderColor: 'var(--border-prominent)',
            padding: '1.25rem 1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'rgba(249, 115, 22, 0.15)', color: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Calories Burned</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>~{caloriesBurned} kcal</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Stair Elevation</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>{stairsClimbed} steps</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--signal-green-dim)', color: 'var(--signal-green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Leaf size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Road Safety Offset</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--signal-green-light)' }}>{co2OffsetKg} kg CO₂</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Pending Crossing Banner (if ongoing) */}
      {activeCrossing?.crossing && (
        <div
          className="card"
          style={{
            backgroundColor: '#101e16',
            borderColor: 'var(--signal-green)',
            marginBottom: '2rem',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <div className="active-crossing-pulse" />
              <strong style={{ fontSize: '1.1rem', color: '#fff' }}>
                Crossing in Progress: {activeCrossing.crossing.bridge?.name}
              </strong>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Started at {formatDate(activeCrossing.crossing.entryTimestamp)}. Walk across the bridge to complete your exit verification.
            </p>
          </div>

          <Link
            to={`/scan/${activeCrossing.crossing.bridge?._id || activeCrossing.crossing.bridge}/exit?token=demo-token`}
            className="btn btn-signal-green"
          >
            <span>Complete Exit Verification</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Crossing History Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>Crossing History & Verification Ledger</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Immutable server-verified record of your pedestrian bridge journeys
            </p>
          </div>

          <button onClick={() => fetchHistory(page)} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            Loading crossing history...
          </div>
        ) : crossings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Footprints size={40} color="var(--hazard-yellow)" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.4rem', color: '#fff' }}>
              No crossing records yet
            </p>
            <p style={{ fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Scan the QR code at any Foot Over Bridge to start building your points and daily streak!
            </p>
            <Link to="/bridges" className="btn btn-primary">
              Find Monitored FOBs
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Bridge Name</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Timestamp</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>Duration</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>Points Awarded</th>
                </tr>
              </thead>
              <tbody>
                {crossings.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      {c.status === 'verified' && (
                        <span className="badge badge-verified">
                          <CheckCircle2 size={12} /> Verified
                        </span>
                      )}
                      {c.status === 'pending' && (
                        <span className="badge badge-pending">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                      {c.status === 'rejected' && (
                        <span className="badge badge-rejected" title={c.rejectionReason || 'Anti-fraud failed'}>
                          <XCircle size={12} /> Rejected
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{c.bridge?.name || 'Bridge'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                        {c.bridge?.city || 'Urban'} • {c.rejectionReason || (c.geoDistanceDelta ? `GPS Proximity: ${c.geoDistanceDelta}m` : 'GPS Standard')}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>
                      {formatDate(c.entryTimestamp)}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'var(--font-mono)' }}>
                      {c.durationSeconds ? `${c.durationSeconds}s` : 'In progress'}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>
                      {c.pointsAwarded > 0 ? (
                        <span style={{ color: 'var(--signal-green-light)' }}>+{c.pointsAwarded} pts</span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
