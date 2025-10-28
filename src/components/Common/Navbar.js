import React from 'react';


const Navbar = ({ user, onLogout }) => {
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

  // Check if user has a photo URL (you can extend your user object to include photoUrl)
  const userPhotoUrl = user?.photoUrl;

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        {/* Brand/Logo */}
        <a className="navbar-brand" href="/">
          Online Exam System
        </a>
        
        <div className="navbar-content">
          {/* User Section */}
          <div className="user-section">
            {user ? (
              <div className="user-profile">
                
                <div className="user-info">
                  <span className="welcome-text">Welcome, {user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>

                {/* Profile Photo - Show actual photo if available, otherwise show initials */}
                {userPhotoUrl ? (
                  <img 
                    src={userPhotoUrl} 
                    alt={`${user.name}'s profile`}
                    className="profile-photo"
                    style={{ 
                      borderRadius: '25%',
                      objectFit: 'cover'
                    }}
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
                <a className="auth-link" href="/login">
                  Login
                </a>
                <a className="auth-link register-link" href="/register">
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