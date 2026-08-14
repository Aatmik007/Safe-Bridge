import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, QrCode, ExternalLink, Smartphone, Footprints, CheckCircle2, Copy } from 'lucide-react';

export const QrViewerModal = ({ bridge, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('entry');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  if (!isOpen || !bridge) return null;

  const qrCodes = bridge.qrCodes || {};
  const currentUrl = activeTab === 'entry' ? qrCodes.entryUrl : qrCodes.exitUrl;
  const currentQrImg = activeTab === 'entry' ? qrCodes.entryQrDataUrl : qrCodes.exitQrDataUrl;

  const handleCopy = () => {
    if (currentUrl) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSimulateClick = () => {
    onClose();
    if (activeTab === 'entry') {
      navigate(`/scan/${bridge._id}/entry?token=${encodeURIComponent(qrCodes.entryToken || 'demo-token')}`);
    } else {
      navigate(`/scan/${bridge._id}/exit?token=${encodeURIComponent(qrCodes.exitToken || 'demo-token')}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Physical QR Codes</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {bridge.name} ({bridge.city})
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.3rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Info Notice */}
        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderLeft: '3px solid var(--road-yellow)',
            padding: '0.65rem 0.85rem',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            marginBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fff', fontWeight: 600, marginBottom: '2px' }}>
            <Smartphone size={14} color="var(--road-yellow)" /> Physical Sticker Simulation
          </div>
          Scan these with your mobile camera app to trigger native browser deep-link entry, or use the 1-click test button below.
        </div>

        {/* Tab Switcher: Entry QR vs Exit QR */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--bg-primary)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
          }}
        >
          <button
            onClick={() => setActiveTab('entry')}
            style={{
              background: activeTab === 'entry' ? 'var(--road-yellow)' : 'transparent',
              color: activeTab === 'entry' ? '#000' : 'var(--text-muted)',
              border: 'none',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Step 1: Entry Stairs QR
          </button>
          <button
            onClick={() => setActiveTab('exit')}
            style={{
              background: activeTab === 'exit' ? 'var(--signal-green)' : 'transparent',
              color: activeTab === 'exit' ? '#000' : 'var(--text-muted)',
              border: 'none',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Step 2: Exit Stairs QR
          </button>
        </div>

        {/* QR Display Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
          }}
        >
          {currentQrImg ? (
            <img
              src={currentQrImg}
              alt={`${bridge.name} ${activeTab} QR`}
              style={{ width: '220px', height: '220px', display: 'block', borderRadius: '4px' }}
            />
          ) : (
            <div style={{ padding: '3rem 0', color: '#666', textAlign: 'center' }}>Generating QR Code...</div>
          )}

          <div style={{ color: '#111', fontWeight: 700, fontSize: '0.9rem', marginTop: '0.5rem', textAlign: 'center' }}>
            {activeTab === 'entry' ? '🟡 STEP 1: SCAN AT ENTRY STAIRCASE' : '🟢 STEP 2: SCAN AT EXIT STAIRCASE'}
          </div>
          <div style={{ color: '#666', fontSize: '0.78rem', textAlign: 'center', marginTop: '2px' }}>
            Signed Token: 2-Minute Anti-Tamper Session
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <button
            onClick={handleSimulateClick}
            className={activeTab === 'entry' ? 'btn btn-primary' : 'btn btn-signal-green'}
            style={{ width: '100%' }}
          >
            <Footprints size={18} />
            <span>Simulate Scanning {activeTab === 'entry' ? 'Entry' : 'Exit'} QR</span>
          </button>

          <button
            onClick={handleCopy}
            className="btn btn-secondary"
            style={{ width: '100%', fontSize: '0.85rem' }}
          >
            {copied ? <CheckCircle2 size={15} color="var(--signal-green)" /> : <Copy size={15} />}
            <span>{copied ? 'Deep-Link URL Copied!' : 'Copy Deep-Link URL to Clipboard'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrViewerModal;
