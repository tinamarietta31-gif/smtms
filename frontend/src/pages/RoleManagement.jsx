import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const RoleManagement = () => {
  const { token, user } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: []
  });

  const allPermissions = [
    'ADD_AUTHORITIES',
    'REMOVE_AUTHORITIES',
    'ADD_MEMBERS',
    'REMOVE_MEMBERS',
    'ADD_VEHICLES',
    'REMOVE_VEHICLES',
    'VIEW_ALL_DATA',
    'MANAGE_ALL_RESOURCES',
    'REMOTE_VEHICLE_CONTROL',
    'CHALLAN_MANAGEMENT',
    'GENERATE_REPORTS',
    'VIEW_OWNED_DATA',
    'ADD_DRIVERS',
    'MONITOR_DRIVERS',
    'VIEW_OWN_DETAILS',
    'VIEW_ASSIGNED_VEHICLE',
    'VIEW_TRIP_DETAILS',
    'VIEW_VIOLATIONS',
    'SUBMIT_REPORTS'
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
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
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      alert('Failed to fetch roles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => {
      const permissions = prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission];
      return { ...prev, permissions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Role name is required');
      return;
    }

    if (formData.permissions.length === 0) {
      alert('At least one permission must be selected');
      return;
    }

    try {
      if (editingId) {
        // Update role
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/roles/${editingId}`,
          {
            description: formData.description,
            permissions: formData.permissions
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setRoles(roles.map(r => r._id === editingId ? response.data.data : r));
          alert('Role updated successfully');
          resetForm();
        }
      } else {
        // Create new role
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/roles`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setRoles([...roles, response.data.data]);
          alert('Role created successfully');
          resetForm();
        }
      }
    } catch (error) {
      console.error('Failed to save role:', error);
      alert(error.response?.data?.message || 'Failed to save role');
    }
  };

  const handleEditRole = (role) => {
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    });
    setEditingId(role._id);
    setShowAddForm(true);
  };

  const handleDeleteRole = async (roleId, roleName) => {
    // Prevent deletion of built-in roles
    if (['SUPER_ADMIN', 'OWNER', 'DRIVER'].includes(roleName)) {
      alert('Cannot delete built-in roles');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the "${roleName}" role?`)) {
      try {
        const response = await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/roles/${roleId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setRoles(roles.filter(r => r._id !== roleId));
          alert('Role deleted successfully');
        }
      } catch (error) {
        console.error('Failed to delete role:', error);
        alert(error.response?.data?.message || 'Failed to delete role');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: []
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const getPermissionCategory = (permission) => {
    if (['ADD_AUTHORITIES', 'REMOVE_AUTHORITIES'].includes(permission)) return 'Authority Management';
    if (['ADD_MEMBERS', 'REMOVE_MEMBERS', 'ADD_DRIVERS'].includes(permission)) return 'Member Management';
    if (['ADD_VEHICLES', 'REMOVE_VEHICLES'].includes(permission)) return 'Vehicle Management';
    if (['REMOTE_VEHICLE_CONTROL', 'CHALLAN_MANAGEMENT'].includes(permission)) return 'Vehicle Control';
    if (['MONITOR_DRIVERS', 'VIEW_VIOLATIONS'].includes(permission)) return 'Monitoring';
    if (['VIEW_ALL_DATA', 'MANAGE_ALL_RESOURCES', 'GENERATE_REPORTS'].includes(permission)) return 'System Access';
    if (['VIEW_OWNED_DATA', 'VIEW_OWN_DETAILS', 'VIEW_ASSIGNED_VEHICLE', 'VIEW_TRIP_DETAILS', 'SUBMIT_REPORTS'].includes(permission)) return 'Personal Access';
    return 'Other';
  };

  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-6 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        Only Super Admins can manage roles.
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Role Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
        >
          Create New Role
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading roles...</div>
      ) : (
        <div className="space-y-6">
          {roles.map(role => (
            <div key={role._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{role.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{role.description}</p>
                </div>
                <div className="flex gap-2">
                  {!['SUPER_ADMIN', 'OWNER', 'DRIVER'].includes(role.name) && (
                    <>
                      <button
                        onClick={() => handleEditRole(role)}
                        className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role._id, role.name)}
                        className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {['SUPER_ADMIN', 'OWNER', 'DRIVER'].includes(role.name) && (
                    <span className="bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm">
                      Built-in Role
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="font-semibold text-sm text-gray-700 mb-3">
                  Permissions ({role.permissions.length})
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {role.permissions.map(permission => (
                    <span
                      key={permission}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Edit Role' : 'Create New Role'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Role Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Field Inspector, Quality Manager"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={editingId !== null}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  required
                />
                {editingId && (
                  <p className="text-xs text-gray-500 mt-1">Role name cannot be changed</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  name="description"
                  placeholder="Describe the role's purpose and responsibilities"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">Permissions</label>
                <p className="text-xs text-gray-600 mb-4">Select permissions this role should have</p>

                {['Authority Management', 'Member Management', 'Vehicle Management', 'Vehicle Control', 'Monitoring', 'System Access', 'Personal Access'].map(category => {
                  const categoryPermissions = allPermissions.filter(p => getPermissionCategory(p) === category);
                  return (
                    <div key={category} className="mb-4 pb-4 border-b border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">{category}</h4>
                      <div className="space-y-2">
                        {categoryPermissions.map(permission => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission)}
                              onChange={() => handlePermissionChange(permission)}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{permission}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  {editingId ? 'Update Role' : 'Create Role'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
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

export default RoleManagement;
