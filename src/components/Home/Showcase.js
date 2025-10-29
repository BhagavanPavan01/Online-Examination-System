import React from 'react';
import { Link } from 'react-router-dom';
import './Showcase.css';

const Showcase = ({ user }) => {
  return (
    <div className="showcase">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome to 
              <span className="gradient-text"> ExamPro</span>
            </h1>
            <p className="hero-subtitle">
              The ultimate online examination platform for modern education. 
              Conduct secure, AI-proctored exams with real-time monitoring 
              and comprehensive analytics.
            </p>
            <div className="hero-buttons">
              {user ? (
                <Link 
                  to={user.role === 'admin' ? '/admin' : '/student'} 
                  className="btn-primary btn-lg"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary btn-lg">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn-outline btn-lg">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card exam-card">
              <div className="card-header">Online Exam</div>
              <div className="card-content">
                <div className="question">Q. What is React?</div>
                <div className="options">
                  <div className="option">A. Framework</div>
                  <div className="option selected">B. Library</div>
                  <div className="option">C. Language</div>
                </div>
              </div>
            </div>
            <div className="floating-card stats-card">
              <div className="stats">
                <div className="stat">
                  <div className="stat-number">100+</div>
                  <div className="stat-label">Students</div>
                </div>
                <div className="stat">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Exams</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Choose ExamPro?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>AI Proctoring</h3>
              <p>Advanced AI monitoring with face detection and violation tracking</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Real-time Results</h3>
              <p>Instant scoring and detailed analytics for performance tracking</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Secure & Reliable</h3>
              <p>Bank-level security with encrypted data and secure exam environment</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Advanced Analytics</h3>
              <p>Comprehensive reports and insights for students and administrators</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Transform Your Examination Process?</h2>
          <p>Join thousands of educational institutions using ExamPro</p>
          {!user && (
            <Link to="/register" className="btn-primary btn-lg">
              Start Your Free Trial
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Showcase;