import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { alertAPI } from '../services/api';
import { FiGrid, FiMap, FiTruck, FiNavigation, FiAlertTriangle, FiBell, FiFileText, FiTarget, FiCpu, FiLogOut, FiSearch, FiMenu, FiCamera } from 'react-icons/fi';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await alertAPI.getUnreadCount();
        setUnreadAlerts(res.data.count);
      } catch { }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { section: 'Overview' },
    { path: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
    { path: '/live-map', label: 'Live Map', icon: <FiMap /> },
    { section: 'Operations' },
    { path: '/vehicles', label: 'Vehicles', icon: <FiTruck /> },
    { path: '/trips', label: 'Trips', icon: <FiNavigation /> },
    { path: '/permits', label: 'Permits', icon: <FiFileText /> },
    { section: 'Enforcement' },
    { path: '/violations', label: 'Violations', icon: <FiAlertTriangle /> },
    { path: '/alerts', label: 'Alerts', icon: <FiBell />, badge: unreadAlerts },
    { section: 'Intelligence' },
    { path: '/geofences', label: 'Geofences', icon: <FiTarget /> },
    { path: '/infrastructure', label: 'Infrastructure', icon: <FiCamera /> },
    { path: '/predictions', label: 'Predictions', icon: <FiCpu /> },
  ];

  const getPageTitle = () => {
    const titles = {
      '/': 'Dashboard',
      '/dashboard': 'Dashboard',
      '/live-map': 'Live Map',
      '/vehicles': 'Vehicles',
      '/trips': 'Trips',
      '/violations': 'Violations',
      '/alerts': 'Alerts',
      '/permits': 'Permits',
      '/geofences': 'Geofences',
      '/infrastructure': 'Infrastructure',
      '/predictions': 'ML Predictions',
    };
    return titles[location.pathname] || 'SMTMS';
  };

  return (
    <div className="app-layout">
      {/* Mobile Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>🛰️ SMTMS <span className="badge">v1.0</span></h2>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item, i) =>
            item.section ? (
              <div key={i} className="nav-section-title">{item.section}</div>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
                {item.badge > 0 && <span className="badge-count">{item.badge}</span>}
              </NavLink>
            )
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
            <div className="user-details">
              <div className="name">{user?.name}</div>
              <div className="role">{user?.role?.replace('_', ' ')}</div>
            </div>
          </div>
          <button className="nav-item" onClick={logout} style={{ marginTop: 12, color: 'var(--accent-red)' }}>
            <span className="icon"><FiLogOut /></span>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ display: 'none' }} // Controlled via CSS media query
              id="mobile-menu-btn"
            >
              <FiMenu />
            </button>
            <h1>{getPageTitle()}</h1>
          </div>
          <div className="topbar-right">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Search vehicles, trips..." />
            </div>
            <NavLink to="/alerts" className="notification-btn">
              <FiBell />
              {unreadAlerts > 0 && <span className="dot"></span>}
            </NavLink>
          </div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
