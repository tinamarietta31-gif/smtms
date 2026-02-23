import React, { useState, useEffect } from 'react';
import { tripAPI } from '../services/api';
import { FiNavigation } from 'react-icons/fi';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await tripAPI.getAll({ status: statusFilter || undefined });
        setTrips(res.data.trips);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [statusFilter]);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <>
      <div className="filters-bar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Trips</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="flagged">Flagged</option>
          <option value="unauthorized">Unauthorized</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>{trips.length} trips found</span>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehicle</th>
                <th>Permit</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Load</th>
                <th>Distance</th>
                <th>Status</th>
                <th>Authorized</th>
                <th>Flag Reason</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.id}>
                  <td>#{t.id}</td>
                  <td><strong>{t.vehicle?.registrationNumber || 'N/A'}</strong></td>
                  <td>{t.permit?.permitNumber || '—'}</td>
                  <td>{new Date(t.startTime).toLocaleString()}</td>
                  <td>{t.endTime ? new Date(t.endTime).toLocaleString() : <span className="badge badge-ongoing">Ongoing</span>}</td>
                  <td>{t.loadWeight ? `${t.loadWeight}T` : '—'}</td>
                  <td>{t.distance ? `${t.distance} km` : '—'}</td>
                  <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                  <td>{t.isAuthorized ? '✅' : '❌'}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.flagReason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {trips.length === 0 && <div className="empty-state"><div className="icon"><FiNavigation /></div><h3>No trips found</h3></div>}
      </div>
    </>
  );
};

export default Trips;
