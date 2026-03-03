import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, hasPermission, hasRole, logout } = useContext(AuthContext);

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">SMTMS</h1>
        <p className="text-sm text-gray-400">Smart Mining Transport</p>
      </div>

      <div className="mb-6 pb-6 border-b border-gray-700">
        <p className="text-sm text-gray-400">Logged in as</p>
        <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
        <p className="text-sm text-gray-400">{user?.role}</p>
      </div>

      <nav className="space-y-4">
        <Link to="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-800 transition">
          Dashboard
        </Link>

        {hasPermission('ADD_AUTHORITIES') && (
          <Link to="/authorities" className="block px-4 py-2 rounded hover:bg-gray-800 transition">
            Manage Authorities
          </Link>
        )}

        {(hasPermission('ADD_MEMBERS') || hasRole('OWNER')) && (
          <Link to="/members" className="block px-4 py-2 rounded hover:bg-gray-800 transition">
            Manage Members
          </Link>
        )}

        {(hasPermission('ADD_VEHICLES') || hasRole('OWNER')) && (
          <Link to="/vehicles" className="block px-4 py-2 rounded hover:bg-gray-800 transition">
            Manage Vehicles
          </Link>
        )}

        {hasPermission('VIEW_ALL_DATA') && (
          <Link to="/trips" className="block px-4 py-2 rounded hover:bg-gray-800 transition">
            View Trips
          </Link>
        )}

        {hasPermission('VIEW_ALL_DATA') && (
          <Link to="/violations" className="block px-4 py-2 rounded hover:bg-gray-800 transition">
            Violations
          </Link>
        )}

        {hasRole('DRIVER') && (
          <>
            <Link to="/my-trips" className="block px-4 py-2 rounded hover:bg-gray-800 transition">
              My Trips
            </Link>
            <Link to="/my-vehicle" className="block px-4 py-2 rounded hover:bg-gray-800 transition">
              My Vehicle
            </Link>
          </>
        )}

        <Link to="/profile" className="block px-4 py-2 rounded hover:bg-gray-800 transition">
          Profile
        </Link>
      </nav>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
