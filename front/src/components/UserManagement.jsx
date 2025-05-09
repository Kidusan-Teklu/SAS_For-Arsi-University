import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './UserManagement.css';

// Set the API URL
const API_URL = 'http://localhost:8000/api';

export default function UserManagement() {
  const { currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // User management states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  
  // Form state for creating new users
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    department: ''
  });
  
  // Form state for editing users
  const [editUser, setEditUser] = useState({
    _id: '',
    name: '',
    email: '',
    role: '',
    department: '',
    password: ''
  });

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    console.log('Current user from context:', currentUser);
    
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      setLoading(false);
      return;
    }
    
    // Set default authorization header for all requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Fetch all users
    fetchAllUsers(token);
  }, []);
  
  const fetchAllUsers = (token) => {
    axios.get(`${API_URL}/users/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      setUsers(response.data);
      
      // Extract unique departments for filtering
      const uniqueDepartments = [...new Set(response.data.map(user => user.department).filter(Boolean))];
      setDepartments(uniqueDepartments);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
      setLoading(false);
    });
  };
  
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    setEditUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCreateUser = (e) => {
    e.preventDefault();
    
    axios.post(`${API_URL}/users/create/`, newUser)
      .then(response => {
        alert('User created successfully!');
        // Reset form
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'user',
          department: ''
        });
        // Refresh user list
        fetchAllUsers(localStorage.getItem('token'));
      })
      .catch(error => {
        alert(`Error creating user: ${error.response?.data?.error || 'Unknown error'}`);
        console.error('Error creating user:', error);
      });
  };
  
  const handleUpdateUser = (e) => {
    e.preventDefault();
    
    // Remove the password field if it's empty
    const userData = { ...editUser };
    if (!userData.password) {
      delete userData.password;
    }
    
    axios.put(`${API_URL}/users/${editUser._id}/`, userData)
      .then(response => {
        alert('User updated successfully!');
        setIsEditing(false);
        setSelectedUser(null);
        fetchAllUsers(localStorage.getItem('token'));
      })
      .catch(error => {
        alert(`Error updating user: ${error.response?.data?.error || 'Unknown error'}`);
        console.error('Error updating user:', error);
      });
  };
  
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    axios.delete(`${API_URL}/users/${selectedUser._id}/`)
      .then(response => {
        alert('User deleted successfully!');
        setSelectedUser(null);
        setDeleteConfirmation(false);
        fetchAllUsers(localStorage.getItem('token'));
      })
      .catch(error => {
        alert(`Error deleting user: ${error.response?.data?.error || 'Unknown error'}`);
        console.error('Error deleting user:', error);
      });
  };
  
  const handleEditClick = (user) => {
    setEditUser({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      password: ''
    });
    setIsEditing(true);
    setSelectedUser(user);
  };
  
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteConfirmation(true);
  };
  
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setIsEditing(false);
  };
  
  const resetUserDetail = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setDeleteConfirmation(false);
  };
  
  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const nameMatch = user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = filterRole === 'all' || user.role === filterRole;
    const departmentMatch = filterDepartment === 'all' || user.department === filterDepartment;
    
    return (nameMatch || emailMatch) && roleMatch && departmentMatch;
  });

  if (loading) {
    return <div className="loading-container"><p>Loading user data...</p></div>;
  }
  
  if (error) {
    return <div className="error-container"><p className="error-message">{error}</p></div>;
  }

  return (
    <div className="user-management-page">
      <h1>User Management</h1>
      
      <div className="user-management-container">
        <div className="user-management-sidebar">
          <div className="create-user-form">
            <h3>Create New User</h3>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={newUser.name}
                  onChange={handleNewUserChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleNewUserChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  value={newUser.role}
                  onChange={handleNewUserChange}
                  required
                >
                  <option value="user">User</option>
                  <option value="instructor">Instructor</option>
                  <option value="department_head">Department Head</option>
                  <option value="admin">Admin</option>
                  {currentUser?.role === 'super_admin' && (
                    <option value="super_admin">Super Admin</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  name="department"
                  value={newUser.department}
                  onChange={handleNewUserChange}
                  required
                />
              </div>
              <button type="submit">Create User</button>
            </form>
          </div>
        </div>
        
        <div className="user-management-main">
          <div className="user-search-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filters">
              <div className="filter-group">
                <label>Role:</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="instructor">Instructor</option>
                  <option value="department_head">Department Head</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Department:</label>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="user-list-container">
            <div className="user-list">
              <h3>All Users <span className="user-count">({filteredUsers.length} users)</span></h3>
              {filteredUsers.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr 
                        key={user._id} 
                        onClick={() => handleUserSelect(user)}
                        className={selectedUser && selectedUser._id === user._id ? 'selected' : ''}
                      >
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                        <td>{user.department}</td>
                        <td className="action-buttons">
                          <button 
                            className="edit-button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(user);
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(user);
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No users found matching the filters.</p>
              )}
            </div>
            
            {selectedUser && !isEditing && !deleteConfirmation && (
              <div className="user-details-panel">
                <div className="panel-header">
                  <h3>User Details</h3>
                  <button className="close-button" onClick={resetUserDetail}>×</button>
                </div>
                <div className="user-details">
                  <div className="user-avatar">
                    <div className="avatar-placeholder">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <h4>{selectedUser.name}</h4>
                  <p className="user-email">{selectedUser.email}</p>
                  <div className="detail-item">
                    <span className="detail-label">Role:</span>
                    <span className={`role-badge ${selectedUser.role}`}>{selectedUser.role}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Department:</span>
                    <span>{selectedUser.department || 'Not assigned'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Created:</span>
                    <span>{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                  <div className="detail-actions">
                    <button className="edit-button" onClick={() => handleEditClick(selectedUser)}>Edit User</button>
                    <button className="delete-button" onClick={() => handleDeleteClick(selectedUser)}>Delete User</button>
                  </div>
                </div>
              </div>
            )}
            
            {isEditing && selectedUser && (
              <div className="edit-user-panel">
                <div className="panel-header">
                  <h3>Edit User</h3>
                  <button className="close-button" onClick={resetUserDetail}>×</button>
                </div>
                <form onSubmit={handleUpdateUser}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editUser.name}
                      onChange={handleEditUserChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editUser.email}
                      onChange={handleEditUserChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password (leave blank to keep current)</label>
                    <input
                      type="password"
                      name="password"
                      value={editUser.password}
                      onChange={handleEditUserChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      name="role"
                      value={editUser.role}
                      onChange={handleEditUserChange}
                      required
                    >
                      <option value="user">User</option>
                      <option value="instructor">Instructor</option>
                      <option value="department_head">Department Head</option>
                      <option value="admin">Admin</option>
                      {currentUser?.role === 'super_admin' && (
                        <option value="super_admin">Super Admin</option>
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      name="department"
                      value={editUser.department}
                      onChange={handleEditUserChange}
                      required
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="save-button">Save Changes</button>
                    <button type="button" className="cancel-button" onClick={resetUserDetail}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
            
            {deleteConfirmation && selectedUser && (
              <div className="delete-confirmation-panel">
                <div className="panel-header">
                  <h3>Confirm Deletion</h3>
                  <button className="close-button" onClick={() => setDeleteConfirmation(false)}>×</button>
                </div>
                <div className="confirmation-content">
                  <p>Are you sure you want to delete user <strong>{selectedUser.name}</strong>?</p>
                  <p className="warning">This action cannot be undone!</p>
                  <div className="confirmation-actions">
                    <button className="delete-confirm-button" onClick={handleDeleteUser}>Yes, Delete User</button>
                    <button className="cancel-button" onClick={() => setDeleteConfirmation(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 