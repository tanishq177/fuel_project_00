import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <svg viewBox="0 0 24 24">
          <defs>
            <linearGradient id="brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
        </svg>
        <span>Helpdesk Cloud</span>
      </Link>

      <div className="nav-links">
        {user ? (
          <>
            {/* Customer Links */}
            {user.role === 'CUSTOMER' && (
              <>
                <Link to="/customer/dashboard" className={`nav-link ${isActive('/customer/dashboard') ? 'active' : ''}`}>
                  Dashboard
                </Link>
                <Link to="/customer/my-tickets" className={`nav-link ${isActive('/customer/my-tickets') ? 'active' : ''}`}>
                  My Tickets
                </Link>
                <Link to="/customer/create-ticket" className={`nav-link ${isActive('/customer/create-ticket') ? 'active' : ''}`}>
                  + Create Ticket
                </Link>
              </>
            )}

            {/* Support Agent Links */}
            {user.role === 'SUPPORT_AGENT' && (
              <Link to="/agent/dashboard" className={`nav-link ${isActive('/agent/dashboard') ? 'active' : ''}`}>
                Agent Workspace
              </Link>
            )}

            {/* Admin Links */}
            {user.role === 'ADMIN' && (
              <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}>
                Admin Portal
              </Link>
            )}

            {/* User Info & Logout */}
            <div className="nav-user">
              <span className="user-badge" title={`Logged in as ${user.email}`}>
                <span>{user.name}</span>
                <span style={{ opacity: 0.6, fontSize: '0.75rem', fontWeight: 500 }}>
                  ({user.role === 'SUPPORT_AGENT' ? 'Agent' : user.role === 'CUSTOMER' ? 'Customer' : 'Admin'})
                </span>
              </span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Sign out of account">
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
