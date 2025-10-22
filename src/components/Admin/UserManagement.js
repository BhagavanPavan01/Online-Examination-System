import React, { useState, useEffect } from 'react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    setUsers(storedUsers);
  };

  const deleteUser = (email) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(user => user.email !== email);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      setMessage('User deleted successfully');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const promoteToAdmin = (email) => {
    const updatedUsers = users.map(user => 
      user.email === email ? { ...user, role: 'admin' } : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setMessage('User promoted to admin successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  const demoteToStudent = (email) => {
    const updatedUsers = users.map(user => 
      user.email === email ? { ...user, role: 'student' } : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setMessage('User demoted to student successfully');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">User Management</h2>
      
      {message && <div className="alert alert-success">{message}</div>}
      
      <div className="card">
        <div className="card-header">
          <h5>Registered Users ({users.length})</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.email}>
                    <td>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        {user.role === 'student' ? (
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => promoteToAdmin(user.email)}
                          >
                            Make Admin
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => demoteToStudent(user.email)}
                          >
                            Make Student
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => deleteUser(user.email)}
                          disabled={user.role === 'admin'}
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
          
          {users.length === 0 && (
            <div className="text-center text-muted py-4">
              <h5>No users found</h5>
              <p>No users have registered yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;