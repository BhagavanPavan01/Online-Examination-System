import React, { useState } from 'react';

const Navbar = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Function to get user initials for profile photo
  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Function to generate a color based on user name
  const getUserColor = (name) => {
    if (!name) return '#667eea';
    
    const colors = [
      'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
      'linear-gradient(135deg, #48cae4 0%, #0077b6 100%)',
      'linear-gradient(135deg, #9d4edd 0%, #5a189a 100%)',
      'linear-gradient(135deg, #f9c74f 0%, #f9844a 100%)',
      'linear-gradient(135deg, #43aa8b 0%, #577590 100%)',
      'linear-gradient(135deg, #f72585 0%, #7209b7 100%)'
    ];
    
    const index = name.length % colors.length;
    return colors[index];
  };

  // Check if user has a photo URL
  const userPhotoUrl = user?.photoUrl;

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        {/* Brand/Logo - Always visible on all screens */}
        <a className="navbar-brand" href="/">
          Online Exam System
        </a>
        
        {/* Desktop Navigation - Right Side */}
        <div className="navbar-content desktop-nav">
          {user ? (
            <div className="user-profile">
              <div className="user-info">
                <span className="welcome-text">Welcome, {user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>

              {/* Profile Photo */}
              {userPhotoUrl ? (
                <img 
                  src={userPhotoUrl} 
                  alt={`${user.name}'s profile`}
                  className="profile-photo"
                />
              ) : (
                <div 
                  className="profile-photo"
                  style={{ background: getUserColor(user.name) }}
                  title={`${user.name} (${user.role})`}
                >
                  <div className="profile-initials">
                    {getUserInitials(user.name)}
                  </div>
                </div>
              )}
              
              <button 
                className="logout-btn" 
                onClick={onLogout}
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <a className="auth-link login-btn" href="/login">
                Login
              </a>
              <a className="auth-link register-btn" href="/register">
                Register
              </a>
            </div>
          )}
        </div>

        {/* Mobile Navigation - Only on small screens */}
        <div className="mobile-nav">
          {/* Mobile Toggle Button */}
          <button 
            className="mobile-toggle-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${isMobileMenuOpen ? 'active' : ''}`}></span>
            <span className={`hamburger-line ${isMobileMenuOpen ? 'active' : ''}`}></span>
            <span className={`hamburger-line ${isMobileMenuOpen ? 'active' : ''}`}></span>
          </button>

          {/* Mobile Menu Dropdown */}
          <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
            {user ? (
              <div className="mobile-user-section">
                <div className="mobile-user-info">
                  {userPhotoUrl ? (
                    <img 
                      src={userPhotoUrl} 
                      alt={`${user.name}'s profile`}
                      className="mobile-profile-photo"
                    />
                  ) : (
                    <div 
                      className="mobile-profile-photo"
                      style={{ background: getUserColor(user.name) }}
                    >
                      <div className="profile-initials">
                        {getUserInitials(user.name)}
                      </div>
                    </div>
                  )}
                  <div className="mobile-user-details">
                    <span className="mobile-user-name">{user.name}</span>
                    <span className="mobile-user-role">{user.role}</span>
                  </div>
                </div>
                <button 
                  className="mobile-logout-btn" 
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="mobile-auth-links">
                <a 
                  className="mobile-auth-link mobile-login-btn" 
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </a>
                <a 
                  className="mobile-auth-link mobile-register-btn" 
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;