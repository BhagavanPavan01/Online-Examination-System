import React, { useState } from 'react';
import { loginUser } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

// In Login component, update the handleSubmit function:
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  
  try {
    const result = loginUser(formData.email, formData.password);
    
    if (result.success) {
      onLogin(result.user);
      
      // Store user data in localStorage or context for easy access
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      
      // Navigate based on role
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } else {
      setError(result.message);
    }
  } catch (error) {
    setError('Login failed. Please try again.');
  }
};

  return (
    <div className="container mt-5">
      <div className="row justify-center">
        <div className="col-md-7">
          <div className="card">
            <div className="card-header">
              <h3 className="text-center">Login</h3>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Login
                </button>
              </form>
              <div className="text-center mt-3">
                <p>Don't have an account? <a href="/register">Register here</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;