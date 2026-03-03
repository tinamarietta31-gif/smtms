import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AddAuthorityModal from '../components/AddAuthorityModal';

const AuthorityManagement = () => {
  const { token, user, hasPermission } = useContext(AuthContext);
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchAuthorities();
  }, []);

  const fetchAuthorities = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/authorities`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setAuthorities(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch authorities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuthority = async (id) => {
    if (window.confirm('Are you sure you want to delete this authority?')) {
      try {
        const response = await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/authorities/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setAuthorities(authorities.filter(a => a._id !== id));
        }
      } catch (error) {
        console.error('Failed to delete authority:', error);
      }
    }
  };

  const handleEditAuthority = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/authorities/${editingId}`,
        editData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setAuthorities(authorities.map(a => a._id === editingId ? response.data.data : a));
        setEditingId(null);
        setEditData(null);
      }
    } catch (error) {
      console.error('Failed to update authority:', error);
    }
  };

  if (!hasPermission('ADD_AUTHORITIES')) {
    return (
      <div className="p-6 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        You do not have permission to manage authorities.
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Authority Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
        >
          Add New Authority
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading authorities...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {authorities.map(authority => (
            <div key={authority._id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-2">{authority.name}</h3>
              <p className="text-gray-600 mb-2">Code: {authority.code}</p>
              <p className="text-gray-600 mb-4">{authority.description}</p>
              
              <div className="text-sm text-gray-500 mb-4">
                {authority.location?.city && `${authority.location.city}, `}
                {authority.location?.state && `${authority.location.state}`}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(authority._id);
                    setEditData(authority);
                  }}
                  className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAuthority(authority._id)}
                  className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddAuthorityModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAuthoritiesChange={fetchAuthorities}
      />

      {editingId && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Authority</h2>

            <form className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={editData.name}
                onChange={(e) => setEditData({...editData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                placeholder="Description"
                value={editData.description}
                onChange={(e) => setEditData({...editData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleEditAuthority}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setEditData(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorityManagement;
