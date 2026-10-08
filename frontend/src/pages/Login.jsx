import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import heroImg from '../assets/hero_3d.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login({ email, password });
      login(data);

      // Redirect user to their respective dashboard
      if (data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (data.role === 'SUPPORT_AGENT') {
        navigate('/agent/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo account quick-fill helper for easy viva demonstration
  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="auth-wrapper-split">
      <div className="auth-split-container">
        {/* Left Side: 3D Visual Brand Showcase */}
        <div className="auth-split-banner">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.35)', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', marginBottom: '1rem' }}>
              ✨ Cloud Support OS v2.0
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.25, marginBottom: '0.75rem' }}>
              Intelligent Ticket Operations &amp; Support Hub
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Seamlessly connect customers, support agents, and administrators with real-time issue lifecycles.
            </p>
          </div>

          <img src={heroImg} alt="3D Support Cloud" className="auth-split-banner-img" />

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            <div>
              <strong style={{ color: '#38bdf8', display: 'block', fontSize: '1.1rem' }}>99.9%</strong>
              <span>Uptime SLA</span>
            </div>
            <div>
              <strong style={{ color: '#34d399', display: 'block', fontSize: '1.1rem' }}>&lt; 15 min</strong>
              <span>Triage Time</span>
            </div>
            <div>
              <strong style={{ color: '#c084fc', display: 'block', fontSize: '1.1rem' }}>End-to-End</strong>
              <span>Security</span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="auth-split-form">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to access your helpdesk workspace</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. john@customer.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In to Workspace →'}
            </button>
          </form>

          {/* Quick Demo Credentials Box for Viva / Testing */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>
              ⚡ 1-Click Quick Demo Sign In:
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('john@customer.com', 'customer123')}
                className="chip-btn"
              >
                👤 Customer
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('agent1@helpdesk.com', 'agent123')}
                className="chip-btn"
              >
                🛠️ Agent
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@helpdesk.com', 'admin123')}
                className="chip-btn"
              >
                👑 Admin
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
