import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import { infrastructureAPI, vehicleAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiMapPin, FiAlertTriangle, FiCheck, FiXCircle, FiWifiOff, FiCamera, FiSearch } from 'react-icons/fi';

const typeColors = {
  toll_plaza: '#ef5350',
  traffic_signal: '#ffa726',
  checkpoint: '#ab47bc',
  weighbridge: '#4fc3f7',
  cctv_junction: '#66bb6a',
};

const typeLabels = {
  toll_plaza: 'Toll Plaza',
  traffic_signal: 'Traffic Signal',
  checkpoint: 'Checkpoint',
  weighbridge: 'Weighbridge',
  cctv_junction: 'CCTV Junction',
};

const matchIcons = {
  matched: { icon: <FiCheck />, color: 'var(--accent-green)', label: 'GPS Matched' },
  mismatch: { icon: <FiXCircle />, color: 'var(--accent-red)', label: 'GPS Mismatch' },
  gps_offline: { icon: <FiWifiOff />, color: 'var(--accent-orange)', label: 'GPS Offline' },
  no_data: { icon: <FiSearch />, color: 'var(--text-muted)', label: 'No Data' },
};

const createInfraIcon = (imgUrl) => {
  return L.icon({
    iconUrl: imgUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
    className: 'custom-infra-logo'
  });
};

const trafficSignalIcon = createInfraIcon('https://img.icons8.com/color/48/traffic-light.png');
const tollPlazaIcon = createInfraIcon('https://img.icons8.com/color/48/tollbooth.png');
const checkpointIcon = createInfraIcon('https://img.icons8.com/color/48/police-badge.png');

