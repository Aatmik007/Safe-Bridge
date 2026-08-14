import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Award,
  Sparkles,
  Ticket,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  Coffee,
  Train,
  ShoppingBag,
  Leaf,
  X,
  ArrowRight,
} from 'lucide-react';

export const RewardsPage = () => {
  const { user, refreshUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'my-vouchers'
  const [rewards, setRewards] = useState([]);
  const [myRedemptions, setMyRedemptions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Redemption modal state
  const [redeemingReward, setRedeemingReward] = useState(null);
  const [redeemedResult, setRedeemedResult] = useState(null);
  const [redeemError, setRedeemError] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const [rewardsRes, redemptionsRes] = await Promise.all([
        api.rewards.getAll(),
        isAuthenticated ? api.rewards.getMyRedemptions() : Promise.resolve({ data: [] }),
      ]);
      setRewards(rewardsRes.data || []);
      setMyRedemptions(redemptionsRes.data || []);
    } catch (err) {
      console.error('Failed to load rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [isAuthenticated]);

  const handleRedeemClick = (reward) => {
    if (!isAuthenticated) {
      alert('Please log in or create an account to redeem rewards.');
      return;
    }
    setRedeemingReward(reward);
    setRedeemedResult(null);
    setRedeemError('');
  };

  const confirmRedemption = async () => {
    if (!redeemingReward) return;
    setRedeemLoading(true);
    setRedeemError('');

    try {
      const res = await api.rewards.redeem(redeemingReward._id);
      setRedeemedResult(res.data?.redemption);
      await refreshUser();
      await fetchCatalog();
    } catch (err) {
      setRedeemError(err.message || 'Failed to redeem reward');
    } finally {
      setRedeemLoading(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const categories = ['All', 'Transit', 'Food & Beverage', 'Fitness', 'Eco'];

  const filteredRewards =
    selectedCategory === 'All'
      ? rewards
      : rewards.filter((r) => r.category === selectedCategory);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Transit':
        return <Train size={16} />;
      case 'Food & Beverage':
        return <Coffee size={16} />;
      case 'Fitness':
        return <ShoppingBag size={16} />;
      case 'Eco':
        return <Leaf size={16} />;
      default:
        return <Award size={16} />;
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <span className="badge badge-category" style={{ marginBottom: '0.4rem' }}>
            Rewards & Partner Vouchers
          </span>
          <h1 style={{ fontSize: '2rem' }}>Pedestrian Safety Rewards</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Redeem points earned from verified bridge crossings for public transit cards, coffee, and merchant perks.
          </p>
        </div>

        {isAuthenticated && (
          <div className="points-pill" style={{ padding: '0.6rem 1.25rem', fontSize: '1rem' }}>
            <Award size={20} />
            <span>Balance: {user?.points || 0} Points</span>
          </div>
        )}
      </div>

      {/* Tab Switcher */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem',
        }}
      >
        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'catalog' ? '2px solid var(--road-yellow)' : '2px solid transparent',
            color: activeTab === 'catalog' ? 'var(--road-yellow)' : 'var(--text-muted)',
            padding: '0.65rem 1rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          Rewards Catalog ({rewards.length})
        </button>

        {isAuthenticated && (
          <button
            onClick={() => setActiveTab('my-vouchers')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'my-vouchers' ? '2px solid var(--road-yellow)' : '2px solid transparent',
              color: activeTab === 'my-vouchers' ? 'var(--road-yellow)' : 'var(--text-muted)',
              padding: '0.65rem 1rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Ticket size={16} />
            <span>My Active Vouchers ({myRedemptions.length})</span>
          </button>
        )}
      </div>

      {/* CATALOG TAB */}
      {activeTab === 'catalog' && (
        <>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  backgroundColor: selectedCategory === cat ? 'var(--road-yellow)' : 'var(--bg-card)',
                  color: selectedCategory === cat ? '#000' : 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {filteredRewards.map((reward) => {
              const canAfford = (user?.points || 0) >= reward.costInPoints;

              return (
                <div key={reward._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span className="badge badge-category" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      {getCategoryIcon(reward.category)}
                      {reward.partner}
                    </span>

                    <span
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 900,
                        fontSize: '1.15rem',
                        color: 'var(--road-yellow-light)',
                      }}
                    >
                      {reward.costInPoints} pts
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', lineHeight: '1.3', marginBottom: '0.4rem' }}>{reward.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem', flex: 1 }}>
                    {reward.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    <span>In Stock: {reward.stock} vouchers</span>
                    <span style={{ color: 'var(--signal-green-light)' }}>{reward.badgeText}</span>
                  </div>

                  <button
                    onClick={() => handleRedeemClick(reward)}
                    className={canAfford ? 'btn btn-primary' : 'btn btn-secondary'}
                    style={{ width: '100%' }}
                    disabled={reward.stock <= 0}
                  >
                    <Ticket size={16} />
                    <span>
                      {reward.stock <= 0
                        ? 'Out of Stock'
                        : canAfford
                        ? `Redeem for ${reward.costInPoints} pts`
                        : `Need ${reward.costInPoints - (user?.points || 0)} more pts`}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* MY REDEEMED VOUCHERS TAB */}
      {activeTab === 'my-vouchers' && (
        <div>
          {myRedemptions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Ticket size={40} color="var(--road-yellow)" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>No vouchers redeemed yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                You have {user?.points || 0} points available. Check out the rewards catalog!
              </p>
              <button onClick={() => setActiveTab('catalog')} className="btn btn-primary">
                Browse Catalog
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {myRedemptions.map((redemption) => (
                <div key={redemption._id} className="card" style={{ borderLeft: '4px solid var(--signal-green)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className="badge badge-verified">
                      <CheckCircle2 size={12} /> {redemption.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Redeemed {new Date(redemption.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>{redemption.reward?.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Partner: {redemption.reward?.partner} • Cost: {redemption.pointsSpent} pts
                  </p>

                  {/* Voucher code display */}
                  <div
                    style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px dashed var(--road-yellow)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--road-yellow-light)', letterSpacing: '0.05em' }}>
                      {redemption.redemptionCode}
                    </span>
                    <button
                      onClick={() => copyCode(redemption.redemptionCode)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.8rem',
                      }}
                      title="Copy code"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Redemption Confirmation / Voucher Modal */}
      {redeemingReward && (
        <div className="modal-overlay" onClick={() => setRedeemingReward(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                {redeemedResult ? 'Voucher Generated!' : 'Confirm Voucher Redemption'}
              </h3>
              <button
                onClick={() => setRedeemingReward(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {redeemError && (
              <div
                style={{
                  backgroundColor: 'var(--signal-red-bg)',
                  border: '1px solid var(--signal-red-border)',
                  color: 'var(--signal-red)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}
              >
                {redeemError}
              </div>
            )}

            {!redeemedResult ? (
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Are you sure you want to redeem <strong>{redeemingReward.costInPoints} points</strong> for{' '}
                  <strong>{redeemingReward.title}</strong>?
                </p>

                <div
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.5rem',
                    fontSize: '0.88rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Current Balance:</span>
                    <span style={{ fontWeight: 700 }}>{user?.points || 0} pts</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Reward Cost:</span>
                    <span style={{ fontWeight: 700, color: 'var(--road-yellow-light)' }}>
                      -{redeemingReward.costInPoints} pts
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Remaining Balance:</span>
                    <span style={{ fontWeight: 700, color: 'var(--signal-green-light)' }}>
                      {(user?.points || 0) - redeemingReward.costInPoints} pts
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => setRedeemingReward(null)}
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmRedemption}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={redeemLoading}
                  >
                    {redeemLoading ? 'Generating...' : 'Confirm & Redeem'}
                  </button>
                </div>
              </div>
            ) : (
              /* Success Voucher Display */
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--signal-green-bg)',
                    color: 'var(--signal-green-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>

                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>{redeemedResult.reward?.title || redeemingReward.title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                  Present this unique digital voucher at partner terminals or scan at the counter.
                </p>

                <div
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    border: '2px dashed var(--signal-green)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem 1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
                    CRYPTOGRAPHIC VOUCHER CODE
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.35rem',
                      fontWeight: 900,
                      color: 'var(--signal-green-light)',
                      letterSpacing: '0.08em',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {redeemedResult.redemptionCode}
                  </div>
                  <button
                    onClick={() => copyCode(redeemedResult.redemptionCode)}
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                  >
                    {codeCopied ? <CheckCircle2 size={14} color="var(--signal-green)" /> : <Copy size={14} />}
                    <span>{codeCopied ? 'Code Copied!' : 'Copy Voucher Code'}</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setRedeemingReward(null);
                    setActiveTab('my-vouchers');
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  View in My Vouchers
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsPage;
