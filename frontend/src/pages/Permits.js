import React, { useState, useEffect } from 'react';
import { permitAPI, vehicleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiPlus, FiXCircle, FiFileText } from 'react-icons/fi';

const Permits = () => {
  const [permits, setPermits] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const { isAdmin } = useAuth();
  const [form, setForm] = useState({
    vehicleId: '', authorizedZone: '', zoneCenterLat: '', zoneCenterLng: '', zoneRadiusKm: 5,
    destinationName: '', destinationLat: '', destinationLng: '',
    maxLoadPerTrip: 20, maxTripsPerDay: 5, totalAllowedVolume: 500, validTo: '',
  });

  const fetchData = async () => {
    try {
      const [pRes, vRes] = await Promise.all([
        permitAPI.getAll({ status: statusFilter || undefined }),
        vehicleAPI.getAll(),
      ]);
      setPermits(pRes.data.permits);
      setVehicles(vRes.data.vehicles);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const permitNumber = 'PRM-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      await permitAPI.create({ ...form, permitNumber, validFrom: new Date().toISOString() });
      toast.success('Permit created!');
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create permit');
    }
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Revoke this permit?')) return;
    try {
      await permitAPI.revoke(id);
      toast.success('Permit revoked');
      fetchData();
    } catch (error) {
      toast.error('Failed to revoke');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <>
      <div className="filters-bar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="suspended">Suspended</option>
          <option value="revoked">Revoked</option>
        </select>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} style={{ marginLeft: 'auto' }}>
            <FiPlus /> Issue Permit
          </button>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Permit #</th>
                <th>Vehicle</th>
                <th>Zone</th>
                <th>Limits</th>
                <th>Volume Used</th>
                <th>Valid Period</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {permits.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.permitNumber}</strong></td>
                  <td>{p.vehicle?.registrationNumber || 'N/A'}</td>
                  <td>{p.authorizedZone}</td>
                  <td>{p.maxLoadPerTrip}T/trip · {p.maxTripsPerDay} trips/day</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min((p.usedVolume / p.totalAllowedVolume) * 100, 100)}%`, height: '100%', background: p.usedVolume / p.totalAllowedVolume > 0.8 ? 'var(--accent-red)' : 'var(--accent-green)', borderRadius: 3 }}></div>
                      </div>
                      <span style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{p.usedVolume}/{p.totalAllowedVolume}m³</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 12 }}>{new Date(p.validFrom).toLocaleDateString()} — {new Date(p.validTo).toLocaleDateString()}</td>
                  <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                  <td>
                    {isAdmin && p.status === 'active' && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleRevoke(p.id)}><FiXCircle /> Revoke</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {permits.length === 0 && <div className="empty-state"><div className="icon"><FiFileText /></div><h3>No permits found</h3></div>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Issue New Permit</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Vehicle *</label>
                  <select required value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                    <option value="">Select vehicle</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.registrationNumber} — {v.ownerName}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Authorized Zone Name *</label><input required value={form.authorizedZone} onChange={(e) => setForm({ ...form, authorizedZone: e.target.value })} placeholder="Mining Zone A" /></div>
                <div className="grid-2">
                  <div className="form-group"><label>Zone Center Lat *</label><input type="number" step="any" required value={form.zoneCenterLat} onChange={(e) => setForm({ ...form, zoneCenterLat: e.target.value })} /></div>
                  <div className="form-group"><label>Zone Center Lng *</label><input type="number" step="any" required value={form.zoneCenterLng} onChange={(e) => setForm({ ...form, zoneCenterLng: e.target.value })} /></div>
                </div>
                <div className="form-group"><label>Zone Radius (km)</label><input type="number" step="0.1" value={form.zoneRadiusKm} onChange={(e) => setForm({ ...form, zoneRadiusKm: e.target.value })} /></div>
                <div className="form-group"><label>Destination</label><input value={form.destinationName} onChange={(e) => setForm({ ...form, destinationName: e.target.value })} placeholder="Chennai Port" /></div>
                <div className="grid-2">
                  <div className="form-group"><label>Max Load/Trip (T)</label><input type="number" value={form.maxLoadPerTrip} onChange={(e) => setForm({ ...form, maxLoadPerTrip: e.target.value })} /></div>
                  <div className="form-group"><label>Max Trips/Day</label><input type="number" value={form.maxTripsPerDay} onChange={(e) => setForm({ ...form, maxTripsPerDay: e.target.value })} /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label>Total Volume (m³)</label><input type="number" value={form.totalAllowedVolume} onChange={(e) => setForm({ ...form, totalAllowedVolume: e.target.value })} /></div>
                  <div className="form-group"><label>Valid Until *</label><input type="date" required value={form.validTo} onChange={(e) => setForm({ ...form, validTo: e.target.value })} /></div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Issue Permit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Permits;
