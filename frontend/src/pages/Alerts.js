import React, { useState, useEffect } from 'react';
import { alertAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiBell, FiCheck, FiCheckCircle, FiAlertTriangle, FiAlertOctagon, FiInfo } from 'react-icons/fi';

const severityIcons = {
  info: <FiInfo />,
  warning: <FiAlertTriangle />,
  danger: <FiAlertOctagon />,
  critical: <FiAlertOctagon />,
};

const severityColors = {
  info: { bg: 'rgba(79,195,247,0.15)', color: 'var(--accent-blue)' },
  warning: { bg: 'rgba(255,167,38,0.15)', color: 'var(--accent-orange)' },
  danger: { bg: 'rgba(239,83,80,0.15)', color: 'var(--accent-red)' },
  critical: { bg: 'rgba(239,83,80,0.25)', color: 'var(--accent-red)' },
};

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unresolved');

  const fetchAlerts = async () => {
    try {
      const params = {};
      if (filter === 'unresolved') params.isResolved = false;
      else if (filter === 'resolved') params.isResolved = true;
      const res = await alertAPI.getAll(params);
      setAlerts(res.data.alerts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResolve = async (id) => {
    try {
      await alertAPI.resolve(id);
      toast.success('Alert resolved');
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await alertAPI.markAllAsRead();
      toast.success('All alerts marked as read');
      fetchAlerts();
    } catch (error) {
      toast.error('Failed');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <>
      <div className="filters-bar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Alerts</option>
          <option value="unresolved">Unresolved</option>
          <option value="resolved">Resolved</option>
        </select>
        <button className="btn btn-outline btn-sm" onClick={handleMarkAllRead}>
          <FiCheckCircle /> Mark All as Read
        </button>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>{alerts.length} alerts</span>
      </div>

      <div className="card">
        {alerts.map((a) => {
          const colors = severityColors[a.severity] || severityColors.info;
          return (
            <div key={a.id} className="alert-item" style={{ opacity: a.isResolved ? 0.6 : 1 }}>
              <div className="alert-icon" style={{ background: colors.bg, color: colors.color }}>
                {severityIcons[a.severity] || <FiBell />}
              </div>
              <div className="alert-content">
                <div className="message">
                  <strong>{a.vehicle?.registrationNumber}</strong> — {a.type?.replace(/_/g, ' ')}
                </div>
                <div className="meta">{a.message}</div>
                <div className="meta">
                  {new Date(a.createdAt).toLocaleString()}
                  {a.latitude && ` · 📍 ${a.latitude.toFixed(4)}, ${a.longitude.toFixed(4)}`}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                <span className={`badge badge-${a.severity}`}>{a.severity}</span>
                {!a.isResolved && (
                  <button className="btn btn-success btn-sm" onClick={() => handleResolve(a.id)}>
                    <FiCheck /> Resolve
                  </button>
                )}
                {a.isResolved && <span style={{ fontSize: 11, color: 'var(--accent-green)' }}>✅ Resolved</span>}
              </div>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <div className="empty-state"><div className="icon"><FiBell /></div><h3>No alerts</h3><p>All clear!</p></div>
        )}
      </div>
    </>
  );
};

export default Alerts;
