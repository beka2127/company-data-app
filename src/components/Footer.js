// src/components/Footer.js
import React from 'react';
import './Footer.css'; // Make sure this CSS file exists

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <p>&copy; {currentYear} Company Dashboard. All rights reserved.</p>
    </footer>
  );
}

export default Footer;