import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AddMemberModal from '../components/AddMemberModal';

const MemberManagement = () => {
  const { token, user, hasRole } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchMembers();
    fetchRoles();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setMembers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/roles`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // Filter roles based on user role
        let roles = response.data.data;
        if (user?.role === 'OWNER') {
          // Owners can only create drivers
          roles = roles.filter(r => r.name === 'DRIVER');
        }
        setAvailableRoles(roles);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        const response = await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/members/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setMembers(members.filter(m => m._id !== id));
        }
      } catch (error) {
        console.error('Failed to delete member:', error);
      }
    }
  };

  const handleEditMember = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/members/${editingId}`,
        editData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setMembers(members.map(m => m._id === editingId ? response.data.data : m));
        setEditingId(null);
        setEditData(null);
      }
    } catch (error) {
      console.error('Failed to update member:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {hasRole('SUPER_ADMIN') ? 'Member Management' : 'Team Management'}
        </h1>
        {(hasRole('SUPER_ADMIN') || hasRole('OWNER')) && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Add New Member
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading members...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-3 text-left">Name</th>
                <th className="border p-3 text-left">Email</th>
                <th className="border p-3 text-left">Role</th>
                <th className="border p-3 text-left">Status</th>
                <th className="border p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member._id} className="border-b hover:bg-gray-50">
                  <td className="border p-3">{member.firstName} {member.lastName}</td>
                  <td className="border p-3">{member.email}</td>
                  <td className="border p-3">{member.role?.name}</td>
                  <td className="border p-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      member.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="border p-3">
                    <button
                      onClick={() => {
                        setEditingId(member._id);
                        setEditData(member);
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    {hasRole('SUPER_ADMIN') && (
                      <button
                        onClick={() => handleDeleteMember(member._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onMembersChange={fetchMembers}
        availableRoles={availableRoles}
      />

      {editingId && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Member</h2>

            <form className="space-y-4">
              <input
                type="text"
                placeholder="First Name"
                value={editData.firstName}
                onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                placeholder="Last Name"
                value={editData.lastName}
                onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="tel"
                placeholder="Phone"
                value={editData.phone}
                onChange={(e) => setEditData({...editData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {editData.role?.name === 'DRIVER' && (
                <>
                  <input
                    type="text"
                    placeholder="License Number"
                    value={editData.licenseNumber || ''}
                    onChange={(e) => setEditData({...editData, licenseNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="date"
                    value={editData.licenseExpiry ? editData.licenseExpiry.split('T')[0] : ''}
                    onChange={(e) => setEditData({...editData, licenseExpiry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleEditMember}
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

export default MemberManagement;
