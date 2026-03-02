import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { vehicleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiStopCircle, FiPlayCircle, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [vehicle, setVehicle] = useState(null);
  const [trail, setTrail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await vehicleAPI.getById(id);
        setVehicle(res.data.vehicle);
        setTrail(res.data.vehicle.gpsLogs || []);
      } catch (error) {
        toast.error('Failed to load vehicle');
        navigate('/vehicles');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleStop = async () => {
    if (!window.confirm('Remotely stop this vehicle?')) return;
    try {
      await vehicleAPI.stop(id);
      toast.success('Vehicle stop command sent!');
      const res = await vehicleAPI.getById(id);
      setVehicle(res.data.vehicle);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed');
    }
  };

  const handleResume = async () => {
    try {
      await vehicleAPI.resume(id);
      toast.success('Vehicle resumed!');
      const res = await vehicleAPI.getById(id);
      setVehicle(res.data.vehicle);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed');
    }
  };

  const handleRemove = async () => {
    if (!window.confirm(`Are you absolutely sure you want to permanently delete vehicle ${vehicle.registrationNumber}?`)) return;
    try {
      await vehicleAPI.delete(id);
      toast.success(`Vehicle successfully removed!`);
      navigate('/vehicles');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to remove vehicle');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!vehicle) return null;

  const trailPath = trail.map(t => [t.latitude, t.longitude]);

  return (
    <>
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate('/vehicles')}><FiArrowLeft /> Back to Vehicles</button>
        <div style={{ display: 'flex', gap: 12 }}>
          {isAdmin && (
            <>
              {vehicle.ecmStatus === 'stopped' ? (
                <button className="btn btn-success" onClick={handleResume}><FiPlayCircle /> Resume Vehicle</button>
              ) : (
                <button className="btn btn-warning" onClick={handleStop}><FiStopCircle /> Remote Stop</button>
              )}
              <button className="btn btn-danger" onClick={handleRemove}><FiTrash2 /> Remove Vehicle</button>
            </>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 style={{ fontSize: 22 }}>{vehicle.registrationNumber}</h3>
          <span className={`badge badge - ${vehicle.status} `}>{vehicle.status}</span>
        </div>
        <div className="card-body">
          <div className="tabs">
            {['info', 'map', 'trips', 'violations', 'alerts'].map(t => (
              <button key={t} className={`tab ${tab === t ? 'active' : ''} `} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {tab === 'info' && (
            <div className="info-grid">
              <div className="info-item"><div className="info-label">Owner</div><div className="info-value">{vehicle.ownerName}</div></div>
              <div className="info-item"><div className="info-label">Owner Phone</div><div className="info-value">{vehicle.ownerPhone || 'N/A'}</div></div>
              <div className="info-item"><div className="info-label">Driver</div><div className="info-value">{vehicle.driverName || 'N/A'}</div></div>
              <div className="info-item"><div className="info-label">Driver Phone</div><div className="info-value">{vehicle.driverPhone || 'N/A'}</div></div>
              <div className="info-item"><div className="info-label">License</div><div className="info-value">{vehicle.driverLicense || 'N/A'}</div></div>
              <div className="info-item"><div className="info-label">Vehicle Type</div><div className="info-value">{vehicle.vehicleType}</div></div>
              <div className="info-item"><div className="info-label">Make / Model</div><div className="info-value">{vehicle.manufacturer} {vehicle.model} ({vehicle.year})</div></div>
              <div className="info-item"><div className="info-label">Max Load</div><div className="info-value">{vehicle.maxLoadCapacity} Tonnes</div></div>
              <div className="info-item"><div className="info-label">Current Load</div><div className="info-value">{vehicle.currentLoad} Tonnes</div></div>
              <div className="info-item"><div className="info-label">Speed</div><div className="info-value">{vehicle.currentSpeed?.toFixed(0)} km/h</div></div>
              <div className="info-item"><div className="info-label">GPS Status</div><div className="info-value">{vehicle.isGPSActive ? '🟢 Online' : '🔴 Offline'}</div></div>
              <div className="info-item"><div className="info-label">Built-in GPS</div><div className="info-value">{vehicle.hasBuiltInGPS ? 'Yes' : 'No'}</div></div>
              <div className="info-item"><div className="info-label">GPS Device ID</div><div className="info-value">{vehicle.gpsDeviceId || 'N/A'}</div></div>
              <div className="info-item"><div className="info-label">Remote Stopped</div><div className="info-value">{vehicle.ecmStatus === 'stopped' ? '🔴 Yes' : '🟢 No'}</div></div>
              <div className="info-item"><div className="info-label">Last Seen</div><div className="info-value">{vehicle.lastSeenAt ? new Date(vehicle.lastSeenAt).toLocaleString() : 'Never'}</div></div>
              <div className="info-item"><div className="info-label">Coordinates</div><div className="info-value">{vehicle.currentLatitude?.toFixed(4)}, {vehicle.currentLongitude?.toFixed(4)}</div></div>

              {isAdmin && (
                <div className="info-item" style={{ gridColumn: '1 / -1', marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-danger" onClick={handleRemove}><FiTrash2 /> Remove Vehicle</button>
                </div>
              )}
            </div>
          )}

          {tab === 'map' && (
            <div className="map-container" style={{ height: 450 }}>
              <MapContainer center={vehicle.currentLatitude ? [vehicle.currentLatitude, vehicle.currentLongitude] : [13.0827, 80.2707]} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                {vehicle.currentLatitude && (
                  <Marker position={[vehicle.currentLatitude, vehicle.currentLongitude]}>
                    <Popup>{vehicle.registrationNumber} — Current Location</Popup>
                  </Marker>
                )}
                {trailPath.length > 1 && <Polyline positions={trailPath} color="#4fc3f7" weight={3} opacity={0.8} />}
              </MapContainer>
            </div>
          )}

          {tab === 'trips' && (
            <div className="table-container">
              <table>
                <thead><tr><th>ID</th><th>Start Time</th><th>End Time</th><th>Load</th><th>Distance</th><th>Status</th><th>Authorized</th></tr></thead>
                <tbody>
                  {(vehicle.trips || []).map(t => (
                    <tr key={t.id}>
                      <td>#{t.id}</td>
                      <td>{new Date(t.startTime).toLocaleString()}</td>
                      <td>{t.endTime ? new Date(t.endTime).toLocaleString() : '—'}</td>
                      <td>{t.loadWeight}T</td>
                      <td>{t.distance ? `${t.distance} km` : '—'}</td>
                      <td><span className={`badge badge - ${t.status} `}>{t.status}</span></td>
                      <td>{t.isAuthorized ? '✅' : '❌'}</td>
                    </tr>
                  ))}
                  {(!vehicle.trips || vehicle.trips.length === 0) && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No trips recorded</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'violations' && (
            <div className="table-container">
              <table>
                <thead><tr><th>Type</th><th>Severity</th><th>Description</th><th>Challan</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {(vehicle.violations || []).map(v => (
                    <tr key={v.id}>
                      <td>{v.type?.replace(/_/g, ' ')}</td>
                      <td><span className={`badge badge - ${v.severity} `}>{v.severity}</span></td>
                      <td>{v.description?.substring(0, 60)}...</td>
                      <td>{v.challanGenerated ? `${v.challanNumber} (₹${v.challanAmount})` : '—'}</td>
                      <td><span className={`badge badge - ${v.status} `}>{v.status}</span></td>
                      <td>{new Date(v.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {(!vehicle.violations || vehicle.violations.length === 0) && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No violations</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'alerts' && (
            <div>
              {(vehicle.alerts || []).map(a => (
                <div key={a.id} className="alert-item">
                  <div className="alert-icon" style={{ background: 'rgba(255,167,38,0.15)', color: 'var(--accent-orange)' }}><FiAlertTriangle /></div>
                  <div className="alert-content">
                    <div className="message">{a.type?.replace(/_/g, ' ')}</div>
                    <div className="meta">{a.message}</div>
                    <div className="meta">{new Date(a.createdAt).toLocaleString()}</div>
                  </div>
                  <span className={`badge badge - ${a.severity} `}>{a.severity}</span>
                </div>
              ))}
              {(!vehicle.alerts || vehicle.alerts.length === 0) && <div className="empty-state"><h3>No alerts</h3></div>}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VehicleDetail;
