import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { FiTruck, FiNavigation, FiAlertTriangle, FiBell, FiFileText, FiActivity } from 'react-icons/fi';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await analyticsAPI.getDashboard();
        setData(res.data);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (error) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>{error}</div>;

  const s = data?.stats || {};

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/vehicles')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <div>
              <div className="stat-label">Total Vehicles</div>
              <div className="stat-value">{s.totalVehicles || 0}</div>
            </div>
            <div className="icon blue"><FiTruck /></div>
          </div>
          <div className="stat-sub">{s.activeVehicles || 0} active</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/trips')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <div>
              <div className="stat-label">Total Trips</div>
              <div className="stat-value">{s.totalTrips || 0}</div>
            </div>
            <div className="icon green"><FiNavigation /></div>
          </div>
          <div className="stat-sub">{s.activeTrips || 0} in progress</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/violations')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <div>
              <div className="stat-label">Violations</div>
              <div className="stat-value" style={{ color: 'var(--accent-red)' }}>{s.totalViolations || 0}</div>
            </div>
            <div className="icon red"><FiAlertTriangle /></div>
          </div>
          <div className="stat-sub">{s.openViolations || 0} open</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/alerts')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <div>
              <div className="stat-label">Alerts</div>
              <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>{s.totalAlerts || 0}</div>
            </div>
            <div className="icon orange"><FiBell /></div>
          </div>
          <div className="stat-sub">{s.unresolvedAlerts || 0} unresolved</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/permits')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <div>
              <div className="stat-label">Permits</div>
              <div className="stat-value">{s.totalPermits || 0}</div>
            </div>
            <div className="icon purple"><FiFileText /></div>
          </div>
          <div className="stat-sub">{s.activePermits || 0} active</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/infrastructure')} style={{ cursor: 'pointer' }}>
          <div className="stat-header">
            <div>
              <div className="stat-label">System Status</div>
              <div className="stat-value" style={{ color: 'var(--accent-green)' }}>Online</div>
            </div>
            <div className="icon green"><FiActivity /></div>
          </div>
          <div className="stat-sub">All systems operational</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        {/* Recent Violations */}
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Recent Violations</h3>
            <Link to="/violations" style={{ fontSize: 12, color: 'var(--accent-blue)', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ padding: '12px 20px' }}>
            {(data?.recentViolations || []).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No violations recorded</p>
            ) : (
              (data?.recentViolations || []).map((v) => (
                <div key={v.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 13 }}>{v.vehicle?.registrationNumber || 'N/A'}</strong>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.type} — {v.severity}</div>
                  </div>
                  <span className={`badge badge-${v.severity === 'critical' ? 'danger' : v.severity === 'high' ? 'warning' : 'info'}`}>
                    {v.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Recent Alerts</h3>
            <Link to="/alerts" style={{ fontSize: 12, color: 'var(--accent-blue)', textDecoration: 'none' }}>View All →</Link>
          </div>
          <div style={{ padding: '12px 20px' }}>
            {(data?.recentAlerts || []).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No alerts</p>
            ) : (
              (data?.recentAlerts || []).map((a) => (
                <div key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 13 }}>{a.vehicle?.registrationNumber || 'System'}</strong>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.message}</div>
                  </div>
                  <span className={`badge badge-${a.severity === 'danger' ? 'danger' : a.severity === 'critical' ? 'danger' : 'warning'}`}>
                    {a.severity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
