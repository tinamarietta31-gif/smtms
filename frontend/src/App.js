import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LiveMap from './pages/LiveMap';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import Trips from './pages/Trips';
import Violations from './pages/Violations';
import Alerts from './pages/Alerts';
import Permits from './pages/Permits';
import Geofences from './pages/Geofences';
import Predictions from './pages/Predictions';
import Infrastructure from './pages/Infrastructure';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="live-map" element={<LiveMap />} />
        <Route path="vehicles" element={<Vehicles />} />
        <Route path="vehicles/:id" element={<VehicleDetail />} />
        <Route path="trips" element={<Trips />} />
        <Route path="violations" element={<Violations />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="permits" element={<Permits />} />
        <Route path="geofences" element={<Geofences />} />
        <Route path="predictions" element={<Predictions />} />
        <Route path="infrastructure" element={<Infrastructure />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      </Router>
    </AuthProvider>
  );
}

export default App;
