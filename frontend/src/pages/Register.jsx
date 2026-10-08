import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import securityImg from '../assets/security_3d.jpg';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authService.register({ name, email, password, role });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper-split">
      <div className="auth-split-container">
        {/* Left Side: 3D Visual Security Showcase */}
        <div className="auth-split-banner">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, color: '#6ee7b7', textTransform: 'uppercase', marginBottom: '1rem' }}>
              🛡️ Enterprise Security
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.25, marginBottom: '0.75rem' }}>
              Join the High-Trust Support Ecosystem
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Register as a customer to submit inquiries or as a support agent to resolve customer tickets with real-time tooling.
            </p>
          </div>

          <img src={securityImg} alt="3D Security Shield" className="auth-split-banner-img" />

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1.5rem', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            <div>
              <strong style={{ color: '#34d399', display: 'block', fontSize: '1.1rem' }}>256-Bit</strong>
              <span>Data Protection</span>
            </div>
            <div>
              <strong style={{ color: '#38bdf8', display: 'block', fontSize: '1.1rem' }}>Direct</strong>
              <span>Agent Triage</span>
            </div>
            <div>
              <strong style={{ color: '#c084fc', display: 'block', fontSize: '1.1rem' }}>Zero</strong>
              <span>Downtime</span>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="auth-split-form">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Get instant access to the support workspace</p>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="e.g. john@example.com"
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
                placeholder="Minimum 4 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Role</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="CUSTOMER">Customer (Submit &amp; track tickets)</option>
                <option value="SUPPORT_AGENT">Support Agent (Resolve tickets)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Complete Registration →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
