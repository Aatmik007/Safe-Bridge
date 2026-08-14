import React, { useState, useEffect } from 'react';
import { Search, MapPin, Filter, RefreshCw, Smartphone } from 'lucide-react';
import api from '../services/api';
import BridgeCard from '../components/BridgeCard';
import QrViewerModal from '../components/QrViewerModal';

export const BridgesPage = ({ onOpenScanner }) => {
  const [bridges, setBridges] = useState([]);
  const [filteredBridges, setFilteredBridges] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all' | 'available' | 'cooldown'
  const [loading, setLoading] = useState(true);
  const [selectedBridgeForQr, setSelectedBridgeForQr] = useState(null);

  const fetchBridges = async () => {
    setLoading(true);
    try {
      const res = await api.bridges.getAll();
      setBridges(res.data || []);
    } catch (err) {
      console.error('Failed to load bridges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBridges();
  }, []);

  // Filter bridges dynamically
  useEffect(() => {
    let result = bridges;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.locationLabel.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q)
      );
    }

    if (selectedCity !== 'All') {
      result = result.filter((b) => b.city === selectedCity);
    }

    if (availabilityFilter === 'available') {
      result = result.filter((b) => b.cooldown?.isAvailable);
    } else if (availabilityFilter === 'cooldown') {
      result = result.filter((b) => !b.cooldown?.isAvailable);
    }

    setFilteredBridges(result);
  }, [bridges, searchQuery, selectedCity, availabilityFilter]);

  const uniqueCities = ['All', ...new Set(bridges.map((b) => b.city).filter(Boolean))];

  return (
    <div>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>Foot Over Bridges</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Browse monitored FOB locations and check your personal 6-hour cooldown status
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button onClick={fetchBridges} className="btn btn-secondary" title="Refresh Bridges">
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
          <button onClick={onOpenScanner} className="btn btn-primary">
            <Smartphone size={16} />
            <span>Open In-App Camera</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div
        className="card"
        style={{
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Search box */}
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.5rem' }}
            placeholder="Search by bridge name, junction, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
          />
        </div>

        {/* City Filter Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>City:</span>
          {uniqueCities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              style={{
                backgroundColor: selectedCity === city ? 'var(--road-yellow)' : 'var(--bg-tertiary)',
                color: selectedCity === city ? '#000' : 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '0.3rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Availability Filter */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <button
            onClick={() => setAvailabilityFilter('all')}
            style={{
              backgroundColor: availabilityFilter === 'all' ? 'var(--bg-card-hover)' : 'transparent',
              color: availabilityFilter === 'all' ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.35rem 0.65rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            All ({bridges.length})
          </button>
          <button
            onClick={() => setAvailabilityFilter('available')}
            style={{
              backgroundColor: availabilityFilter === 'available' ? 'var(--signal-green-bg)' : 'transparent',
              color: availabilityFilter === 'available' ? 'var(--signal-green-light)' : 'var(--text-muted)',
              border: '1px solid var(--signal-green-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.35rem 0.65rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Available Now
          </button>
          <button
            onClick={() => setAvailabilityFilter('cooldown')}
            style={{
              backgroundColor: availabilityFilter === 'cooldown' ? 'var(--road-yellow-bg)' : 'transparent',
              color: availabilityFilter === 'cooldown' ? 'var(--road-yellow-light)' : 'var(--text-muted)',
              border: '1px solid var(--road-yellow-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.35rem 0.65rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            In Cooldown
          </button>
        </div>
      </div>

      {/* Grid of Bridge Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading active FOB bridges...
        </div>
      ) : filteredBridges.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <MapPin size={36} color="var(--road-yellow)" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>No bridges match your search criteria</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Try adjusting your search query or city filters
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCity('All');
              setAvailabilityFilter('all');
            }}
            className="btn btn-secondary"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredBridges.map((bridge) => (
            <BridgeCard
              key={bridge._id}
              bridge={bridge}
              onOpenQrModal={(b) => setSelectedBridgeForQr(b)}
              onStartDirect={(b) => setSelectedBridgeForQr(b)}
            />
          ))}
        </div>
      )}

      {/* QR Viewer Modal */}
      <QrViewerModal
        bridge={selectedBridgeForQr}
        isOpen={!!selectedBridgeForQr}
        onClose={() => setSelectedBridgeForQr(null)}
      />
    </div>
  );
};

export default BridgesPage;
