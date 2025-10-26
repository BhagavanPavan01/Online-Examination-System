import React, { useState, useEffect } from 'react';
import { registerUser, getStudentsByBranch, validateRollNumberFormat, generateRollNumber } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import './RegistrationForm.css';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    branch: '',
    rollNumber: '',
    phone: '',
    semester: '',
    year: '2024'
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedRollNumber, setSuggestedRollNumber] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const branches = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL', 'IT', 'AIML', 'DS'];
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];
  const years = ['2024', '2023', '2022', '2021'];

  // Generate suggested roll number when branch is selected
  useEffect(() => {
    if (formData.role === 'student' && formData.branch) {
      const suggested = generateRollNumber(formData.branch);
      setSuggestedRollNumber(suggested);
      
      // Auto-fill roll number if empty
      if (!formData.rollNumber) {
        setFormData(prev => ({
          ...prev,
          rollNumber: suggested
        }));
      }
    }
  }, [formData.branch, formData.role]);

  // Validate password strength
  useEffect(() => {
    if (formData.password) {
      const strength = checkPasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength('');
    }
  }, [formData.password]);

  const checkPasswordStrength = (password) => {
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'medium';
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strengthCount = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    
    if (strengthCount >= 3) return 'strong';
    if (strengthCount >= 2) return 'medium';
    return 'weak';
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email address is invalid';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Student-specific validations
    if (formData.role === 'student') {
      if (!formData.branch) {
        errors.branch = 'Branch selection is required';
      }
      
      if (!formData.rollNumber) {
        errors.rollNumber = 'Roll number is required';
      } else if (!validateRollNumberFormat(formData.rollNumber, formData.branch)) {
        errors.rollNumber = `Roll number should start with ${formData.branch?.toUpperCase()}`;
      }

      if (!formData.semester) {
        errors.semester = 'Semester selection is required';
      }

      if (!formData.phone) {
        errors.phone = 'Phone number is required';
      } else if (!/^\d{10}$/.test(formData.phone)) {
        errors.phone = 'Phone number must be 10 digits';
      }
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear general error when user makes changes
    if (error) setError('');
  };

  const validateRollNumber = (rollNumber, branch) => {
    if (!rollNumber) return 'Roll number is required';
    if (!branch) return 'Please select branch first';
    
    // Check if roll number matches branch pattern
    if (!validateRollNumberFormat(rollNumber, branch)) {
      return `Roll number should start with ${branch.toUpperCase()}`;
    }
    
    // Check if roll number already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const existingUser = users.find(user => 
      user.rollNumber && user.rollNumber.toUpperCase() === rollNumber.toUpperCase()
    );
    if (existingUser) {
      return 'This roll number is already registered';
    }
    
    return '';
  };

  const handleUseSuggestion = () => {
    setFormData(prev => ({
      ...prev,
      rollNumber: suggestedRollNumber
    }));
    
    // Clear roll number error
    if (formErrors.rollNumber) {
      setFormErrors(prev => ({
        ...prev,
        rollNumber: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setLoading(false);
      return;
    }

    // Additional roll number validation for students
    if (formData.role === 'student') {
      const rollNumberError = validateRollNumber(formData.rollNumber, formData.branch);
      if (rollNumberError) {
        setFormErrors(prev => ({ ...prev, rollNumber: rollNumberError }));
        setLoading(false);
        return;
      }
    }

    const userData = {
      name: formData.name.trim(),
      email: formData.email.toLowerCase(),
      password: formData.password,
      role: formData.role,
      branch: formData.role === 'student' ? formData.branch : null,
      rollNumber: formData.role === 'student' ? formData.rollNumber.toUpperCase() : null,
      phone: formData.role === 'student' ? formData.phone : null,
      semester: formData.role === 'student' ? formData.semester : null,
      year: formData.role === 'student' ? formData.year : null,
      registeredAt: new Date().toISOString(),
      isActive: true,
      lastLogin: null
    };

    try {
      const result = registerUser(userData);
      
      if (result.success) {
        const successMessage = formData.role === 'student' 
          ? `Registration successful! Your roll number is ${userData.rollNumber}. Redirecting to login...`
          : 'Registration successful! Redirecting to login...';
        
        setSuccess(successMessage);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'student',
          branch: '',
          rollNumber: '',
          phone: '',
          semester: '',
          year: '2024'
        });

        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'strong': return '#10b981';
      default: return '#e5e7eb';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return 'Weak';
      case 'medium': return 'Medium';
      case 'strong': return 'Strong';
      default: return '';
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <div className="registration-header">
          <div className="header-icon">🎓</div>
          <h2>Create Your Account</h2>
          <p>Join our examination system and start your learning journey</p>
        </div>
        
        <div className="registration-body">
          {error && (
            <div className="alert error">
              <span className="alert-icon">⚠️</span>
              {error}
            </div>
          )}
          
          {success && (
            <div className="alert success">
              <span className="alert-icon">✅</span>
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="registration-form">
            {/* Personal Information Section */}
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              
              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className={formErrors.name ? 'error' : ''}
                  />
                  {formErrors.name && <span className="field-error">{formErrors.name}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email address"
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && <span className="field-error">{formErrors.email}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role">Account Type *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                {formData.role === 'student' && (
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="10-digit number"
                      className={formErrors.phone ? 'error' : ''}
                      maxLength="10"
                    />
                    {formErrors.phone && <span className="field-error">{formErrors.phone}</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Academic Information Section - Only for Students */}
            {formData.role === 'student' && (
              <div className="form-section">
                <h3 className="section-title">Academic Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="branch">Branch *</label>
                    <select
                      id="branch"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      required
                      className={formErrors.branch ? 'error' : ''}
                    >
                      <option value="">Select Your Branch</option>
                      {branches.map(branch => (
                        <option key={branch} value={branch}>{branch}</option>
                      ))}
                    </select>
                    {formErrors.branch && <span className="field-error">{formErrors.branch}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="semester">Semester *</label>
                    <select
                      id="semester"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      required
                      className={formErrors.semester ? 'error' : ''}
                    >
                      <option value="">Select Semester</option>
                      {semesters.map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                    {formErrors.semester && <span className="field-error">{formErrors.semester}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="year">Academic Year</label>
                    <select
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}-{parseInt(year) + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="rollNumber">Roll Number *</label>
                    <div className="roll-number-input-group">
                      <input
                        type="text"
                        id="rollNumber"
                        name="rollNumber"
                        value={formData.rollNumber}
                        onChange={handleChange}
                        required
                        placeholder="e.g., 2XXXXXXXXXX"
                        className={`roll-number-input ${formErrors.rollNumber ? 'error' : ''}`}
                        style={{
                          borderColor: formData.rollNumber && validateRollNumber(formData.rollNumber, formData.branch) 
                            ? '#ef4444' 
                            : formData.rollNumber && !validateRollNumber(formData.rollNumber, formData.branch)
                            ? '#10b981' 
                            : '#e2e8f0'
                        }}
                      />
                      {suggestedRollNumber && suggestedRollNumber !== formData.rollNumber && (
                        <button
                          type="button"
                          className="suggestion-btn"
                          onClick={handleUseSuggestion}
                        >
                          Use {suggestedRollNumber}
                        </button>
                      )}
                    </div>
                    <div className="input-hints">
                      <small>
                        Format: {formData.branch ? formData.branch.toUpperCase() : 'BRANCH'} + Number (e.g., {formData.branch ? formData.branch.toUpperCase() : 'CSE'}001)
                      </small>
                      {formData.rollNumber && (
                        <small className={validateRollNumber(formData.rollNumber, formData.branch) ? 'text-error' : 'text-success'}>
                          {validateRollNumber(formData.rollNumber, formData.branch) || '✓ Valid roll number format'}
                        </small>
                      )}
                    </div>
                    {formErrors.rollNumber && <span className="field-error">{formErrors.rollNumber}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Security Section */}
            <div className="form-section">
              <h3 className="section-title">Security</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create a strong password"
                    className={formErrors.password ? 'error' : ''}
                    minLength="6"
                  />
                  {formData.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div 
                          className="strength-fill"
                          style={{
                            width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%',
                            backgroundColor: getPasswordStrengthColor()
                          }}
                        ></div>
                      </div>
                      <span className={`strength-text strength-${passwordStrength}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                  )}
                  {formErrors.password && <span className="field-error">{formErrors.password}</span>}
                  <div className="password-hints">
                    <small>• At least 6 characters</small>
                    <small>• Mix of letters, numbers, and symbols</small>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm your password"
                    className={formErrors.confirmPassword ? 'error' : ''}
                  />
                  {formErrors.confirmPassword && <span className="field-error">{formErrors.confirmPassword}</span>}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <small className="text-success">✓ Passwords match</small>
                  )}
                </div>
              </div>
            </div>

            {/* Terms and Submit */}
            <div className="form-section">
              <div className="terms-agreement">
                <input type="checkbox" id="terms" required />
                <label htmlFor="terms">
                  I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
                </label>
              </div>

              <button 
                type="submit" 
                className={`submit-btn ${loading ? 'loading' : ''}`}
                disabled={loading || (formData.role === 'student' && !!validateRollNumber(formData.rollNumber, formData.branch))}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="registration-footer">
            <p>
              Already have an account?{' '}
              <a href="/login" className="login-link">Sign in here</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;