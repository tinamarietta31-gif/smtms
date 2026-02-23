import React, { useState, useEffect } from 'react';
import { violationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiFileText, FiCheck, FiAlertTriangle } from 'react-icons/fi';

const Violations = () => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { isAdmin } = useAuth();

  const fetchViolations = async () => {
    try {
      const res = await violationAPI.getAll({
        type: typeFilter || undefined,
        severity: severityFilter || undefined,
        status: statusFilter || undefined,
      });
      setViolations(res.data.violations);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchViolations(); }, [typeFilter, severityFilter, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerateChallan = async (id) => {
    try {
      const res = await violationAPI.generateChallan(id);
      toast.success(`e-Challan ${res.data.challan.challanNumber} generated! Amount: ₹${res.data.challan.challanAmount}`);
      fetchViolations();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate challan');
    }
  };

  const handleResolve = async (id) => {
    try {
      await violationAPI.resolve(id);
      toast.success('Violation resolved');
      fetchViolations();
    } catch (error) {
      toast.error('Failed to resolve');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <>
      <div className="filters-bar">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="unauthorized_zone">Unauthorized Zone</option>
          <option value="overloading">Overloading</option>
          <option value="excess_trips">Excess Trips</option>
          <option value="route_deviation">Route Deviation</option>
          <option value="gps_tampering">GPS Tampering</option>
          <option value="speed_violation">Speed Violation</option>
          <option value="permit_expired">Permit Expired</option>
        </select>
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
          <option value="">All Severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="detected">Detected</option>
          <option value="reviewed">Reviewed</option>
          <option value="challan_issued">Challan Issued</option>
          <option value="resolved">Resolved</option>
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>{violations.length} violations</span>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehicle</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Description</th>
                <th>Detected By</th>
                <th>Challan</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {violations.map((v) => (
                <tr key={v.id}>
                  <td>#{v.id}</td>
                  <td><strong>{v.vehicle?.registrationNumber || 'N/A'}</strong><br /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.vehicle?.ownerName}</span></td>
                  <td>{v.type?.replace(/_/g, ' ')}</td>
                  <td><span className={`badge badge-${v.severity}`}>{v.severity}</span></td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.description}</td>
                  <td><span className="badge badge-info">{v.detectedBy}</span></td>
                  <td>
                    {v.challanGenerated ? (
                      <div><strong>{v.challanNumber}</strong><br /><span style={{ color: 'var(--accent-green)' }}>₹{v.challanAmount?.toLocaleString()}</span></div>
                    ) : '—'}
                  </td>
                  <td><span className={`badge badge-${v.status}`}>{v.status?.replace(/_/g, ' ')}</span></td>
                  <td>{new Date(v.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {isAdmin && !v.challanGenerated && (
                        <button className="btn btn-warning btn-sm" onClick={() => handleGenerateChallan(v.id)} title="Generate e-Challan">
                          <FiFileText />
                        </button>
                      )}
                      {v.status !== 'resolved' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleResolve(v.id)} title="Resolve">
                          <FiCheck />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {violations.length === 0 && <div className="empty-state"><div className="icon"><FiAlertTriangle /></div><h3>No violations found</h3></div>}
      </div>
    </>
  );
};

export default Violations;
