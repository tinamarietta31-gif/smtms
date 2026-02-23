import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { vehicleAPI, geofenceAPI, infrastructureAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiStopCircle, FiPlayCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

// Fix default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createVehicleIcon = (status, isGPSActive) => {
  let color = '#66bb6a';
  if (status === 'stopped' || !isGPSActive) color = '#ef5350';
  else if (status === 'suspended') color = '#ffa726';

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 32px; height: 32px;
      border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; color: #fff;
    ">🚛</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  });
};

const getGeofenceColor = (type) => {
  switch (type) {
    case 'authorized_zone': return { color: '#66bb6a', fillColor: '#66bb6a' };
    case 'restricted_zone': return { color: '#ef5350', fillColor: '#ef5350' };
    case 'delivery_zone': return { color: '#4fc3f7', fillColor: '#4fc3f7' };
    case 'checkpoint': return { color: '#ab47bc', fillColor: '#ab47bc' };
    default: return { color: '#78909c', fillColor: '#78909c' };
  }
};

const createInfraIcon = (imgUrl) => {
  return L.icon({
    iconUrl: imgUrl,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
    className: 'custom-infra-logo'
  });
};

const trafficSignalIcon = createInfraIcon('https://img.icons8.com/color/48/traffic-light.png');
const tollPlazaIcon = createInfraIcon('https://img.icons8.com/color/48/tollbooth.png');
const checkpointIcon = createInfraIcon('https://img.icons8.com/color/48/police-badge.png');

