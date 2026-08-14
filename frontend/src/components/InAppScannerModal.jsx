import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Image, Link2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const InAppScannerModal = ({ isOpen, onClose }) => {
  const [scannerMode, setScannerMode] = useState('camera'); // 'camera' | 'upload' | 'manual'
  const [manualInput, setManualInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeInstanceRef = useRef(null);
  const navigate = useNavigate();

  const handleScanSuccess = (decodedText) => {
    console.log('Scanned QR text:', decodedText);
    stopScanner();
    onClose();

    // Check if decoded text is full URL or relative path
    try {
      if (decodedText.includes('/scan/')) {
        const urlObj = new URL(decodedText, window.location.origin);
        navigate(`${urlObj.pathname}${urlObj.search}`);
      } else {
        // Assume format bridgeId/type?token=...
        navigate(`/scan/${decodedText}`);
      }
    } catch {
      navigate(`/scan/${decodedText}`);
    }
  };

  const startScanner = async () => {
    setErrorMsg('');
    try {
      if (!html5QrCodeInstanceRef.current) {
        html5QrCodeInstanceRef.current = new Html5Qrcode('qr-reader-target');
      }

      await html5QrCodeInstanceRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore frame decode errors
        }
      );
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera start error:', err);
      setErrorMsg('Camera access unavailable or blocked. You can upload a QR image or paste the URL below.');
      setCameraActive(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeInstanceRef.current) {
      try {
        if (html5QrCodeInstanceRef.current.isScanning) {
          await html5QrCodeInstanceRef.current.stop();
        }
        html5QrCodeInstanceRef.current.clear();
      } catch (err) {
        // Ignore stop errors
      }
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (isOpen && scannerMode === 'camera') {
      const timeout = setTimeout(() => {
        startScanner();
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [isOpen, scannerMode]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (!html5QrCodeInstanceRef.current) {
        html5QrCodeInstanceRef.current = new Html5Qrcode('qr-reader-target');
      }
      const result = await html5QrCodeInstanceRef.current.scanFile(file, true);
      handleScanSuccess(result);
    } catch (err) {
      setErrorMsg('Could not detect a valid QR code in this image. Please try another image.');
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleScanSuccess(manualInput.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="brand-icon" style={{ width: '28px', height: '28px' }}>
              <Camera size={16} />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>In-App QR Scanner</h3>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switch */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            backgroundColor: 'var(--bg-primary)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.82rem',
          }}
        >
          <button
            onClick={() => setScannerMode('camera')}
            style={{
              background: scannerMode === 'camera' ? 'var(--road-yellow)' : 'transparent',
              color: scannerMode === 'camera' ? '#000' : 'var(--text-muted)',
              border: 'none',
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Camera
          </button>
          <button
            onClick={() => setScannerMode('upload')}
            style={{
              background: scannerMode === 'upload' ? 'var(--road-yellow)' : 'transparent',
              color: scannerMode === 'upload' ? '#000' : 'var(--text-muted)',
              border: 'none',
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Upload Image
          </button>
          <button
            onClick={() => setScannerMode('manual')}
            style={{
              background: scannerMode === 'manual' ? 'var(--road-yellow)' : 'transparent',
              color: scannerMode === 'manual' ? '#000' : 'var(--text-muted)',
              border: 'none',
              padding: '0.45rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Paste URL
          </button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: 'var(--signal-red-bg)',
              border: '1px solid var(--signal-red-border)',
              color: 'var(--signal-red)',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Camera Mode */}
        {scannerMode === 'camera' && (
          <div>
            <div
              id="qr-reader-target"
              ref={scannerRef}
              style={{
                width: '100%',
                minHeight: '260px',
                backgroundColor: '#000',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                position: 'relative',
              }}
            />
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.65rem' }}>
              Align the bridge stairway QR sticker inside the viewport
            </p>
          </div>
        )}

        {/* Upload Mode */}
        {scannerMode === 'upload' && (
          <div
            style={{
              border: '2px dashed var(--border-prominent)',
              borderRadius: 'var(--radius-md)',
              padding: '2.5rem 1rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-primary)',
            }}
          >
            <Image size={36} color="var(--road-yellow)" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ fontWeight: 600, marginBottom: '0.4rem' }}>Select a screenshot or photo of the QR code</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              Supports PNG, JPG, WEBP
            </p>
            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
              <span>Browse Image File</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
        )}

        {/* Manual Mode */}
        {scannerMode === 'manual' && (
          <form onSubmit={handleManualSubmit}>
            <div className="form-group">
              <label className="form-label">SafeBridge Deep-Link or Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://safebridge.app/scan/bridgeId/entry?token=..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
              Proceed to Crossing
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default InAppScannerModal;
