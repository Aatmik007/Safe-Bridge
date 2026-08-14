import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Trophy, Flame, Footprints, Award, ShieldCheck, Crown, Medal, User } from 'lucide-react';

export const LeaderboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myStats, setMyStats] = useState(null);
  const [communityStats, setCommunityStats] = useState({ totalCommunityCrossings: 0, totalActivePedestrians: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await api.leaderboard.get();
        setLeaderboard(res.data?.leaderboard || []);
        setMyStats(res.data?.myStats || null);
        setCommunityStats(res.data?.stats || { totalCommunityCrossings: 0, totalActivePedestrians: 0 });
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [isAuthenticated]);

  const top3 = leaderboard.slice(0, 3);
  const remaining = leaderboard.slice(3);

  return (
    <div>
      {/* Header Banner */}
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid var(--road-yellow-border)',
            color: 'var(--road-yellow-light)',
            padding: '0.3rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '0.75rem',
          }}
        >
          <Trophy size={16} />
          <span>City Pedestrian Safety Leaderboard</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>Top Footbridge Champions</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Celebrating citizens leading the movement for zero jaywalking and safer urban streets.
        </p>
      </div>

      {/* Community Impact Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}
      >
        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Community Safe Crossings</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--signal-green-light)', fontFamily: 'var(--font-heading)' }}>
            {communityStats.totalCommunityCrossings}
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Walking Commuters</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--road-yellow-light)', fontFamily: 'var(--font-heading)' }}>
            {communityStats.totalActivePedestrians}
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem',
            alignItems: 'flex-end',
          }}
        >
          {/* Rank 2 (Silver) */}
          {top3[1] && (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '1.75rem 1.25rem',
                borderTop: '4px solid #94a3b8',
                backgroundColor: top3[1].isCurrentUser ? '#1c2432' : 'var(--bg-card)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(148, 163, 184, 0.2)',
                  color: '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{top3[1].name}</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--road-yellow-light)', marginBottom: '0.5rem' }}>
                {top3[1].points} pts
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span>{top3[1].totalCrossings} Crossings</span>
                <span>•</span>
                <span style={{ color: '#f97316' }}>🔥 {top3[1].currentStreak}d streak</span>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold) */}
          {top3[0] && (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '2.25rem 1.25rem',
                borderTop: '5px solid var(--road-yellow)',
                backgroundColor: top3[0].isCurrentUser ? '#22281a' : '#1c212a',
                transform: 'scale(1.03)',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  color: 'var(--road-yellow-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  fontWeight: 900,
                  fontSize: '1.4rem',
                }}
              >
                <Crown size={28} />
              </div>
              <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--road-yellow-light)', marginBottom: '0.4rem' }}>
                #1 CHAMPION
              </span>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.25rem' }}>{top3[0].name}</h3>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: 'var(--road-yellow-light)', marginBottom: '0.5rem' }}>
                {top3[0].points} pts
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>{top3[0].totalCrossings} Crossings</span>
                <span>•</span>
                <span style={{ color: '#f97316' }}>🔥 {top3[0].currentStreak}d streak</span>
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {top3[2] && (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '1.75rem 1.25rem',
                borderTop: '4px solid #b45309',
                backgroundColor: top3[2].isCurrentUser ? '#1c2432' : 'var(--bg-card)',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(180, 83, 9, 0.2)',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{top3[2].name}</h3>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--road-yellow-light)', marginBottom: '0.5rem' }}>
                {top3[2].points} pts
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <span>{top3[2].totalCrossings} Crossings</span>
                <span>•</span>
                <span style={{ color: '#f97316' }}>🔥 {top3[2].currentStreak}d streak</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Current User Rank Banner */}
      {isAuthenticated && myStats && (
        <div
          className="card"
          style={{
            backgroundColor: '#1b2330',
            borderColor: 'var(--transit-blue)',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--transit-blue-bg)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
              }}
            >
              #{myStats.rank}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>
                Your Standing: {myStats.name}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {myStats.points} Points • {myStats.totalCrossings} Crossings • {myStats.currentStreak}-Day Streak
              </div>
            </div>
          </div>

          <span className="badge" style={{ backgroundColor: 'var(--transit-blue-bg)', color: '#60a5fa' }}>
            Top Pedestrian
          </span>
        </div>
      )}

      {/* Rankings Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Full City Standings</h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 0.5rem', width: '60px' }}>Rank</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Pedestrian</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Daily Streak</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Total Crossings</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Total Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((u) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: u.isCurrentUser ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  }}
                >
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                    #{u.rank}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div style={{ fontWeight: 600, color: u.isCurrentUser ? 'var(--road-yellow)' : '#fff' }}>
                      {u.name} {u.isCurrentUser && '(You)'}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', color: '#f97316' }}>
                    {u.currentStreak > 0 ? `🔥 ${u.currentStreak}d` : '—'}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>
                    {u.totalCrossings}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 800, color: 'var(--road-yellow-light)' }}>
                    {u.points} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
