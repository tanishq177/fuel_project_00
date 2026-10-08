import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ticketService from '../services/ticketService';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import Interactive3DGlobe from '../components/Interactive3DGlobe';

// 3D Visual Assets
import heroImg from '../assets/hero_3d.jpg';
import speedImg from '../assets/speed_3d.jpg';
import securityImg from '../assets/security_3d.jpg';
import analyticsImg from '../assets/analytics_3d.jpg';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingSample, setCreatingSample] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    if (user && user.id) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTickets = async () => {
    if (!user || !user.id) return;
    try {
      setLoading(true);
      setError('');
      const data = await ticketService.getTickets({ customerId: user.id });
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      // Fallback state
      setError('');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Fast Sample Ticket Generator for instant live testing
  const handleCreateSampleTicket = async (sampleCategory = 'Order, Shipping & Delivery') => {
    if (!user || !user.id) {
      alert('Please log in first.');
      return;
    }

    setCreatingSample(true);
    try {
      const sampleTitles = {
        'Order, Shipping & Delivery': '[High] [Order] Order #ORD-89412 - Express Delivery Transit Delay',
        'Billing, Invoices & Refunds': '[Medium] [Billing] Invoice #INV-5021 - Double Charge Refund Inquiry',
        'Return, Exchange & Warranty': '[Medium] [Returns] Request Replacement for Order #ORD-77210',
        'Product Defect / Item Issue': '[High] [Defect] Item received with physical packaging defect',
      };

      const title = sampleTitles[sampleCategory] || `[Medium] [${sampleCategory}] General Inquiry regarding Order`;
      const description = `Hello Customer Support Team,\n\nI am requesting assistance regarding my recent request for ${sampleCategory}.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📌 CUSTOMER TICKET & SERVICE DETAILS\n• Issue Category: ${sampleCategory}\n• Urgency / Priority: HIGH\n• Platform / Device: Web Browser (Chrome/Edge)\n• Preferred Contact: Email Notification\n• Order Reference ID: ORD-${Math.floor(10000 + Math.random() * 90000)}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      const created = await ticketService.createTicket({
        title,
        description,
        customerId: user.id,
      });

      setSuccessToast(`Ticket #${created.id} created successfully! Refreshing dashboard...`);
      setTimeout(() => setSuccessToast(''), 4000);
      await fetchTickets();
    } catch (err) {
      console.error('Error creating sample ticket:', err);
      alert('Failed to generate sample ticket. Make sure backend is running.');
    } finally {
      setCreatingSample(false);
    }
  };

  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="container">
      {/* Success Toast */}
      {successToast && (
        <div className="alert alert-success" style={{ position: 'sticky', top: '80px', zIndex: 90 }}>
          <span>🎉 {successToast}</span>
          <button onClick={() => setSuccessToast('')} style={{ background: 'none', border: 'none', color: '#6ee7b7', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* 3D Hero Banner */}
      <div className="hero-3d-card">
        <div className="hero-3d-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-3d-tag">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }}></span>
            Next-Gen Customer Support Cloud
          </div>
          <h1 className="hero-3d-title">Welcome back, {user?.name || 'Customer'}!</h1>
          <p className="hero-3d-desc">
            Experience lightning-fast ticket resolution powered by dedicated support specialists. Track real-time progress, chat with our 3D AI assistant, and receive instant updates on your orders and inquiries.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to="/customer/create-ticket" className="btn btn-primary">
              <span>+</span> Submit New Ticket
            </Link>
            <Link to="/customer/my-tickets" className="btn btn-secondary">
              View All Tickets ({totalTickets})
            </Link>
            <button
              onClick={() => handleCreateSampleTicket('Order, Shipping & Delivery')}
              disabled={creatingSample}
              className="btn btn-secondary"
              style={{
                borderColor: 'rgba(56, 189, 248, 0.4)',
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#7dd3fc',
              }}
              title="Instantly generate a test ticket to populate the dashboard"
            >
              <span>⚡</span> {creatingSample ? 'Generating...' : '1-Click Quick Demo Ticket'}
            </button>
          </div>
        </div>

        <div className="hero-3d-img-container">
          <img src={heroImg} alt="3D AI Support Assistant" className="hero-3d-img" />
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              right: '12px',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(10px)',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f8fafc' }}>Nova AI Active</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#93c5fd', fontWeight: 600 }}>SLA &lt; 15m</span>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* 3D Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard title="Total Tickets" value={totalTickets} icon="🎫" color="blue" />
        <MetricCard title="Open Requests" value={openTickets} icon="⏳" color="yellow" />
        <MetricCard title="In Progress" value={inProgressTickets} icon="⚡" color="blue" />
        <MetricCard title="Resolved / Closed" value={resolvedTickets} icon="✅" color="green" />
      </div>

      {/* Quick-Launch Support Categories Hub */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(24, 34, 53, 0.8) 100%)', border: '1px solid rgba(59, 130, 246, 0.25)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#93c5fd', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              <span>🚀</span> Fast Support Launcher
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc' }}>What do you need help with today?</h2>
          </div>
          <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Click any category to start an instant request</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '📦', title: 'Order & Shipping Delay', desc: 'Package tracking, dispatch status, address changes', category: 'Order, Shipping & Delivery' },
            { icon: '💳', title: 'Billing & Refund Claim', desc: 'Invoices, duplicate payments, bank disputes', category: 'Billing, Invoices & Refunds' },
            { icon: '🔄', title: 'Return & Replacement', desc: 'Wrong item received, size exchange, return labels', category: 'Return, Exchange & Warranty' },
            { icon: '🛠️', title: 'Product Defect / Warranty', desc: 'Damaged item, malfunctioning hardware, repair service', category: 'Product Defect / Item Issue' },
            { icon: '👤', title: 'Account & Security', desc: 'Password reset, 2FA recovery, profile update', category: 'Account, Password & Profile' },
            { icon: '📱', title: 'Website / App Glitch', desc: 'Checkout errors, mobile crash, page display bugs', category: 'App & Website Technical Help' },
          ].map((cat, i) => (
            <div
              key={i}
              onClick={() => navigate('/customer/create-ticket')}
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '1.15rem',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.45)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.9)';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(56, 189, 248, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.65)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
                <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{cat.title}</strong>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
                {cat.desc}
              </p>
              <div style={{ color: '#60a5fa', fontSize: '0.78rem', fontWeight: 600, marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>Open Request</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3D Feature Cards Showcase */}
      <div className="features-3d-grid">
        <div className="feature-3d-card">
          <div className="feature-3d-img-wrap">
            <img src={speedImg} alt="Instant Speed & SLA" className="feature-3d-img" />
          </div>
          <h3 className="feature-3d-title">⚡ High-Velocity Triage</h3>
          <p className="feature-3d-desc">
            Automated intelligent routing connects your ticket to specialized customer care agents for swift turnaround.
          </p>
        </div>

        <div className="feature-3d-card">
          <div className="feature-3d-img-wrap">
            <img src={securityImg} alt="Enterprise Security" className="feature-3d-img" />
          </div>
          <h3 className="feature-3d-title">🛡️ Secure Data Isolation</h3>
          <p className="feature-3d-desc">
            Bank-grade privacy guarantees that your sensitive attachments, receipts, and order history remain strictly confidential.
          </p>
        </div>

        <div className="feature-3d-card">
          <div className="feature-3d-img-wrap">
            <img src={analyticsImg} alt="Real-time Analytics" className="feature-3d-img" />
          </div>
          <h3 className="feature-3d-title">📊 Live Ticket Telemetry</h3>
          <p className="feature-3d-desc">
            Monitor real-time status transitions, timestamped agent responses, and full resolution audit logs.
          </p>
        </div>
      </div>

      {/* 3D Global Cloud Infrastructure Showcase */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.88) 0%, rgba(24, 34, 53, 0.8) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          padding: '2.25rem',
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '2.25rem',
          alignItems: 'center',
          marginBottom: '2.5rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.3rem 0.75rem', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#7dd3fc', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            🌍 3D Global Edge Mesh
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
            Worldwide High-Availability Support Grid
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
            Our distributed customer care nodes synchronize data across global regions with sub-second database response times and 99.98% uptime SLA.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>North America</span>
              <strong style={{ color: '#38bdf8', fontSize: '1.15rem' }}>14ms</strong>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Europe (Frankfurt)</span>
              <strong style={{ color: '#34d399', fontSize: '1.15rem' }}>21ms</strong>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '0.85rem', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Asia Pacific</span>
              <strong style={{ color: '#c084fc', fontSize: '1.15rem' }}>18ms</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Interactive3DGlobe />
        </div>
      </div>

      {/* Recent Tickets Table Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Recent Support Inquiries</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Overview of your recent submissions and active resolution status</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={() => handleCreateSampleTicket('Billing, Invoices & Refunds')}
              disabled={creatingSample}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              + Quick Demo Ticket
            </button>
            <Link to="/customer/my-tickets" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Explore All ({totalTickets})</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🔄</div>
            <p>Loading your tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="empty-state" style={{ padding: '2.5rem 1.5rem' }}>
            <div style={{ fontSize: '2.8rem', marginBottom: '0.75rem' }}>📂</div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Active Tickets Found</h3>
            <p style={{ marginBottom: '1.5rem', maxWidth: '460px', margin: '0 auto 1.5rem auto', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              You haven't submitted any customer service requests yet. Use our 1-click test button to create a sample ticket or submit a real issue!
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/customer/create-ticket" className="btn btn-primary">
                Create Your First Ticket
              </Link>
              <button
                onClick={() => handleCreateSampleTicket('Order, Shipping & Delivery')}
                disabled={creatingSample}
                className="btn btn-secondary"
                style={{ borderColor: 'rgba(56, 189, 248, 0.3)' }}
              >
                ⚡ Generate Sample Ticket
              </button>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Subject / Title</th>
                  <th>Current Status</th>
                  <th>Assigned Specialist</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.slice(0, 5).map((ticket) => (
                  <tr key={ticket.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{ticket.id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{ticket.title}</td>
                    <td>
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td>
                      {ticket.assignedAgent ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }}></span>
                          {ticket.assignedAgent.name}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '0.85rem' }}>Pending Assignment</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {new Date(ticket.createdDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/tickets/${ticket.id}`} className="btn btn-secondary btn-sm">
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scrollable Knowledge Base & Support Guidelines */}
      <div className="scroll-section">
        <div className="section-heading">
          <div>
            <h2>📚 Quick Support Knowledge Hub</h2>
            <p>Helpful tips to resolve issues in record time</p>
          </div>
        </div>

        <div className="guide-cards-grid">
          <div className="guide-card">
            <h3><span>💡</span> Writing Great Inquiries</h3>
            <p>
              Include your Order ID, exact product name, and photos of damaged packaging to help agents resolve issues on the very first reply.
            </p>
          </div>
          <div className="guide-card">
            <h3><span>⏱️</span> Ticket Lifecycles</h3>
            <p>
              Tickets move from <strong>OPEN</strong> to <strong>IN_PROGRESS</strong> when a support specialist takes charge, and <strong>RESOLVED</strong> upon completion.
            </p>
          </div>
          <div className="guide-card">
            <h3><span>💬</span> Discussion &amp; Attachments</h3>
            <p>
              Post follow-up replies and upload photos or short video clips directly in your ticket thread at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Live System Status Bar */}
      <div className="status-bar-card">
        <div className="status-bar-item">
          <div className="status-dot-pulse"></div>
          <div>
            <strong style={{ color: '#f8fafc', fontSize: '0.9rem' }}>Helpdesk Cloud Grid Operational</strong>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>99.98% System Uptime SLA • All Services Online</div>
          </div>
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Average Specialist Response: <strong style={{ color: '#60a5fa' }}>&lt; 15 mins</strong>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
