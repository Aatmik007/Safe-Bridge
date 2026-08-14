import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Footprints,
  ShieldCheck,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Flame,
  Sparkles,
  RefreshCw,
  Compass,
} from 'lucide-react';

export const ScanLandingPage = () => {
  const { bridgeId, type } = useParams(); // 'entry' | 'exit'
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    setPendingScanIntent,
    refreshUser,
    refreshActiveCrossing,
  } = useAuth();

  // Multi-stage visual state machine
  // 'INITIAL' | 'ACQUIRING_GPS' | 'VERIFYING_SERVER' | 'SUCCESS_ENTRY' | 'SUCCESS_EXIT' | 'COOLDOWN' | 'ERROR'
  const [stepStage, setStepStage] = useState('INITIAL');
  const [bridgeDetails, setBridgeDetails] = useState(null);
  const [coords, setCoords] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState(0);
  const executionAttemptedRef = useRef(false);

  // 1. Fetch bridge details for UI display
  useEffect(() => {
    if (!bridgeId) return;
    api.bridges
      .getById(bridgeId)
      .then((res) => setBridgeDetails(res.data))
      .catch((err) => console.warn('Could not prefetch bridge:', err));
  }, [bridgeId]);

  // 2. Auth preservation check: If not logged in, preserve intent and redirect to login
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      console.log('Unauthenticated scan landing — saving intent and redirecting to login');
      setPendingScanIntent({ bridgeId, type, token });
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, bridgeId, type, token, navigate, setPendingScanIntent]);

  // 3. Trigger verification workflow once authenticated
  const executeScanFlow = async () => {
    if (!isAuthenticated || !bridgeId || !type) return;

    setStepStage('ACQUIRING_GPS');
    setErrorMessage('');

    // Step A: Acquire Browser Geolocation (soft signal)
    let acquiredLocation = null;
    try {
      if (navigator.geolocation) {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            (err) => {
              console.warn('Geolocation prompt skipped or unavailable:', err.message);
              resolve(null);
            },
            { timeout: 3000, enableHighAccuracy: true, maximumAge: 60000 }
          );
        });

        if (pos && pos.coords) {
          acquiredLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setCoords(acquiredLocation);
        }
      }
    } catch (err) {
      console.warn('Geolocation capture exception:', err);
    }

    // Step B: Call Server Anti-Fraud Verification Engine
    setStepStage('VERIFYING_SERVER');

    try {
      if (type === 'entry') {
        const response = await api.crossings.start(bridgeId, token, acquiredLocation);
        setResultData(response);
        setStepStage('SUCCESS_ENTRY');
        await refreshActiveCrossing();
      } else if (type === 'exit') {
        const response = await api.crossings.verify(bridgeId, token, acquiredLocation);
        setResultData(response);
        setStepStage('SUCCESS_EXIT');

        // Trigger celebratory confetti burst!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#f59e0b', '#3b82f6', '#fbbf24'],
        });

        await refreshUser();
        await refreshActiveCrossing();
      } else {
        throw new Error(`Invalid scan type "${type}". Expected "entry" or "exit".`);
      }
    } catch (err) {
      console.error('Crossing flow error:', err);
      if (err.isCooldown) {
        setCooldownRemainingMs(err.cooldownRemainingMs || 6 * 3600 * 1000);
        setErrorMessage(err.message);
        setStepStage('COOLDOWN');
      } else {
        setErrorMessage(err.message || 'Verification failed');
        setStepStage('ERROR');
      }
    }
  };

  const prevParamsRef = useRef('');

  useEffect(() => {
    const currentParamKey = `${bridgeId}:${type}:${token}`;
    if (isAuthenticated && currentParamKey !== prevParamsRef.current) {
      prevParamsRef.current = currentParamKey;
      executeScanFlow();
    }
  }, [isAuthenticated, bridgeId, type, token]);

  return (
    <div style={{ maxWidth: '540px', margin: '1.5rem auto 3rem' }}>
      <div className="card" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
        {/* Bridge Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="badge badge-category" style={{ marginBottom: '0.4rem' }}>
            <MapPin size={12} /> {bridgeDetails?.city || 'Pedestrian Zone'}
          </span>
          <h2 style={{ fontSize: '1.5rem', lineHeight: '1.3' }}>
            {bridgeDetails?.name || 'Foot Over Bridge'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {type === 'entry' ? '🟡 Step 1: Entry Stairs Verification' : '🟢 Step 2: Exit Stairs Verification'}
          </p>
        </div>

        {/* --- STAGE: ACQUIRING GPS --- */}
        {stepStage === 'ACQUIRING_GPS' && (
          <div style={{ padding: '2rem 1rem' }}>
            <div style={{ position: 'relative', width: '60px', height: '60px', margin: '0 auto 1.25rem' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#60a5fa',
                  animation: 'pulseBeacon 1.5s infinite',
                }}
              >
                <Compass size={30} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>Acquiring GPS Telemetry...</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Validating physical proximity to FOB coordinates
            </p>
          </div>
        )}

        {/* --- STAGE: VERIFYING SERVER --- */}
        {stepStage === 'VERIFYING_SERVER' && (
          <div style={{ padding: '2rem 1rem' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--road-yellow-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <ShieldCheck size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>Verifying Anti-Fraud Credentials...</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Checking short-lived HMAC signature & cooldown limits
            </p>
          </div>
        )}

        {/* --- STAGE: SUCCESS ENTRY --- */}
        {stepStage === 'SUCCESS_ENTRY' && (
          <div style={{ padding: '1rem 0' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: 'var(--signal-green-bg)',
                border: '2px solid var(--signal-green-border)',
                color: 'var(--signal-green-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <Footprints size={36} />
            </div>

            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--signal-green-light)' }}>
              {resultData?.resumed ? 'Crossing Resumed!' : 'Crossing Initiated!'}
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Climb the stairs and cross the bridge over the roadway. When you reach the opposite landing stairs, scan the <strong>Exit QR</strong> to claim your points!
            </p>

            <div
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                textAlign: 'left',
                marginBottom: '1.75rem',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Climb Duration Window:</span>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {resultData?.data?.minCrossingSeconds || 12}s min • {resultData?.data?.maxCrossingSeconds || 180}s max
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Reward on Exit:</span>
                <span style={{ color: 'var(--signal-green-light)', fontWeight: 700 }}>
                  +{bridgeDetails?.pointsPerCrossing || 25} Points
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/dashboard" className="btn btn-signal-green" style={{ width: '100%' }}>
                <span>Go to Active Dashboard</span>
                <ArrowRight size={17} />
              </Link>
              <Link to="/bridges" className="btn btn-outline" style={{ width: '100%' }}>
                <span>View Bridge Directory</span>
              </Link>
            </div>
          </div>
        )}

        {/* --- STAGE: SUCCESS EXIT --- */}
        {stepStage === 'SUCCESS_EXIT' && (
          <div style={{ padding: '1rem 0' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'var(--signal-green-bg)',
                border: '2px solid var(--signal-green)',
                color: 'var(--signal-green-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <Sparkles size={38} />
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: 'var(--signal-green-light)',
                border: '1px solid var(--signal-green-border)',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 800,
                fontSize: '1rem',
                marginBottom: '0.75rem',
              }}
            >
              +{resultData?.data?.pointsAwarded || 25} POINTS CLAIMED!
            </div>

            <h3 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: '#fff' }}>
              Safe Crossing Verified!
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Thank you for choosing pedestrian safety over surface traffic risk.
            </p>

            {/* Metrics Breakdown Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.75rem',
              }}
            >
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Total Points</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--road-yellow-light)' }}>
                  {resultData?.data?.totalPoints || user?.points || 0}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Daily Streak</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <Flame size={18} fill="#f97316" />
                  {resultData?.data?.currentStreak || 1} Days
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/rewards" className="btn btn-primary" style={{ width: '100%' }}>
                <span>Browse Rewards & Vouchers</span>
                <ArrowRight size={17} />
              </Link>
              <Link to="/dashboard" className="btn btn-outline" style={{ width: '100%' }}>
                <span>View Dashboard & Crossings</span>
              </Link>
            </div>
          </div>
        )}

        {/* --- STAGE: COOLDOWN ACTIVE --- */}
        {stepStage === 'COOLDOWN' && (
          <div style={{ padding: '1rem 0' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: 'var(--road-yellow-bg)',
                border: '2px solid var(--road-yellow-border)',
                color: 'var(--road-yellow-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <Clock size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--road-yellow-light)' }}>
              6-Hour Cooldown Active
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              {errorMessage}
            </p>

            <div
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                marginBottom: '1.75rem',
                textAlign: 'left',
              }}
            >
              <strong style={{ color: '#fff' }}>Why does this happen?</strong>
              <br />
              SafeBridge enforces a per-bridge 6-hour cooldown to prevent repetitive reward farming while still encouraging walking across multiple bridges across town.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/bridges" className="btn btn-primary" style={{ width: '100%' }}>
                <span>Explore Other Available FOBs</span>
                <ArrowRight size={17} />
              </Link>
              <Link to="/dashboard" className="btn btn-outline" style={{ width: '100%' }}>
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        )}

        {/* --- STAGE: ERROR --- */}
        {stepStage === 'ERROR' && (
          <div style={{ padding: '1rem 0' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: 'var(--signal-red-bg)',
                border: '2px solid var(--signal-red-border)',
                color: 'var(--signal-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <XCircle size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--signal-red)' }}>
              Verification Rejected
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              {errorMessage}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={executeScanFlow} className="btn btn-secondary" style={{ width: '100%' }}>
                <RefreshCw size={16} />
                <span>Retry Verification</span>
              </button>
              <Link to="/bridges" className="btn btn-outline" style={{ width: '100%' }}>
                <span>Return to Bridges Directory</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanLandingPage;
