import React, { useState, useEffect } from 'react';
import './UsersPage.css';

const UsersPage = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    // Simulate loading users data
    const timer = setTimeout(() => {
      setUsers([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'student', department: 'Computer Science' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'instructor', department: 'Mathematics' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'employee', department: 'Administration' },
        { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', role: 'student', department: 'Engineering' },
        { id: 5, name: 'David Brown', email: 'david@example.com', role: 'dept_head', department: 'Physics' },
      ]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="users-container">
      <h1>Users Management</h1>
      
      <div className="users-controls">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Search by name or email" 
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="filter-box">
          <label htmlFor="role-filter">Filter by role:</label>
          <select 
            id="role-filter" 
            value={roleFilter}
            onChange={handleRoleFilterChange}
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="employee">Employees</option>
            <option value="dept_head">Department Heads</option>
          </select>
        </div>
        
        <button className="add-user-button">Add New User</button>
      </div>
      
      <div className="users-section">
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : filteredUsers.length > 0 ? (
          <div className="users-table-container">
            <table className="users-table">
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
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                      </span>
                    </td>
                    <td>{user.department}</td>
                    <td className="action-buttons">
                      <button className="edit-button">Edit</button>
                      <button className="delete-button">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">No users found matching your criteria</div>
        )}
      </div>
    </div>
  );
};

export default UsersPage; 