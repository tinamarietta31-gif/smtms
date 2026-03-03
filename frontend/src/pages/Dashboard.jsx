import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeTrips: 0,
    totalViolations: 0,
    pendingChallans: 0,
    totalMembers: 0,
    activeAuthorities: 0
  });
  const [loading, setLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch vehicles
      const vehiclesRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/vehicles`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch trips
      const tripsRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/trips`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch violations
      const violationsRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/violations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch members
      const membersRes = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/members`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const activeTrips = tripsRes.data.data?.filter(t => t.status === 'ACTIVE').length || 0;
      const pendingViolations = violationsRes.data.data?.filter(v => v.status === 'PENDING').length || 0;

      setStats({
        totalVehicles: vehiclesRes.data.count || 0,
        activeTrips,
        totalViolations: violationsRes.data.count || 0,
        pendingChallans: pendingViolations,
        totalMembers: membersRes.data.count || 0,
        activeAuthorities: user?.role === 'SUPER_ADMIN' ? 1 : 0
      });

      // Set recent activity
      setRecentActivity([
        ...tripsRes.data.data?.slice(0, 3) || [],
        ...violationsRes.data.data?.slice(0, 3) || []
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, color }) => (
    <div className={`${color} rounded-lg shadow p-6 text-white`}>
      <p className="text-sm font-semibold mb-2">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome, {user?.firstName} {user?.lastName}</p>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading dashboard...</div>
      ) : (
        <>
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Total Vehicles" 
              value={stats.totalVehicles} 
              color="bg-blue-500"
            />
            <StatCard 
              title="Active Trips" 
              value={stats.activeTrips} 
              color="bg-green-500"
            />
            <StatCard 
              title="Violations" 
              value={stats.totalViolations} 
              color="bg-yellow-500"
            />
            <StatCard 
              title="Pending Challans" 
              value={stats.pendingChallans} 
              color="bg-red-500"
            />
            <StatCard 
              title="Team Members" 
              value={stats.totalMembers} 
              color="bg-purple-500"
            />
            {user?.role === 'SUPER_ADMIN' && (
              <StatCard 
                title="Authorities" 
                value={stats.activeAuthorities} 
                color="bg-indigo-500"
              />
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {user?.role === 'SUPER_ADMIN' && (
                <>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Add Authority
                  </button>
                  <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                    Add Member
                  </button>
                </>
              )}
              {(user?.role === 'SUPER_ADMIN' || user?.role === 'OWNER') && (
                <>
                  <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                    Add Vehicle
                  </button>
                  <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                    Add Driver
                  </button>
                </>
              )}
              {user?.role === 'DRIVER' && (
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Start Trip
                </button>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="text-sm font-semibold">
                      {activity.startTime ? `Trip Started` : `Violation Reported`}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(activity.startTime || activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No recent activity</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
