import React from 'react';
import '../styles/Footer.css';

const Footer: React.FC = () => (
  <footer className="footer">
    <div className="footer-container">
      <p>&copy; {new Date().getFullYear()} Steakz. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;