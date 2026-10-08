import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ticketService from '../services/ticketService';
import adminService from '../services/adminService';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import speedImg from '../assets/speed_3d.jpg';

const AgentDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'OPEN' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED'
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingSample, setCreatingSample] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Quick Communication Modal State
  const [quickContactTicket, setQuickContactTicket] = useState(null);
  const [cannedMessage, setCannedMessage] = useState('');
  const [sendingQuickMsg, setSendingQuickMsg] = useState(false);

  // Escalation Modal State (For reporting unsolvable issues)
  const [escalateTicket, setEscalateTicket] = useState(null);
  const [escalationReason, setEscalationReason] = useState('Engineering Bug / Backend Service Outage');
  const [escalationNotes, setEscalationNotes] = useState('');
  const [submittingEscalation, setSubmittingEscalation] = useState(false);

  // Platform Bug / Incident Report Modal
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [submittingIncident, setSubmittingIncident] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      fetchAgentTickets();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchAgentTickets = async () => {
    if (!user || !user.id) return;
    try {
      setLoading(true);
      setError('');
      const data = await ticketService.getTickets({ agentId: user.id });
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch assigned tickets:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = async (ticketId, newStatus) => {
    try {
      await ticketService.updateStatus(ticketId, newStatus);
      setToastMsg(`Ticket #${ticketId} status updated to ${newStatus}`);
      setTimeout(() => setToastMsg(''), 3000);
      fetchAgentTickets();
    } catch (err) {
      alert('Failed to update ticket status.');
    }
  };

  // Quick Canned Message Sender directly from Agent Console
  const handleSendQuickMessage = async (e) => {
    e.preventDefault();
    if (!quickContactTicket || !cannedMessage.trim()) return;

    setSendingQuickMsg(true);
    try {
      await ticketService.addResponse(quickContactTicket.id, {
        message: cannedMessage.trim(),
        userId: user.id,
      });

      // If ticket is open, mark in progress
      if (quickContactTicket.status === 'OPEN') {
        await ticketService.updateStatus(quickContactTicket.id, 'IN_PROGRESS');
      }

      setToastMsg(`Message sent to ${quickContactTicket.customer?.name || 'Customer'}!`);
      setTimeout(() => setToastMsg(''), 3500);
      setQuickContactTicket(null);
      setCannedMessage('');
      fetchAgentTickets();
    } catch (err) {
      alert('Failed to send quick response.');
    } finally {
      setSendingQuickMsg(false);
    }
  };

  // Escalate Unsolvable Ticket to Tier-2 Engineering / Admin
  const handleEscalateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!escalateTicket) return;

    setSubmittingEscalation(true);
    try {
      const escalationPayload = `🚨 [TIER-2 / ADMIN ESCALATION REPORT]\n` +
        `• Escalated By Specialist: ${user.name} (${user.email})\n` +
        `• Escalation Category: ${escalationReason}\n` +
        `• Specialist Diagnostic Notes:\n${escalationNotes || 'Issue exceeds Tier-1 resolution capabilities. Requires senior engineering/admin investigation.'}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      // Post escalation notice in conversation thread
      await ticketService.addResponse(escalateTicket.id, {
        message: escalationPayload,
        userId: user.id,
      });

      // Update status to IN_PROGRESS (or OPEN for admin queue)
      await ticketService.updateStatus(escalateTicket.id, 'IN_PROGRESS');

      setToastMsg(`Ticket #${escalateTicket.id} escalated to Tier-2 Engineering / Admin.`);
      setTimeout(() => setToastMsg(''), 4000);
      setEscalateTicket(null);
      setEscalationNotes('');
      fetchAgentTickets();
    } catch (err) {
      alert('Failed to escalate ticket. Please try again.');
    } finally {
      setSubmittingEscalation(false);
    }
  };

  // Report System-wide Platform Incident
  const handleReportIncident = async (e) => {
    e.preventDefault();
    if (!incidentTitle.trim()) return;

    setSubmittingIncident(true);
    try {
      const created = await ticketService.createTicket({
        title: `[CRITICAL ESCALATION] [Platform Incident] ${incidentTitle.trim()}`,
        description: `🚨 SYSTEM INCIDENT REPORTED BY SUPPORT AGENT (${user.name})\n\n${incidentDesc.trim()}\n\n• Impact Level: High / System Wide\n• Reporter: ${user.email}`,
        customerId: user.id,
      });

      setToastMsg(`System incident #${created.id} logged and dispatched to engineering!`);
      setTimeout(() => setToastMsg(''), 4000);
      setShowIncidentModal(false);
      setIncidentTitle('');
      setIncidentDesc('');
      fetchAgentTickets();
    } catch (err) {
      alert('Failed to log system incident.');
    } finally {
      setSubmittingIncident(false);
    }
  };

  // 1-Click Sample Ticket for Agent Workspace
  const handleCreateAgentSampleTicket = async () => {
    if (!user || !user.id) return;
    setCreatingSample(true);
    try {
      const created = await ticketService.createTicket({
        title: `[High] [Order & Delivery] Express Shipment #ORD-89412 Delivery Exception`,
        description: `Customer reported package tracking status stopped updating in transit.\n\n• Category: Order, Shipping & Delivery\n• Priority: HIGH\n• SLA Target: < 15 mins\n• Preferred Channel: Email / Phone`,
        customerId: user.id,
      });

      await ticketService.updateStatus(created.id, 'OPEN');
      setToastMsg(`Demo assigned ticket #${created.id} generated!`);
      setTimeout(() => setToastMsg(''), 3000);
      await fetchAgentTickets();
    } catch (err) {
      console.error('Failed to create sample ticket:', err);
    } finally {
      setCreatingSample(false);
    }
  };

  // Filter and Metrics
  const totalAssigned = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const escalatedCount = tickets.filter((t) => t.title?.includes('[ESCALATED]') || t.description?.includes('ESCALATION')).length;

  const filteredTickets = tickets.filter((ticket) => {
    let matchesTab = true;
    if (filterTab === 'OPEN') matchesTab = ticket.status === 'OPEN';
    else if (filterTab === 'IN_PROGRESS') matchesTab = ticket.status === 'IN_PROGRESS';
    else if (filterTab === 'RESOLVED') matchesTab = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
    else if (filterTab === 'ESCALATED') matchesTab = ticket.title?.includes('[ESCALATED]') || ticket.description?.includes('ESCALATION');

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      ticket.title.toLowerCase().includes(query) ||
      ticket.id.toString().includes(query) ||
      (ticket.customer && ticket.customer.name.toLowerCase().includes(query)) ||
      (ticket.customer && ticket.customer.email.toLowerCase().includes(query));

    return matchesTab && matchesSearch;
  });

  return (
    <div className="container">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="alert alert-success" style={{ position: 'sticky', top: '80px', zIndex: 90 }}>
          <span>✨ {toastMsg}</span>
          <button onClick={() => setToastMsg('')} style={{ background: 'none', border: 'none', color: '#6ee7b7', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* ===================================================================
         QUICK CUSTOMER COMMUNICATION MODAL
         =================================================================== */}
      {quickContactTicket && (
        <div
          onClick={() => setQuickContactTicket(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '650px',
              width: '100%',
              background: '#0f172a',
              borderRadius: '18px',
              padding: '2rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <span>💬 Direct Customer Outreach</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>
                  Communicate with {quickContactTicket.customer?.name || 'Customer'}
                </h3>
              </div>
              <button
                onClick={() => setQuickContactTicket(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Customer Details Box */}
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', padding: '0.85rem 1rem', marginBottom: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Customer Email:</span>
                <a href={`mailto:${quickContactTicket.customer?.email}`} style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
                  {quickContactTicket.customer?.email}
                </a>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Ticket Subject:</span>
                <strong style={{ color: '#f8fafc' }}>#{quickContactTicket.id} - {quickContactTicket.title}</strong>
              </div>
            </div>

            {/* 1-Click Canned Templates */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.45rem' }}>
                ⚡ 1-Click Canned Message Presets:
              </label>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setCannedMessage(`Hello ${quickContactTicket.customer?.name || ''},\n\nWe are currently investigating your request and collaborating with our fulfillment & engineering teams. We will provide an update within 2 hours.`)}
                  className="chip-btn"
                  style={{ fontSize: '0.75rem' }}
                >
                  🔍 Investigating Issue
                </button>
                <button
                  type="button"
                  onClick={() => setCannedMessage(`Hello ${quickContactTicket.customer?.name || ''},\n\nCould you please provide additional details, screenshots, or order packaging photos so we can verify and fast-track your resolution?`)}
                  className="chip-btn"
                  style={{ fontSize: '0.75rem' }}
                >
                  📸 Request More Info
                </button>
                <button
                  type="button"
                  onClick={() => setCannedMessage(`Hello ${quickContactTicket.customer?.name || ''},\n\nGood news! We have processed your refund/replacement request. Please allow 2-3 business days for bank settlement.`)}
                  className="chip-btn"
                  style={{ fontSize: '0.75rem' }}
                >
                  💳 Refund Processed
                </button>
                <button
                  type="button"
                  onClick={() => setCannedMessage(`Hello ${quickContactTicket.customer?.name || ''},\n\nWe have verified that your issue has been successfully resolved. Please let us know if you need any additional assistance!`)}
                  className="chip-btn"
                  style={{ fontSize: '0.75rem' }}
                >
                  ✅ Issue Resolved
                </button>
              </div>
            </div>

            <form onSubmit={handleSendQuickMessage}>
              <div className="form-group">
                <label className="form-label">Message Content</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Type your direct response or explanation..."
                  value={cannedMessage}
                  onChange={(e) => setCannedMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link
                  to={`/tickets/${quickContactTicket.id}`}
                  className="btn btn-secondary btn-sm"
                  onClick={() => setQuickContactTicket(null)}
                >
                  Open Full Discussion Thread →
                </Link>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setQuickContactTicket(null)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={sendingQuickMsg || !cannedMessage.trim()}>
                    {sendingQuickMsg ? 'Sending...' : 'Send Message Now →'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
         ESCALATE UNSOLVABLE TICKET MODAL (TO TIER-2 / ADMIN)
         =================================================================== */}
      {escalateTicket && (
        <div
          onClick={() => setEscalateTicket(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(10px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '620px',
              width: '100%',
              background: '#0f172a',
              borderRadius: '18px',
              padding: '2rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.95)',
              border: '1px solid rgba(244, 63, 94, 0.5)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#fda4af', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <span>🚨 Tier-2 / Engineering Escalation</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>
                  Escalate Ticket #{escalateTicket.id}
                </h3>
              </div>
              <button
                onClick={() => setEscalateTicket(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Cannot resolve this issue directly? Report it to Senior Engineering or Platform Administrators for advanced intervention.
            </p>

            <form onSubmit={handleEscalateTicketSubmit}>
              <div className="form-group">
                <label className="form-label">Escalation Reason / Category</label>
                <select
                  className="form-select"
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  required
                >
                  <option value="Engineering Bug / Backend Service Outage">⚡ Engineering Bug / Backend API Glitch</option>
                  <option value="Payment Gateway / Bank Transaction Failure">💳 Payment Gateway / Double Billing Dispute</option>
                  <option value="Warehouse / Carrier Shipment Exception">📦 Warehouse Fulfillment / Lost in Transit</option>
                  <option value="Security / Fraud / Policy Violation">🛡️ Account Security / Fraud Investigation</option>
                  <option value="Requires Management / Legal Authorization">⚖️ Requires Executive / Legal Approval</option>
                  <option value="Other Unresolvable Technical Edge Case">❓ Other Unresolvable Issue</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Diagnostic Notes &amp; What Was Attempted</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Explain why this cannot be solved at Tier-1 and what specific engineering assistance is required..."
                  value={escalationNotes}
                  onChange={(e) => setEscalationNotes(e.target.value)}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setEscalateTicket(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" disabled={submittingEscalation || !escalationNotes.trim()}>
                  {submittingEscalation ? 'Escalating Issue...' : '🚨 Confirm Escalation to Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
         REPORT PLATFORM INCIDENT / BUG MODAL
         =================================================================== */}
      {showIncidentModal && (
        <div
          onClick={() => setShowIncidentModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(10px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '600px',
              width: '100%',
              background: '#0f172a',
              borderRadius: '18px',
              padding: '2rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.95)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#fcd34d', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  <span>📢 System-wide Incident Report</span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>
                  Report Platform Bug or Outage
                </h3>
              </div>
              <button
                onClick={() => setShowIncidentModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Notice a widespread system glitch or database failure affecting multiple customers? Log an immediate engineering incident ticket.
            </p>

            <form onSubmit={handleReportIncident}>
              <div className="form-group">
                <label className="form-label">Incident Headline / Summary</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Stripe checkout returning 500 error on mobile"
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Symptoms &amp; Impact</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Describe the bug, affected customer IDs, and error messages observed..."
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowIncidentModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }} disabled={submittingIncident || !incidentTitle.trim()}>
                  {submittingIncident ? 'Submitting Incident...' : '📢 Broadcast Incident to Engineering'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3D Hero Banner for Support Agent */}
      <div className="hero-3d-card" style={{ gridTemplateColumns: '1.3fr 0.7fr' }}>
        <div className="hero-3d-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-3d-tag">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }}></span>
            Specialist High-Velocity Workspace
          </div>
          <h1 className="hero-3d-title">Agent Console: {user?.name || 'Specialist'}</h1>
          <p className="hero-3d-desc">
            You have <strong style={{ color: '#60a5fa' }}>{inProgressCount + openCount} active cases</strong> in your queue. Engage directly with customers, dispatch canned solutions, or escalate unresolvable technical issues directly to Engineering.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="user-badge" style={{ padding: '0.45rem 0.9rem' }}>
              <span>Role: Support Specialist</span>
            </span>
            <button
              onClick={() => setShowIncidentModal(true)}
              className="btn btn-secondary btn-sm"
              style={{ borderColor: 'rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.12)', color: '#fcd34d' }}
            >
              <span>📢</span> Report Platform Bug
            </button>
            <button
              onClick={handleCreateAgentSampleTicket}
              disabled={creatingSample}
              className="btn btn-secondary btn-sm"
              style={{ borderColor: 'rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.12)', color: '#7dd3fc' }}
            >
              <span>⚡</span> {creatingSample ? 'Creating...' : '+ Test Ticket'}
            </button>
          </div>
        </div>

        <div className="hero-3d-img-container" style={{ maxHeight: '200px' }}>
          <img src={speedImg} alt="High Speed Triage" className="hero-3d-img" style={{ objectFit: 'cover' }} />
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              right: '10px',
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(10px)',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700 }}>● SLA Target 99.4%</span>
            <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>CSAT: 4.96 ★</span>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Metrics Row */}
      <div className="metrics-grid">
        <MetricCard title="Assigned Tickets" value={totalAssigned} icon="🎯" color="blue" />
        <MetricCard title="Pending First Action" value={openCount} icon="⏳" color="yellow" />
        <MetricCard title="Active In-Progress" value={inProgressCount} icon="⚡" color="blue" />
        <MetricCard title="Resolved / Closed" value={resolvedCount} icon="✅" color="green" />
      </div>

      {/* Main Queue Card with Tabs & Direct Communication Actions */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.85rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Specialist Triage Queue</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              One-click customer messaging, status updates, and Tier-2 escalation
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search queue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '180px', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Filter Tab Chips */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All Assigned (${tickets.length})` },
            { id: 'OPEN', label: `🚨 Open (${openCount})` },
            { id: 'IN_PROGRESS', label: `⚡ In Progress (${inProgressCount})` },
            { id: 'ESCALATED', label: `🔥 Escalated (${escalatedCount})` },
            { id: 'RESOLVED', label: `✅ Resolved (${resolvedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`btn btn-sm ${filterTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔄</div>
            <p>Loading assigned queue...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-state" style={{ padding: '2.5rem 1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎉</div>
            <h3>No Tickets in this Queue View</h3>
            <p style={{ maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
              No tickets currently match the selected filter. Great job maintaining your queue!
            </p>
            <button onClick={handleCreateAgentSampleTicket} className="btn btn-primary btn-sm">
              <span>⚡</span> Generate Test Ticket
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer Profile</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Quick Lifecycle</th>
                  <th style={{ textAlign: 'right' }}>Specialist Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => {
                  const isEscalated = ticket.title?.includes('[ESCALATED]') || ticket.description?.includes('ESCALATION');

                  return (
                    <tr key={ticket.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{ticket.id}</td>
                      <td>
                        <strong style={{ color: 'var(--text-main)', display: 'block' }}>{ticket.customer?.name || 'Customer'}</strong>
                        <small style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>{ticket.customer?.email || 'N/A'}</small>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-secondary)', maxWidth: '240px' }}>
                        {isEscalated && (
                          <span className="badge badge-danger" style={{ fontSize: '0.65rem', marginRight: '0.35rem', padding: '0.1rem 0.4rem' }}>
                            🔥 ESCALATED
                          </span>
                        )}
                        {ticket.title}
                      </td>
                      <td>
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td>
                        <select
                          className="form-select"
                          style={{ width: 'auto', padding: '0.3rem 1.75rem 0.3rem 0.55rem', fontSize: '0.825rem' }}
                          value={ticket.status}
                          onChange={(e) => handleQuickStatusChange(ticket.id, e.target.value)}
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                          {/* Direct Quick Outreach Button */}
                          <button
                            type="button"
                            onClick={() => setQuickContactTicket(ticket)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#7dd3fc' }}
                            title="Send quick canned reply to customer"
                          >
                            💬 Message
                          </button>

                          {/* Escalate to Tier-2 Button */}
                          <button
                            type="button"
                            onClick={() => setEscalateTicket(ticket)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fda4af' }}
                            title="Report/Escalate issue you cannot solve"
                          >
                            🚨 Escalate
                          </button>

                          {/* Thread Link */}
                          <Link to={`/tickets/${ticket.id}`} className="btn btn-primary btn-sm" style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}>
                            Thread →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scrollable Agent Resolution Protocols */}
      <div className="scroll-section">
        <div className="section-heading">
          <div>
            <h2>🛡️ Specialist Protocols &amp; Communication Standards</h2>
            <p>Guidelines for exceptional customer care and fast problem resolution</p>
          </div>
        </div>

        <div className="guide-cards-grid">
          <div className="guide-card">
            <h3><span>💬</span> Empathetic Communication</h3>
            <p>
              Always acknowledge customer frustration, provide clear tracking timestamps, and avoid internal jargon.
            </p>
          </div>
          <div className="guide-card">
            <h3><span>🚨</span> When to Escalate to Tier-2</h3>
            <p>
              If an issue requires backend database scripts, code fixes, or policy exceptions, use the <strong>🚨 Escalate</strong> tool immediately.
            </p>
          </div>
          <div className="guide-card">
            <h3><span>⚡</span> First-Contact Resolution</h3>
            <p>
              Aim to provide full answers and solutions on the first reply to maintain our &lt; 15m resolution benchmark.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