const FitBounds = ({ vehicles }) => {
  const map = useMap();
  const [hasFitted, setHasFitted] = useState(false);

  useEffect(() => {
    if (hasFitted) return;
    const validVehicles = vehicles.filter(v => v.currentLatitude && v.currentLongitude);
    if (validVehicles.length > 0) {
      const bounds = L.latLngBounds(validVehicles.map(v => [v.currentLatitude, v.currentLongitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      setHasFitted(true);
    }
  }, [vehicles, map, hasFitted]);
  return null;
};

const LiveMap = () => {
  const [vehicles, setVehicles] = useState([]);
  const [geofences, setGeofences] = useState([]);
  const [infra, setInfra] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGeofences, setShowGeofences] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [vRes, gRes, iRes] = await Promise.all([vehicleAPI.getAll(), geofenceAPI.getAll(), infrastructureAPI.getAll()]);
      setVehicles(vRes.data.vehicles);
      setGeofences(gRes.data.geofences);
      setInfra(iRes.data.infrastructure);
    } catch (error) {
      console.error('Map data error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Connect to WebSocket using the backend URL (assuming 5001 locally or REACT_APP_API_URL)
    const backendUrl = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:5001';
    const socket = io(backendUrl);

    socket.on('vehiclesUpdate', (updatedVehicles) => {
      setVehicles((prevVehicles) => {
        const newVehicles = [...prevVehicles];
        updatedVehicles.forEach(uv => {
          const index = newVehicles.findIndex(v => v.id === uv.id);
          if (index !== -1) {
            newVehicles[index] = { ...newVehicles[index], ...uv };
          } else {
            newVehicles.push(uv);
          }
        });
        return newVehicles;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleStop = async (id) => {
    try {
      await vehicleAPI.stop(id);
      toast.success('Vehicle stop command sent!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to stop vehicle');
    }
  };

  const handleResume = async (id) => {
    try {
      await vehicleAPI.resume(id);
      toast.success('Vehicle resumed!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resume vehicle');
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'gps_off') return !v.isGPSActive;
    if (filterStatus === 'stopped') return v.ecmStatus === 'stopped';
    return v.status === filterStatus;
  });

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <>
      <div className="filters-bar">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Vehicles ({vehicles.length})</option>
          <option value="active">Active</option>
          <option value="stopped">Stopped</option>
          <option value="gps_off">GPS Offline</option>
          <option value="inactive">Inactive</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={showGeofences} onChange={(e) => setShowGeofences(e.target.checked)} />
          Show Geofences
        </label>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
          🟢 Active &nbsp; 🔴 Stopped/Offline &nbsp; 🟠 Suspended
        </span>
      </div>

      <div className="map-container" style={{ height: 'calc(100vh - 220px)' }}>
        <MapContainer center={[13.0827, 80.2707]} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds vehicles={filteredVehicles.filter(v => v.currentLatitude)} />

          {showGeofences && geofences.filter(gf => gf.centerLatitude != null && gf.centerLongitude != null && !isNaN(gf.radius)).map((gf) => {
            const colors = getGeofenceColor(gf.type);
            return (
              <Circle
                key={gf.id}
                center={[Number(gf.centerLatitude) || 0, Number(gf.centerLongitude) || 0]}
                radius={Number(gf.radius) || 0}
                pathOptions={{ ...colors, fillOpacity: 0.1, weight: 2 }}
              >
                <Popup>
                  <strong>{gf.name}</strong><br />
                  Type: {gf.type?.replace(/_/g, ' ')}<br />
                  Radius: {gf.radius ? (gf.radius / 1000).toFixed(1) : 0} km
                </Popup>
              </Circle>
            );
          })}

          {showGeofences && infra.map((p) => {
            let iconShape = null;
            if (p.type === 'traffic_signal') iconShape = trafficSignalIcon;
            else if (p.type === 'toll_plaza') iconShape = tollPlazaIcon;
            else if (p.type === 'checkpoint') iconShape = checkpointIcon;

            if (iconShape) {
              return (
                <Marker key={`infra-${p.id}`} position={[p.latitude, p.longitude]} icon={iconShape}>
                  <Popup minWidth={200}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
                      <strong style={{ fontSize: 15 }}>{p.name}</strong><br />
                      <div style={{ margin: '6px 0', lineHeight: 1.8 }}>
                        <div>{p.type?.replace(/_/g, ' ')}</div>
                        <div>📍 {p.address}</div>
                        <div>📡 ANPR: {p.hasANPR ? '✅ Yes' : '❌ No'}</div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}

          {filteredVehicles.filter(v => v.currentLatitude && v.currentLongitude).map((v) => (
            <Marker
              key={v.id}
              position={[v.currentLatitude, v.currentLongitude]}
              icon={createVehicleIcon(v.status, v.isGPSActive)}
            >
              <Popup minWidth={250}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13 }}>
                  <strong style={{ fontSize: 16 }}>{v.registrationNumber}</strong><br />
                  <div style={{ margin: '8px 0' }}>
                    <div>👤 Driver: {v.driverName || 'N/A'}</div>
                    <div>🏭 Owner: {v.ownerName}</div>
                    <div>🚛 {v.manufacturer} {v.model}</div>
                    <div>⚡ Speed: {v.currentSpeed?.toFixed(0)} km/h</div>
                    <div>📦 Load: {v.currentLoad}T / {v.maxLoadCapacity}T</div>
                    <div>📡 GPS: {v.isGPSActive ? '🟢 Online' : '🔴 Offline'}</div>
                    <div>Status: <span className={`badge badge-${v.status}`}>{v.status}</span></div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button
                      onClick={() => navigate(`/vehicles/${v.id}`)}
                      style={{ padding: '4px 12px', background: '#4fc3f7', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                    >
                      <FiEye style={{ marginRight: 4 }} /> Details
                    </button>
                    {v.ecmStatus === 'stopped' ? (
                      <button
                        onClick={() => handleResume(v.id)}
                        style={{ padding: '4px 12px', background: '#66bb6a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                      >
                        <FiPlayCircle style={{ marginRight: 4 }} /> Resume
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStop(v.id)}
                        style={{ padding: '4px 12px', background: '#ef5350', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                      >
                        <FiStopCircle style={{ marginRight: 4 }} /> Stop
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </>
  );
};

export default LiveMap;
