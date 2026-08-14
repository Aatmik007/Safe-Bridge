import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Footprints, ShieldCheck, Award, Trophy, ArrowRight, Smartphone, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import BridgeCard from '../components/BridgeCard';
import QrViewerModal from '../components/QrViewerModal';

export const HomePage = ({ onOpenScanner }) => {
  const [bridges, setBridges] = useState([]);
  const [stats, setStats] = useState({ totalCrossings: 142, activeBridges: 5, pointsAwarded: 3550 });
  const [selectedBridgeForQr, setSelectedBridgeForQr] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bridgesRes, leaderboardRes] = await Promise.all([
          api.bridges.getAll(),
          api.leaderboard.get(),
        ]);
        setBridges(bridgesRes.data.slice(0, 3));
        if (leaderboardRes.data?.stats) {
          setStats({
            totalCrossings: leaderboardRes.data.stats.totalCommunityCrossings || 142,
            activeBridges: bridgesRes.data.length || 5,
            pointsAwarded: (leaderboardRes.data.stats.totalCommunityCrossings || 142) * 25,
          });
        }
      } catch (err) {
        console.warn('Error fetching homepage data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem 1.5rem',
          textAlign: 'center',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '780px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
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
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1.25rem',
            }}
          >
            <ShieldCheck size={16} />
            <span>Zero Jaywalking • Verified FOB Safety</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.25rem)',
              lineHeight: 1.15,
              fontWeight: 900,
              marginBottom: '1.25rem',
              color: '#ffffff',
            }}
          >
            Walk High. Walk Safe. <br />
            <span style={{ color: 'var(--road-yellow)' }}>Get Rewarded for Every Crossing.</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.15rem)',
              color: 'var(--text-muted)',
              marginBottom: '2rem',
              lineHeight: 1.6,
            }}
          >
            Scan the QR code at the foot of any Foot Over Bridge, climb over traffic safely, and scan the exit code at the other side to claim transit passes, metro recharges, and coffee vouchers.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={onOpenScanner}
              className="btn btn-primary"
              style={{ fontSize: '1.05rem', padding: '0.8rem 1.6rem' }}
            >
              <Smartphone size={20} />
              <span>Scan Bridge QR Now</span>
            </button>

            <Link
              to="/bridges"
              className="btn btn-secondary"
              style={{ fontSize: '1.05rem', padding: '0.8rem 1.6rem' }}
            >
              <span>Explore All FOBs</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Community Stats Bar */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '3rem',
        }}
      >
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--signal-green-light)' }}>
            {stats.totalCrossings}+
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
            Verified Safe Crossings
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--road-yellow-light)' }}>
            {stats.pointsAwarded}+
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
            Safety Points Awarded
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--transit-blue)' }}>
            {stats.activeBridges}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
            Active Monitored Bridges
          </div>
        </div>
      </section>

      {/* How SafeBridge Works: 4-Step Road Flow */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>How SafeBridge Works</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            A tamper-proof dual-stairway verification model designed to eliminate surface jaywalking
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {/* Step 1 */}
          <div className="card">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                color: 'var(--road-yellow-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                marginBottom: '1rem',
              }}
            >
              1
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Scan Entry QR</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Scan the physical QR sticker at the foot of the bridge stairs using your phone camera. No app download needed.
            </p>
          </div>

          {/* Step 2 */}
          <div className="card">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                color: '#60a5fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                marginBottom: '1rem',
              }}
            >
              2
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Climb & Cross</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Walk safely across the bridge over the arterial road. The server tracks realistic climb duration (12s - 180s).
            </p>
          </div>

          {/* Step 3 */}
          <div className="card">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: 'var(--signal-green-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                marginBottom: '1rem',
              }}
            >
              3
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Scan Exit QR</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Scan the exit sticker at the bottom of the landing stairs to complete anti-fraud verification.
            </p>
          </div>

          {/* Step 4 */}
          <div className="card">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(236, 72, 153, 0.2)',
                color: '#f472b6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                marginBottom: '1rem',
              }}
            >
              4
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Claim Rewards</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              Earn +25 to +35 points per crossing, build daily streaks, and redeem instant vouchers for transit and coffee.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Bridges Section */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.65rem' }}>Nearby Safe Bridges</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Active foot over bridges equipped with SafeBridge verification points
            </p>
          </div>
          <Link to="/bridges" className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {bridges.map((bridge) => (
            <BridgeCard
              key={bridge._id}
              bridge={bridge}
              onOpenQrModal={(b) => setSelectedBridgeForQr(b)}
              onStartDirect={(b) => setSelectedBridgeForQr(b)}
            />
          ))}
        </div>
      </section>

      {/* QR Viewer Modal */}
      <QrViewerModal
        bridge={selectedBridgeForQr}
        isOpen={!!selectedBridgeForQr}
        onClose={() => setSelectedBridgeForQr(null)}
      />
    </div>
  );
};

export default HomePage;
