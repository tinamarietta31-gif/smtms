import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import { geofenceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiTarget } from 'react-icons/fi';

const getColor = (type) => {
  switch (type) {
    case 'authorized_zone': return '#66bb6a';
    case 'restricted_zone': return '#ef5350';
    case 'delivery_zone': return '#4fc3f7';
    case 'checkpoint': return '#ffa726';
    default: return '#78909c';
  }
};

const Geofences = () => {
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { isAdmin } = useAuth();
  const [form, setForm] = useState({ name: '', type: 'authorized_zone', centerLatitude: '', centerLongitude: '', radiusKm: 1 });

  const fetchData = async () => {
    try {
      const res = await geofenceAPI.getAll();
      setGeofences(res.data.geofences);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, radius: form.radiusKm * 1000 };
      await geofenceAPI.create(payload);
      toast.success('Geofence created!');
      setShowModal(false);
      setForm({ name: '', type: 'authorized_zone', centerLatitude: '', centerLongitude: '', radiusKm: 1 });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this geofence?')) return;
    try {
      await geofenceAPI.delete(id);
      toast.success('Geofence deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <>
      <div className="filters-bar">
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          🟢 Authorized &nbsp; 🔴 Restricted &nbsp; 🔵 Delivery &nbsp; 🟠 Checkpoint
        </span>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} style={{ marginLeft: 'auto' }}>
            <FiPlus /> Add Geofence
          </button>
        )}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="map-container" style={{ height: 500 }}>
          <MapContainer center={[13.0, 80.0]} zoom={9} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            {geofences.filter(gf => gf.centerLatitude != null && gf.centerLongitude != null && !isNaN(gf.radius)).map((gf) => (
              <Circle
                key={gf.id}
                center={[Number(gf.centerLatitude) || 0, Number(gf.centerLongitude) || 0]}
                radius={Number(gf.radius) || 0}
                pathOptions={{ color: getColor(gf.type), fillColor: getColor(gf.type), fillOpacity: 0.15, weight: 2 }}
              >
                <Popup><strong>{gf.name}</strong><br />{(gf.type || '').replace(/_/g, ' ')} · {gf.radius ? (gf.radius / 1000).toFixed(1) : 0} km</Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>

        <div className="card">
          <div className="card-header"><h3>Geofence List</h3></div>
          <div className="card-body" style={{ padding: 0, maxHeight: 460, overflowY: 'auto' }}>
            {geofences.map((gf) => (
              <div key={gf.id} className="alert-item">
                <div className="alert-icon" style={{ background: `${getColor(gf.type)}20`, color: getColor(gf.type) }}><FiTarget /></div>
                <div className="alert-content">
                  <div className="message">{gf.name}</div>
                  <div className="meta">{(gf.type || '').replace(/_/g, ' ')} · Radius: {gf.radius ? (gf.radius / 1000).toFixed(1) : 0} km</div>
                  <div className="meta">📍 {Number(gf.centerLatitude || 0).toFixed(4)}, {Number(gf.centerLongitude || 0).toFixed(4)}</div>
                </div>
                {isAdmin && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(gf.id)}><FiTrash2 /></button>
                )}
              </div>
            ))}
            {geofences.length === 0 && <div className="empty-state"><h3>No geofences</h3></div>}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Geofence</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group"><label>Name *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Mining Zone C" /></div>
                <div className="form-group">
                  <label>Type *</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="authorized_zone">Authorized Zone</option>
                    <option value="restricted_zone">Restricted Zone</option>
                    <option value="delivery_zone">Delivery Zone</option>
                    <option value="checkpoint">Checkpoint</option>
                  </select>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label>Center Latitude *</label><input type="number" step="any" required value={form.centerLatitude} onChange={(e) => setForm({ ...form, centerLatitude: e.target.value })} /></div>
                  <div className="form-group"><label>Center Longitude *</label><input type="number" step="any" required value={form.centerLongitude} onChange={(e) => setForm({ ...form, centerLongitude: e.target.value })} /></div>
                </div>
                <div className="form-group"><label>Radius (km) *</label><input type="number" step="0.1" required value={form.radiusKm} onChange={(e) => setForm({ ...form, radiusKm: e.target.value })} /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Geofence</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Geofences;
