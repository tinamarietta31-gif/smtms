import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FiCpu, FiAlertTriangle, FiEye } from 'react-icons/fi';

const Predictions = () => {
  const [predictions, setPredictions] = useState([]);
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await analyticsAPI.getPredictions();
        setPredictions(res.data.predictions || []);
        setSource(res.data.source || 'ml_model');
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const getRiskStyle = (level) => {
    switch (level) {
      case 'high': return { bg: 'rgba(239,83,80,0.15)', color: 'var(--accent-red)', icon: '🔴' };
      case 'medium': return { bg: 'rgba(255,167,38,0.15)', color: 'var(--accent-orange)', icon: '🟠' };
      case 'low': return { bg: 'rgba(102,187,106,0.15)', color: 'var(--accent-green)', icon: '🟢' };
      default: return { bg: 'rgba(108,108,128,0.15)', color: 'var(--text-muted)', icon: '⚪' };
    }
  };

  return (
    <>
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3><FiCpu style={{ marginRight: 8 }} /> ML-Based Predictive Analytics</h3>
          <span className="badge badge-info">Source: {source}</span>
        </div>
        <div className="card-body">
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
            The system analyzes historical trip data, violation patterns, and vehicle behavior to predict which vehicles
            are most likely to engage in illegal mining activities. Vehicles with multiple violations in the past 30 days
            are flagged with risk scores.
          </p>
        </div>
      </div>

      {predictions.length === 0 ? (
        <div className="empty-state">
          <div className="icon"><FiCpu /></div>
          <h3>No predictions available</h3>
          <p style={{ color: 'var(--text-muted)' }}>Not enough historical data to generate predictions yet.</p>
        </div>
      ) : (
        <div className="vehicle-card-grid">
          {predictions.map((p, i) => {
            const risk = getRiskStyle(p.riskLevel);
            return (
              <div key={i} className="prediction-card" style={{ borderLeft: `4px solid ${risk.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>{p.registrationNumber}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.ownerName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>RISK LEVEL</div>
                    <span style={{
                      padding: '6px 16px',
                      borderRadius: 20,
                      background: risk.bg,
                      color: risk.color,
                      fontSize: 13,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}>
                      {risk.icon} {p.riskLevel}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Violations (30d)</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: risk.color }}>{p.violationCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prediction</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{p.prediction}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/vehicles/${p.vehicleId}`)}>
                    <FiEye /> View Vehicle
                  </button>
                  <button className="btn btn-warning btn-sm" onClick={() => navigate('/violations')}>
                    <FiAlertTriangle /> View Violations
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default Predictions;