const Infrastructure = () => {
  const [infra, setInfra] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('map');
  const [typeFilter, setTypeFilter] = useState('');
  const [logFilter, setLogFilter] = useState('');
  const [showDetectModal, setShowDetectModal] = useState(false);
  const [detectForm, setDetectForm] = useState({ vehicleId: '', infrastructureId: '', source: 'anpr' });

  const fetchData = async () => {
    try {
      const [infraRes, logRes, statsRes, vRes] = await Promise.all([
        infrastructureAPI.getAll({ type: typeFilter || undefined }),
        infrastructureAPI.getLogs({ gpsMatchStatus: logFilter || undefined }),
        infrastructureAPI.getStats(),
        vehicleAPI.getAll(),
      ]);
      setInfra(infraRes.data.infrastructure);
      setLogs(logRes.data.logs);
      setStats(statsRes.data.stats);
      setVehicles(vRes.data.vehicles);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [typeFilter, logFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDetect = async (e) => {
    e.preventDefault();
    try {
      const res = await infrastructureAPI.recordDetection(detectForm);
      toast.success('Detection recorded!');
      if (res.data.log?.isSuspicious) {
        toast.warning('⚠️ SUSPICIOUS: GPS mismatch detected!');
      }
      setShowDetectModal(false);
      setDetectForm({ vehicleId: '', infrastructureId: '', source: 'anpr' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed');
    }
  };

  const handleCrossVerify = async () => {
    try {
      toast.info('Running cross-verification...');
      const res = await infrastructureAPI.crossVerify();
      const suspicious = res.data.results.filter(r => r.isSuspicious);
      if (suspicious.length > 0) {
        toast.warning(`${suspicious.length} vehicle(s) with suspicious GPS data!`);
      } else {
        toast.success('All vehicles verified — no mismatches found.');
      }
    } catch (error) {
      toast.error('Cross-verification failed');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const suspiciousLogs = logs.filter(l => l.isSuspicious);

  return (
    <>
      {/* Stats Row */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => setTab('list')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <div><div className="stat-label">Total Points</div><div className="stat-value">{stats?.totalInfra || 0}</div></div>
            <div className="icon blue"><FiMapPin /></div>
          </div>
          <div className="stat-sub">Toll · Signal · Checkpoint · CCTV</div>
        </div>
        <div className="stat-card" onClick={() => { setTab('map'); setTypeFilter('toll_plaza'); }} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <div><div className="stat-label">Toll Plazas</div><div className="stat-value">{stats?.tollPlazas || 0}</div></div>
            <div className="icon" style={{ background: 'transparent' }}>
              <img src="https://img.icons8.com/color/48/tollbooth.png" alt="Toll Plaza" width="32" height="32" />
            </div>
          </div>
          <div className="stat-sub">Chennai radius toll plazas</div>
        </div>
        <div className="stat-card" onClick={() => { setTab('map'); setTypeFilter('traffic_signal'); }} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <div><div className="stat-label">Traffic Signals</div><div className="stat-value">{stats?.trafficSignals || 0}</div></div>
            <div className="icon" style={{ background: 'transparent' }}>
              <img src="https://img.icons8.com/color/48/traffic-light.png" alt="Traffic Signal" width="32" height="32" />
            </div>
          </div>
          <div className="stat-sub">Major ANPR-enabled junctions</div>
        </div>
        <div className="stat-card" onClick={() => setTab('suspicious')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <div><div className="stat-label">GPS Mismatches</div><div className="stat-value" style={{ color: 'var(--accent-red)' }}>{stats?.mismatchLogs || 0}</div></div>
            <div className="icon red"><FiAlertTriangle /></div>
          </div>
          <div className="stat-sub">{stats?.suspiciousLogs || 0} suspicious detections</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['map', 'detections', 'suspicious', 'list'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'map' ? '🗺️ Map View' : t === 'detections' ? `📋 All Detections (${logs.length})` : t === 'suspicious' ? `🚨 Suspicious (${suspiciousLogs.length})` : `📍 All Points (${infra.length})`}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="filters-bar">
        {tab === 'map' && (
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="toll_plaza">Toll Plazas</option>
            <option value="traffic_signal">Traffic Signals</option>
            <option value="checkpoint">Checkpoints</option>
            <option value="weighbridge">Weighbridges</option>
            <option value="cctv_junction">CCTV Junctions</option>
          </select>
        )}
        {(tab === 'detections' || tab === 'suspicious') && (
          <select value={logFilter} onChange={(e) => setLogFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="matched">GPS Matched</option>
            <option value="mismatch">GPS Mismatch</option>
            <option value="gps_offline">GPS Offline</option>
            <option value="no_data">No Data</option>
          </select>
        )}
        <button className="btn btn-primary btn-sm" onClick={() => setShowDetectModal(true)}>
          <FiCamera /> Record Detection
        </button>
        <button className="btn btn-warning btn-sm" onClick={handleCrossVerify}>
          <FiSearch /> Cross-Verify GPS
        </button>
      </div>

      {/* MAP TAB */}
      {tab === 'map' && (
        <div className="map-container" style={{ height: 'calc(100vh - 380px)' }}>
          <MapContainer center={[13.0827, 80.2707]} zoom={11} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            {infra.map((p) => {
              let iconShape = null;
              if (p.type === 'traffic_signal') iconShape = trafficSignalIcon;
              else if (p.type === 'toll_plaza') iconShape = tollPlazaIcon;
              else if (p.type === 'checkpoint') iconShape = checkpointIcon;

              if (iconShape) {
                return (
                  <Marker
                    key={p.id}
                    position={[p.latitude, p.longitude]}
                    icon={iconShape}
                  >
                    <Popup minWidth={260}>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
                        <strong style={{ fontSize: 15 }}>{p.name}</strong><br />
                        <div style={{ margin: '6px 0', lineHeight: 1.8 }}>
                          <div>{typeLabels[p.type]}</div>
                          <div>📍 {p.address}</div>
                          <div>🛤️ {p.road}</div>
                          <div>🗺️ Zone: {p.zone}</div>
                          <div>📡 ANPR: {p.hasANPR ? '✅ Yes' : '❌ No'}</div>
                          <div>📹 CCTV: {p.hasCCTV ? '✅ Yes' : '❌ No'}</div>
                          <div style={{ fontSize: 11, color: '#888' }}>({p.latitude.toFixed(4)}, {p.longitude.toFixed(4)})</div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              return (
                <CircleMarker
                  key={p.id}
                  center={[p.latitude, p.longitude]}
                  radius={p.type === 'toll_plaza' ? 10 : p.type === 'checkpoint' || p.type === 'weighbridge' ? 9 : 7}
                  pathOptions={{ color: typeColors[p.type], fillColor: typeColors[p.type], fillOpacity: 0.7, weight: 2 }}
                >
                  <Popup minWidth={260}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
                      <strong style={{ fontSize: 15 }}>{p.name}</strong><br />
                      <div style={{ margin: '6px 0', lineHeight: 1.8 }}>
                        <div>{typeLabels[p.type]}</div>
                        <div>📍 {p.address}</div>
                        <div>🛤️ {p.road}</div>
                        <div>🗺️ Zone: {p.zone}</div>
                        <div>📡 ANPR: {p.hasANPR ? '✅ Yes' : '❌ No'}</div>
                        <div>📹 CCTV: {p.hasCCTV ? '✅ Yes' : '❌ No'}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>({p.latitude.toFixed(4)}, {p.longitude.toFixed(4)})</div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      )}

      {/* DETECTIONS TAB */}
      {(tab === 'detections' || tab === 'suspicious') && (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Vehicle</th>
                  <th>Detected At</th>
                  <th>Source</th>
                  <th>GPS Status</th>
                  <th>Distance</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {(tab === 'suspicious' ? suspiciousLogs : logs).map((log) => {
                  const matchInfo = matchIcons[log.gpsMatchStatus] || matchIcons.no_data;
                  return (
                    <tr key={log.id} style={{ background: log.isSuspicious ? 'rgba(239,83,80,0.06)' : 'transparent' }}>
                      <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(log.detectedAt).toLocaleString()}</td>
                      <td>
                        <strong>{log.vehicle?.registrationNumber || log.registrationNumber}</strong>
                        <br /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.vehicle?.ownerName}</span>
                      </td>
                      <td>
                        <strong>{log.infrastructure?.name}</strong>
                        <br /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.infrastructure?.type?.replace(/_/g, ' ')}</span>
                      </td>
                      <td><span className="badge badge-info">{log.source}</span></td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: matchInfo.color, fontWeight: 600, fontSize: 13 }}>
                          {matchInfo.icon} {matchInfo.label}
                        </span>
                      </td>
                      <td>
                        {log.distanceFromInfra !== null ? (
                          <span style={{ color: log.distanceFromInfra > 1 ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 700 }}>
                            {log.distanceFromInfra.toFixed(2)} km
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ maxWidth: 280, fontSize: 12, lineHeight: 1.5 }}>
                        {log.isSuspicious && <span style={{ color: 'var(--accent-red)', fontWeight: 700 }}>⚠️ SUSPICIOUS: </span>}
                        {log.notes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {(tab === 'suspicious' ? suspiciousLogs : logs).length === 0 && (
            <div className="empty-state"><div className="icon"><FiCamera /></div><h3>No detection logs found</h3></div>
          )}
        </div>
      )}

      {/* LIST TAB */}
      {tab === 'list' && (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Road</th>
                  <th>Zone</th>
                  <th>ANPR</th>
                  <th>CCTV</th>
                  <th>Coordinates</th>
                </tr>
              </thead>
              <tbody>
                {infra.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong><br /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.address}</span></td>
                    <td><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: typeColors[p.type], display: 'inline-block' }}></span>
                      {p.type?.replace(/_/g, ' ')}
                    </span></td>
                    <td>{p.road}</td>
                    <td>{p.zone}</td>
                    <td>{p.hasANPR ? '✅' : '❌'}</td>
                    <td>{p.hasCCTV ? '✅' : '❌'}</td>
                    <td style={{ fontSize: 12 }}>{p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD DETECTION MODAL */}
      {showDetectModal && (
        <div className="modal-overlay" onClick={() => setShowDetectModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record ANPR / Toll Detection</h3>
              <button className="modal-close" onClick={() => setShowDetectModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleDetect}>
              <div className="modal-body">
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                  Simulate a vehicle detection at a toll plaza, traffic signal, or checkpoint. The system will automatically cross-check the vehicle's GPS location at the time of detection.
                </p>
                <div className="form-group">
                  <label>Vehicle *</label>
                  <select required value={detectForm.vehicleId} onChange={(e) => setDetectForm({ ...detectForm, vehicleId: e.target.value })}>
                    <option value="">Select vehicle</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.registrationNumber} — {v.ownerName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Infrastructure Point *</label>
                  <select required value={detectForm.infrastructureId} onChange={(e) => setDetectForm({ ...detectForm, infrastructureId: e.target.value })}>
                    <option value="">Select toll/signal/checkpoint</option>
                    {infra.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type?.replace(/_/g, ' ')})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Detection Source</label>
                  <select value={detectForm.source} onChange={(e) => setDetectForm({ ...detectForm, source: e.target.value })}>
                    <option value="anpr">ANPR Camera</option>
                    <option value="toll_record">Toll Record</option>
                    <option value="cctv">CCTV</option>
                    <option value="manual">Manual Entry</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowDetectModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Record & Verify GPS</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Infrastructure;
