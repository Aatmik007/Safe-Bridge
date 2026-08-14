import React from 'react';
import { Footprints, ShieldCheck, Heart, Sparkles, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '2.5rem 1rem 2rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
            <div className="brand-icon" style={{ width: '26px', height: '26px' }}>
              <Footprints size={16} />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.15rem' }}>
              SafeBridge
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5' }}>
            Urban pedestrian incentive infrastructure rewarding safe Foot Over Bridge (FOB) usage over dangerous surface jaywalking.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--road-yellow)' }}>
            Anti-Fraud Guarantees
          </h4>
          <ul style={{ listStyle: 'none', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={15} color="var(--signal-green)" /> 6-Hour Per-Bridge Cooldown Enforcement
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={15} color="var(--signal-green)" /> Dual Stairway Timed Climb Verification
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={15} color="var(--signal-green)" /> Short-Lived HMAC Signed QR Tokens
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#fff' }}>
            Quick Links
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <a href="/bridges" style={{ transition: 'color 0.2s' }}>Explore All FOBs</a>
            <a href="/rewards" style={{ transition: 'color 0.2s' }}>Transit & Coffee Rewards</a>
            <a href="/leaderboard" style={{ transition: 'color 0.2s' }}>City Safety Leaderboard</a>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          fontSize: '0.82rem',
          color: 'var(--text-dim)',
        }}
      >
        <div>
          © {new Date().getFullYear()} SafeBridge Pedestrian Platform. Built for safer streets.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>Promoting Vision Zero Pedestrian Safety</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
