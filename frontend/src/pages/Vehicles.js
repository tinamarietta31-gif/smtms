import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiPlus, FiEye, FiStopCircle, FiPlayCircle, FiWifi, FiWifiOff } from 'react-icons/fi';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ registrationNumber: '', ownerName: '', ownerPhone: '', driverName: '', driverPhone: '', driverLicense: '', vehicleType: 'truck', manufacturer: '', model: '', year: '', maxLoadCapacity: 20, hasBuiltInGPS: false });
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const fetchVehicles = async () => {
    try {
      const res = await vehicleAPI.getAll({ search, status: statusFilter });
      setVehicles(res.data.vehicles);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, [search, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await vehicleAPI.create(form);
      toast.success('Vehicle registered!');
      setShowModal(false);
      setForm({ registrationNumber: '', ownerName: '', ownerPhone: '', driverName: '', driverPhone: '', driverLicense: '', vehicleType: 'truck', manufacturer: '', model: '', year: '', maxLoadCapacity: 20, hasBuiltInGPS: false });
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to register vehicle');
    }
  };

  const handleStop = async (id) => {
    if (!window.confirm('Are you sure you want to remotely stop this vehicle?')) return;
    try {
      await vehicleAPI.stop(id);
      toast.success('Vehicle stop command sent!');
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed');
    }
  };

  const handleResume = async (id) => {
    try {
      await vehicleAPI.resume(id);
      toast.success('Vehicle resumed!');
      fetchVehicles();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <>
      <div className="filters-bar">
        <input type="text" placeholder="Search by registration, owner, driver..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 300 }} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="stopped">Stopped</option>
        </select>
        {isAdmin && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} style={{ marginLeft: 'auto' }}>
            <FiPlus /> Register Vehicle
          </button>
        )}
      </div>

      <div className="vehicle-card-grid">
        {vehicles.map((v) => (
          <div key={v.id} className="vehicle-card">
            <div className="vc-header">
              <span className="vc-reg">{v.registrationNumber}</span>
              <span className={`badge badge-${v.status}`}>{v.status}</span>
            </div>
            <div className="vc-detail"><span className="label">Owner</span><span>{v.ownerName}</span></div>
            <div className="vc-detail"><span className="label">Driver</span><span>{v.driverName || 'N/A'}</span></div>
            <div className="vc-detail"><span className="label">Vehicle</span><span>{v.manufacturer} {v.model}</span></div>
            <div className="vc-detail"><span className="label">Type</span><span>{v.vehicleType}</span></div>
            <div className="vc-detail"><span className="label">Load</span><span>{v.currentLoad}T / {v.maxLoadCapacity}T</span></div>
            <div className="vc-detail"><span className="label">Speed</span><span>{v.currentSpeed?.toFixed(0)} km/h</span></div>
            <div className="vc-detail">
              <span className="label">GPS</span>
              <span>{v.isGPSActive ? <><FiWifi style={{ color: 'var(--accent-green)' }} /> Online</> : <><FiWifiOff style={{ color: 'var(--accent-red)' }} /> Offline</>}</span>
            </div>
            <div className="vc-actions">
              <button className="btn btn-primary btn-sm" onClick={() => navigate(`/vehicles/${v.id}`)}><FiEye /> View</button>
              {isAdmin && (
                v.ecmStatus === 'stopped' ? (
                  <button className="btn btn-success btn-sm" onClick={() => handleResume(v.id)}><FiPlayCircle /> Resume</button>
                ) : (
                  <button className="btn btn-danger btn-sm" onClick={() => handleStop(v.id)}><FiStopCircle /> Stop</button>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      {vehicles.length === 0 && <div className="empty-state"><div className="icon">🚛</div><h3>No vehicles found</h3></div>}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Register New Vehicle</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Registration Number *</label>
                  <input required value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} placeholder="TN01AB1234" />
                </div>
                <div className="grid-2">
                  <div className="form-group"><label>Owner Name *</label><input required value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} /></div>
                  <div className="form-group"><label>Owner Phone</label><input value={form.ownerPhone} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })} /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label>Driver Name</label><input value={form.driverName} onChange={(e) => setForm({ ...form, driverName: e.target.value })} /></div>
                  <div className="form-group"><label>Driver Phone</label><input value={form.driverPhone} onChange={(e) => setForm({ ...form, driverPhone: e.target.value })} /></div>
                </div>
                <div className="form-group"><label>Driver License</label><input value={form.driverLicense} onChange={(e) => setForm({ ...form, driverLicense: e.target.value })} /></div>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Vehicle Type</label>
                    <select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}>
                      <option value="truck">Truck</option><option value="tipper">Tipper</option><option value="dumper">Dumper</option><option value="trailer">Trailer</option><option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group"><label>Max Load (Tonnes)</label><input type="number" value={form.maxLoadCapacity} onChange={(e) => setForm({ ...form, maxLoadCapacity: e.target.value })} /></div>
                </div>
                <div className="grid-2">
                  <div className="form-group"><label>Manufacturer</label><input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} placeholder="Bharat Benz" /></div>
                  <div className="form-group"><label>Model</label><input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></div>
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.hasBuiltInGPS} onChange={(e) => setForm({ ...form, hasBuiltInGPS: e.target.checked })} />
                    Has Built-in GPS System
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Vehicles;
