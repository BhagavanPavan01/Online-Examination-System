import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Main Footer Content */}
        <div className="footer-content">
          
          {/* Brand Section */}
          <div className="footer-section">
            <div className="footer-brand">
              <div className="footer-logo">🎓 ExamPro</div>
              <p className="footer-description">
                The ultimate online examination platform for modern education. 
                Secure, reliable, and feature-rich exam management system.
              </p>
              <div className="social-links">
                <button type="button" className="social-link">📘</button>
                <button type="button" className="social-link">🐦</button>
                <button type="button" className="social-link">📷</button>
                <button type="button" className="social-link">💼</button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/about" className="footer-link">About Us</Link></li>
              <li><Link to="/features" className="footer-link">Features</Link></li>
              <li><Link to="/contact" className="footer-link">Contact</Link></li>
              <li><Link to="/pricing" className="footer-link">Pricing</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div className="footer-section">
            <h4 className="footer-title">Features</h4>
            <ul className="footer-links">
              <li><span className="footer-link">AI Proctoring</span></li>
              <li><span className="footer-link">Live Monitoring</span></li>
              <li><span className="footer-link">Result Analytics</span></li>
              <li><span className="footer-link">User Management</span></li>
              <li><span className="footer-link">Secure Exams</span></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li><a href="mailto:support@exampro.com" className="footer-link">support@exampro.com</a></li>
              <li><a href="tel:+919542377685" className="footer-link">📞 +91 9542377685</a></li>
              <li><span className="footer-link">🕒 24/7 Support</span></li>
              <li><Link to="/help" className="footer-link">Help Center</Link></li>
              <li><Link to="/docs" className="footer-link">Documentation</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-section">
            <h4 className="footer-title">Legal</h4>
            <ul className="footer-links">
              <li><Link to="/privacy-policy" className="footer-link">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="footer-link">Terms of Service</Link></li>
              <li><Link to="/cookie-policy" className="footer-link">Cookie Policy</Link></li>
              <li><Link to="/security" className="footer-link">Security</Link></li>
              <li><Link to="/compliance" className="footer-link">Compliance</Link></li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              © 2025 ExamPro. All rights reserved.
            </div>
            <div className="footer-bottom-links">
              <span>Made with ❤️ for education</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;