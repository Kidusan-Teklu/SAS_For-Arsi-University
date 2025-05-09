import React, { useEffect, useState, useContext } from 'react';
import './UserManagementPage.css';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Navigation/Navigation';

// Use a consistent API URL
const API_URL = 'http://localhost:8000/api';

// Define all available roles for the system with correct backend values
const AVAILABLE_ROLES = [
  { value: 'user', label: 'User' },
  { value: 'student', label: 'Student' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'DEPT_HEAD', label: 'Department Head' },
  { value: 'HR', label: 'HR Officer' },
  { value: 'FINANCE', label: 'Finance Officer' },
  { value: 'administrative_officer', label: 'Administrative Officer' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' }
];

// Helper function to get user-friendly role label
const getRoleLabel = (roleValue) => {
  const role = AVAILABLE_ROLES.find(r => r.value === roleValue);
  return role ? role.label : roleValue;
};

export default function UserManagementPage() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Enhanced user management states
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
    // Check if user has admin privileges
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
      navigate('/profile');
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      setLoading(false);
      return;
    }
    
    // Set default authorization header for all requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Fetch all users
    fetchAllUsers(token);
  }, [currentUser, navigate]);
  
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
    const nameMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = filterRole === 'all' || user.role === filterRole;
    const departmentMatch = filterDepartment === 'all' || user.department === filterDepartment;
    
    return (nameMatch || emailMatch) && roleMatch && departmentMatch;
  });

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="loading">Loading user data...</div>
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <Navigation />
        <div className="unauthorized">{error}</div>
      </>
    );
  }

  // Only show super_admin option to super_admins
  const roleOptions = AVAILABLE_ROLES.filter(role => 
    role.value !== 'super_admin' || currentUser.role === 'super_admin'
  );

  return (
    <>
      <Navigation />
      <div className="user-management-page-container">
        <div className="user-management-page">
          <h1>User Management</h1>
          
          <div className="user-management-container">
            <div className="user-management-sidebar">
              <h2>Create New User</h2>
              <form className="user-form" onSubmit={handleCreateUser}>
                <div className="form-group">
                  <label>Name</label>
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
                    {roleOptions.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={newUser.department}
                    onChange={handleNewUserChange}
                  />
                </div>
                <button type="submit" className="create-user-btn">Create User</button>
              </form>
            </div>
            
            <div className="user-management-main">
              <div className="user-list-container">
                <h2>User List</h2>
                
                <div className="user-filters">
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Search by name or email"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="filter-dropdowns">
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                    >
                      <option value="all">All Roles</option>
                      {roleOptions.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                    >
                      <option value="all">All Departments</option>
                      {departments.map(department => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="user-list">
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
                          <td>
                            <span className={`role-badge role-${user.role}`}>
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td>{user.department || '-'}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="edit-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditClick(user);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteClick(user);
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* User details panel */}
              {selectedUser && !isEditing && !deleteConfirmation && (
                <div className="user-details-panel">
                  <button className="close-btn" onClick={resetUserDetail}>&times;</button>
                  <h2>User Details</h2>
                  <div className="user-details">
                    <p><strong>Name:</strong> {selectedUser.name}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Role:</strong> {getRoleLabel(selectedUser.role)}</p>
                    <p><strong>Department:</strong> {selectedUser.department || '-'}</p>
                    <p><strong>Created:</strong> {new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="detail-actions">
                    <button className="edit-btn" onClick={() => handleEditClick(selectedUser)}>
                      Edit User
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteClick(selectedUser)}>
                      Delete User
                    </button>
                  </div>
                </div>
              )}
              
              {/* Edit user panel */}
              {isEditing && (
                <div className="edit-user-panel">
                  <button className="close-btn" onClick={resetUserDetail}>&times;</button>
                  <h2>Edit User</h2>
                  <form className="user-form" onSubmit={handleUpdateUser}>
                    <div className="form-group">
                      <label>Name</label>
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
                      <label>Password (leave blank to keep unchanged)</label>
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
                        {roleOptions.map(role => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <input
                        type="text"
                        name="department"
                        value={editUser.department}
                        onChange={handleEditUserChange}
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="save-btn">Save Changes</button>
                      <button type="button" className="cancel-btn" onClick={resetUserDetail}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Delete confirmation panel */}
              {deleteConfirmation && (
                <div className="delete-confirmation">
                  <button className="close-btn" onClick={resetUserDetail}>&times;</button>
                  <h2>Confirm Delete</h2>
                  <p>Are you sure you want to delete the user <strong>{selectedUser.name}</strong>?</p>
                  <p>This action cannot be undone.</p>
                  <div className="confirmation-actions">
                    <button className="confirm-delete-btn" onClick={handleDeleteUser}>
                      Delete User
                    </button>
                    <button className="cancel-btn" onClick={resetUserDetail}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 