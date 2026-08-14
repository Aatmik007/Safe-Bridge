import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Shield, AlertTriangle, CheckCircle2, XCircle, Footprints, RefreshCw, MapPin } from 'lucide-react';

export const AdminPage = () => {
  const { isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getOverview();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchOverview();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', maxWidth: '500px', margin: '3rem auto' }}>
        <Shield size={48} color="var(--signal-red)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>Admin Privileges Required</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Please sign in with an administrator account (e.g. <code>admin@safebridge.app</code>) to access anti-fraud logs and management tools.
        </p>
      </div>
    );
  }

  const counts = data?.counts || {};
  const recentCrossings = data?.recentCrossings || [];
  const flaggedCrossings = data?.flaggedCrossings || [];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span className="badge badge-category" style={{ marginBottom: '0.4rem' }}>
            <Shield size={12} color="var(--road-yellow)" /> System Administration
          </span>
          <h1 style={{ fontSize: '2rem' }}>Anti-Fraud Telemetry & Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Real-time verification audit logs, duration filters, and crossing metrics
          </p>
        </div>

        <button onClick={fetchOverview} className="btn btn-secondary">
          <RefreshCw size={16} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Pedestrians</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff' }}>{counts.totalUsers || 0}</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Crossings</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--signal-green-light)' }}>
            {counts.verifiedCrossings || 0}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Anti-Fraud Rejections</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--signal-red)' }}>
            {counts.rejectedCrossings || 0}
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verification Rate</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--road-yellow-light)' }}>
            {counts.verificationRate || 0}%
          </div>
        </div>
      </div>

      {/* Recent Telemetry Table */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Live Crossings Stream (Last 30)</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>User</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Bridge</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Duration</th>
                  <th style={{ padding: '0.65rem 0.5rem' }}>Anti-Fraud Notes / Flags</th>
                  <th style={{ padding: '0.65rem 0.5rem', textAlign: 'right' }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {recentCrossings.map((c) => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.65rem 0.5rem' }}>
                      {c.status === 'verified' && <span className="badge badge-verified">Verified</span>}
                      {c.status === 'pending' && <span className="badge badge-pending">Pending</span>}
                      {c.status === 'rejected' && <span className="badge badge-rejected">Rejected</span>}
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem' }}>{c.user?.name || 'User'}</td>
                    <td style={{ padding: '0.65rem 0.5rem' }}>{c.bridge?.name || 'Bridge'}</td>
                    <td style={{ padding: '0.65rem 0.5rem', fontFamily: 'var(--font-mono)' }}>
                      {c.durationSeconds ? `${c.durationSeconds}s` : 'Active'}
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)' }}>
                      {c.rejectionReason || (c.flags?.length ? c.flags.join(', ') : 'Clean Passage')}
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontWeight: 700 }}>
                      +{c.pointsAwarded || 0}
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

export default AdminPage;
