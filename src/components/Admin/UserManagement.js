import React, { useState, useEffect } from 'react';
import { getBranches } from '../../utils/auth';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showRollNumberModal, setShowRollNumberModal] = useState(false);
  const [selectedUserForRollNumber, setSelectedUserForRollNumber] = useState(null);
  const [rollNumberInput, setRollNumberInput] = useState('');
  const [selectedBranchForRollNumber, setSelectedBranchForRollNumber] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, selectedBranch, selectedRole, searchTerm]);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    setUsers(storedUsers);
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by branch
    if (selectedBranch !== 'all') {
      filtered = filtered.filter(user => user.branch === selectedBranch);
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
      );
    }

    setFilteredUsers(filtered);
  };

  const deleteUser = (email) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.email === email) {
      alert('You cannot delete your own account!');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      const updatedUsers = users.filter(user => user.email !== email);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      
      // Also remove user's results
      const results = JSON.parse(localStorage.getItem('results')) || [];
      const updatedResults = results.filter(result => result.studentEmail !== email);
      localStorage.setItem('results', JSON.stringify(updatedResults));
      
      setMessage('User deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const promoteToAdmin = (email) => {
    const updatedUsers = users.map(user =>
      user.email === email ? { 
        ...user, 
        role: 'admin', 
        branch: null, 
        rollNumber: null,
        semester: null,
        year: null
      } : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setMessage('User promoted to admin successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  const demoteToStudent = (email, branch = 'CSE') => {
    const studentCount = users.filter(u => u.role === 'student' && u.branch === branch).length + 1;
    const rollNumber = `${branch.toUpperCase()}${studentCount.toString().padStart(3, '0')}`;

    const updatedUsers = users.map(user =>
      user.email === email ? {
        ...user,
        role: 'student',
        branch: branch,
        rollNumber: rollNumber,
        semester: '1',
        year: '2024'
      } : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setMessage(`User demoted to student in ${branch} branch`);
    setTimeout(() => setMessage(''), 3000);
  };

  const startEdit = (user) => {
    setEditingUser(user.email);
    setEditForm({
      name: user.name,
      phone: user.phone || '',
      semester: user.semester || '',
      year: user.year || '2024'
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
  };

  const saveEdit = (email) => {
    const updatedUsers = users.map(user =>
      user.email === email ? { ...user, ...editForm } : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Update currentUser in localStorage if editing self
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.email === email) {
      const updatedCurrentUser = updatedUsers.find(u => u.email === email);
      localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    }
    
    setUsers(updatedUsers);
    setEditingUser(null);
    setEditForm({});
    setMessage('User updated successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  const openRollNumberModal = (user) => {
    setSelectedUserForRollNumber(user);
    setRollNumberInput(user.rollNumber || '');
    setSelectedBranchForRollNumber(user.branch || '');
    setShowRollNumberModal(true);
  };

  const closeRollNumberModal = () => {
    setShowRollNumberModal(false);
    setSelectedUserForRollNumber(null);
    setRollNumberInput('');
    setSelectedBranchForRollNumber('');
  };

  const assignRollNumber = () => {
    if (!rollNumberInput) {
      alert('Please enter a roll number');
      return;
    }

    if (!selectedBranchForRollNumber) {
      alert('Please select a branch first');
      return;
    }

    const rollNumberError = validateRollNumber(rollNumberInput, selectedBranchForRollNumber);
    if (rollNumberError) {
      alert(rollNumberError);
      return;
    }

    const updatedUsers = users.map(user =>
      user.email === selectedUserForRollNumber.email ? {
        ...user,
        rollNumber: rollNumberInput.toUpperCase(),
        branch: selectedBranchForRollNumber,
        role: 'student' // Ensure role is set to student when assigning roll number
      } : user
    );

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setMessage(`Roll number ${rollNumberInput.toUpperCase()} assigned successfully`);
    closeRollNumberModal();
    setTimeout(() => setMessage(''), 3000);
  };

  const validateRollNumber = (rollNumber, branch) => {
    if (!rollNumber) return 'Roll number is required';
    if (!branch) return 'Branch is required';

    const expectedPrefix = branch.toUpperCase();
    if (!rollNumber.toUpperCase().startsWith(expectedPrefix)) {
      return `Roll number should start with ${expectedPrefix}`;
    }

    const existingUser = users.find(user =>
      user.rollNumber && 
      user.rollNumber.toUpperCase() === rollNumber.toUpperCase() &&
      user.email !== selectedUserForRollNumber?.email
    );
    
    if (existingUser) {
      return 'This roll number is already assigned to another student';
    }

    return '';
  };

  const generateRollNumber = () => {
    if (!selectedBranchForRollNumber) {
      alert('Please select a branch first');
      return;
    }
    
    const studentCount = users.filter(u => u.role === 'student' && u.branch === selectedBranchForRollNumber).length + 1;
    const generatedRollNumber = `${selectedBranchForRollNumber.toUpperCase()}${studentCount.toString().padStart(3, '0')}`;
    setRollNumberInput(generatedRollNumber);
  };

  const exportUsers = () => {
    const exportData = filteredUsers.map(user => ({
      'Name': user.name,
      'Email': user.email,
      'Role': user.role,
      'Roll Number': user.rollNumber || 'N/A',
      'Branch': user.branch || 'N/A',
      'Phone': user.phone || 'N/A',
      'Semester': user.semester || 'N/A',
      'Year': user.year || 'N/A',
      'Registered Date': new Date(user.registeredAt).toLocaleDateString(),
      'Status': user.isActive ? 'Active' : 'Inactive'
    }));

    const csvHeaders = Object.keys(exportData[0] || {}).join(',');
    const csvRows = exportData.map(row => 
      Object.values(row).map(value => `"${value}"`).join(',')
    ).join('\n');
    
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const branches = getBranches();
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const years = ['2024', '2023', '2022', '2021'];

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>User Management</h1>
        <p>Manage students and administrators with roll number assignment</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Filters Card */}
      <div className="filters-card">
        <div className="filter-row">
          <div className="filter-group">
            <label>Branch:</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Branches</option>
              {branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Role:</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search by name, email, roll number, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-actions">
            <button className="btn-secondary" onClick={loadUsers}>
              Refresh
            </button>
            <button className="btn-primary" onClick={exportUsers}>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <h3>Total Users</h3>
          <p>{filteredUsers.length}</p>
          <small>Filtered results</small>
        </div>
        <div className="stat-card success">
          <h3>Students</h3>
          <p>{filteredUsers.filter(u => u.role === 'student').length}</p>
          <small>With roll numbers</small>
        </div>
        <div className="stat-card warning">
          <h3>Admins</h3>
          <p>{filteredUsers.filter(u => u.role === 'admin').length}</p>
          <small>Administrators</small>
        </div>
        <div className="stat-card info">
          <h3>Branches</h3>
          <p>{branches.length}</p>
          <small>Active branches</small>
        </div>
      </div>

      {/* Users Table */}
      <div className="data-card">
        <div className="card-header">
          <h3>Registered Users ({filteredUsers.length})</h3>
          <div className="card-actions">
            <button className="btn-outline" onClick={loadUsers}>
              Refresh Data
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Academic Info</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.email} className={index % 2 === 0 ? 'even' : 'odd'}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{user.name}</div>
                          <div className="user-roll">
                            {user.rollNumber ? (
                              <span className="roll-number-badge">
                                🎓 {user.rollNumber}
                              </span>
                            ) : (
                              <span className="no-roll-number">No Roll Number</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div className="email">{user.email}</div>
                        {user.phone && (
                          <div className="phone">📱 {user.phone}</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="academic-info">
                        {user.role === 'student' ? (
                          <>
                            <span className={`branch-tag ${user.branch?.toLowerCase()}`}>
                              {user.branch || 'No Branch'}
                            </span>
                            {user.semester && (
                              <span className="semester-tag">Sem {user.semester}</span>
                            )}
                            {user.year && (
                              <span className="year-tag">{user.year}</span>
                            )}
                          </>
                        ) : (
                          <span className="no-academic">N/A</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="registration-date">
                        {new Date(user.registeredAt).toLocaleDateString()}
                        <br />
                        <small>{new Date(user.registeredAt).toLocaleTimeString()}</small>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {user.role === 'student' ? (
                          <>
                            <button
                              className="btn-warning btn-sm"
                              onClick={() => promoteToAdmin(user.email)}
                              title="Promote to Admin"
                            >
                              ⬆️ Promote
                            </button>
                            <button
                              className="btn-info btn-sm"
                              onClick={() => openRollNumberModal(user)}
                              title="Edit Roll Number"
                            >
                              ✏️ Edit Roll No.
                            </button>
                            <button
                              className="btn-outline btn-sm"
                              onClick={() => startEdit(user)}
                              title="Edit User"
                            >
                              Edit
                            </button>
                          </>
                        ) : (
                          <>
                            <select
                              onChange={(e) => demoteToStudent(user.email, e.target.value)}
                              className="demote-select"
                              title="Demote to Student"
                            >
                              <option value="">Demote to...</option>
                              {branches.map(branch => (
                                <option key={branch} value={branch}>{branch}</option>
                              ))}
                            </select>
                            <button
                              className="btn-outline btn-sm"
                              onClick={() => startEdit(user)}
                              title="Edit User"
                            >
                              Edit
                            </button>
                          </>
                        )}
                        <button
                          className="btn-danger btn-sm"
                          onClick={() => deleteUser(user.email)}
                          disabled={user.role === 'admin'}
                          title="Delete User"
                        >
                          Delete
                        </button>
                      </div>

                      {/* Edit Form */}
                      {editingUser === user.email && (
                        <div className="edit-form">
                          <div className="form-row">
                            <input
                              type="text"
                              value={editForm.name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Name"
                              className="form-input"
                            />
                            <input
                              type="tel"
                              value={editForm.phone}
                              onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="Phone"
                              className="form-input"
                            />
                          </div>
                          {user.role === 'student' && (
                            <div className="form-row">
                              <select
                                value={editForm.semester}
                                onChange={(e) => setEditForm(prev => ({ ...prev, semester: e.target.value }))}
                                className="form-select"
                              >
                                <option value="">Select Semester</option>
                                {semesters.map(sem => (
                                  <option key={sem} value={sem}>Sem {sem}</option>
                                ))}
                              </select>
                              <select
                                value={editForm.year}
                                onChange={(e) => setEditForm(prev => ({ ...prev, year: e.target.value }))}
                                className="form-select"
                              >
                                <option value="">Select Year</option>
                                {years.map(year => (
                                  <option key={year} value={year}>{year}</option>
                                ))}
                              </select>
                            </div>
                          )}
                          <div className="form-actions">
                            <button
                              className="btn-success btn-sm"
                              onClick={() => saveEdit(user.email)}
                            >
                              Save
                            </button>
                            <button
                              className="btn-secondary btn-sm"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h4>No users found</h4>
              <p>No users match your current filters or search criteria.</p>
              <button className="btn-primary" onClick={() => {
                setSelectedBranch('all');
                setSelectedRole('all');
                setSearchTerm('');
              }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Roll Number Assignment Modal */}
      {showRollNumberModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Assign Roll Number</h3>
              <button className="modal-close" onClick={closeRollNumberModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-user-info">
                <div className="user-avatar large">
                  {selectedUserForRollNumber.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <h4>{selectedUserForRollNumber.name}</h4>
                  <p>{selectedUserForRollNumber.email}</p>
                </div>
              </div>

              <div className="form-group">
                <label>Branch *</label>
                <select
                  value={selectedBranchForRollNumber}
                  onChange={(e) => setSelectedBranchForRollNumber(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Roll Number *</label>
                <div className="roll-number-input-group">
                  <input
                    type="text"
                    value={rollNumberInput}
                    onChange={(e) => setRollNumberInput(e.target.value)}
                    placeholder="e.g., CSE001"
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={generateRollNumber}
                    disabled={!selectedBranchForRollNumber}
                  >
                    Generate
                  </button>
                </div>
                <small className="input-hint">
                  Format: {selectedBranchForRollNumber ? selectedBranchForRollNumber.toUpperCase() : 'BRANCH'} + Number
                </small>
              </div>

              {rollNumberInput && selectedBranchForRollNumber && (
                <div className="validation-message">
                  {validateRollNumber(rollNumberInput, selectedBranchForRollNumber) ? (
                    <span className="text-error">
                      ⚠️ {validateRollNumber(rollNumberInput, selectedBranchForRollNumber)}
                    </span>
                  ) : (
                    <span className="text-success">
                      ✓ Valid roll number format
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeRollNumberModal}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={assignRollNumber}
                disabled={!rollNumberInput || !selectedBranchForRollNumber || !!validateRollNumber(rollNumberInput, selectedBranchForRollNumber)}
              >
                Assign Roll Number
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;