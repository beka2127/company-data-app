// src/components/Header.js
import React from 'react';
import './Header.css';
import { useLocation } from 'react-router-dom';

function Header({ userRole, username, onLogout, onNavigate }) {
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="logo">
        <h1>Company Dashboard</h1>
      </div>
      <nav className="main-nav">
        <ul>
          <li>
            <button
              className={location.pathname === '/dashboard' ? 'active' : ''}
              onClick={() => onNavigate('/dashboard')}
            >
              Dashboard
            </button>
          </li>
          {userRole === 'admin' && (
            <li>
              <button
                className={location.pathname === '/admin' ? 'active' : ''}
                onClick={() => onNavigate('/admin')}
              >
                Admin Panel
              </button>
            </li>
          )}
        </ul>
      </nav>
      <div className="user-info">
        <span>Welcome, {username}!</span>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>
    </header>
  );
}

export default Header;