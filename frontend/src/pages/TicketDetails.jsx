import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ticketService from '../services/ticketService';
import adminService from '../services/adminService';
import StatusBadge from '../components/StatusBadge';

const TicketDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [newResponse, setNewResponse] = useState('');
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [newStatus, setNewStatus] = useState('');
  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');

  // Escalation Modal
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('Engineering Bug / Backend Service Outage');
  const [escalateNotes, setEscalateNotes] = useState('');
  const [submittingEscalation, setSubmittingEscalation] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assigningAgent, setAssigningAgent] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [modalMedia, setModalMedia] = useState(null); // For fullscreen image/video modal

  useEffect(() => {
    fetchTicketData();
    if (user?.role === 'ADMIN') {
      fetchAgents();
    }
  }, [id, user]);

  const fetchTicketData = async () => {
    try {
      setLoading(true);
      setError('');
      const ticketData = await ticketService.getTicketById(id);
      setTicket(ticketData);
      setNewStatus(ticketData.status);
      if (ticketData.assignedAgent) {
        setSelectedAgentId(ticketData.assignedAgent.id);
      }

      const responsesData = await ticketService.getResponses(id);
      setResponses(Array.isArray(responsesData) ? responsesData : []);
    } catch (err) {
      setError('Failed to fetch ticket details or ticket does not exist.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const userList = await adminService.getUsers();
      const agentList = userList.filter((u) => u.role === 'SUPPORT_AGENT');
      setAgents(agentList);
    } catch (err) {
      console.error('Failed to load agents list', err);
    }
  };

  // Helper to parse description into clean text & extracted media
  const parseDescriptionAndMedia = (rawDesc = '') => {
    const mediaList = [];
    const mediaRegex = /\[MEDIA_\d+:(IMAGE|VIDEO):(.*?)\]\s*([\s\S]*?)\s*\[\/MEDIA_\d+\]/g;
    let match;

    while ((match = mediaRegex.exec(rawDesc)) !== null) {
      mediaList.push({
        type: match[1], // 'IMAGE' or 'VIDEO'
        name: match[2],
        dataUrl: match[3].trim(),
      });
    }

    // Clean description without raw data URLs for clean reading
    const cleanText = rawDesc.replace(mediaRegex, '').trim();

    return { cleanText, mediaList };
  };

  const handleReplyFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (file.size > 15 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 15MB limit.`);
        return;
      }

      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        alert(`File "${file.name}" is not a supported image or video.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setReplyAttachments((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            name: file.name,
            isVideo,
            dataUrl: uploadEvent.target.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!newResponse.trim() && replyAttachments.length === 0) return;

    try {
      setSubmittingReply(true);
      setError('');

      let messagePayload = newResponse.trim();
      if (replyAttachments.length > 0) {
        messagePayload += `\n\n📎 ATTACHED MEDIA (${replyAttachments.length}):\n`;
        replyAttachments.forEach((att, idx) => {
          messagePayload += `[MEDIA_${idx + 1}:${att.isVideo ? 'VIDEO' : 'IMAGE'}:${att.name}]\n${att.dataUrl}\n[/MEDIA_${idx + 1}]\n`;
        });
      }

      const created = await ticketService.addResponse(id, {
        message: messagePayload,
        userId: user.id,
      });

      setResponses([...responses, created]);
      setNewResponse('');
      setReplyAttachments([]);
      setSuccessMsg('Response posted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to send response. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    try {
      setUpdatingStatus(true);
      setError('');
      const updated = await ticketService.updateStatus(id, newStatus);
      setTicket(updated);
      setSuccessMsg(`Status updated to ${newStatus}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to update ticket status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssignAgent = async (e) => {
    e.preventDefault();
    if (!selectedAgentId) return;

    try {
      setAssigningAgent(true);
      setError('');
      const updated = await adminService.assignAgent(id, selectedAgentId);
      setTicket(updated);
      setNewStatus(updated.status);
      setSuccessMsg('Support agent assigned successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError('Failed to assign agent.');
    } finally {
      setAssigningAgent(false);
    }
  };

  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!escalateNotes.trim()) return;

    setSubmittingEscalation(true);
    try {
      const payload = `🚨 [TIER-2 & ADMIN ESCALATION DISPATCH]\n` +
        `• Reported by Support Specialist: ${user.name} (${user.email})\n` +
        `• Reason: ${escalateReason}\n` +
        `• Diagnostic Findings:\n${escalateNotes.trim()}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      await ticketService.addResponse(id, {
        message: payload,
        userId: user.id,
      });

      await ticketService.updateStatus(id, 'IN_PROGRESS');

      setSuccessMsg('Ticket successfully escalated to Tier-2 Engineering / Admin!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowEscalateModal(false);
      setEscalateNotes('');
      fetchTicketData();
    } catch (err) {
      setError('Failed to submit escalation.');
    } finally {
      setSubmittingEscalation(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔄</div>
          <p>Loading ticket details &amp; conversation thread...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container" style={{ maxWidth: '600px', textAlign: 'center', padding: '4rem 1rem' }}>
        <div className="card">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Ticket Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            The requested ticket does not exist or may have been deleted.
          </p>
          <Link to="/" className="btn btn-secondary">
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isCustomer = user?.role === 'CUSTOMER';
  const isAgent = user?.role === 'SUPPORT_AGENT';
  const isAdmin = user?.role === 'ADMIN';

  // Strict Data Isolation Check: Customer can ONLY view their OWN tickets!
  if (isCustomer && ticket.customer && ticket.customer.id !== user.id) {
    return (
      <div className="container" style={{ maxWidth: '640px', padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="card" style={{ border: '1px solid rgba(244, 63, 94, 0.4)', background: 'linear-gradient(180deg, rgba(244, 63, 94, 0.08) 0%, rgba(17, 24, 39, 0.95) 100%)' }}>
          <div style={{ fontSize: '3.2rem', marginBottom: '1rem' }}>🔒</div>
          <h2 style={{ color: '#fda4af', marginBottom: '0.75rem', fontSize: '1.45rem', fontWeight: 800 }}>
            Access Restricted (Data Privacy)
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
            Ticket <strong>#{ticket.id}</strong> belongs to another customer account. For strict customer privacy and account isolation, you are only permitted to access tickets submitted under your own profile.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/customer/my-tickets" className="btn btn-primary">
              View My Own Tickets
            </Link>
            <Link to="/customer/dashboard" className="btn btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { cleanText: descText, mediaList: descMedia } = parseDescriptionAndMedia(ticket.description);

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      {/* Fullscreen Lightbox Modal for Images & Videos */}
      {modalMedia && (
        <div
          onClick={() => setModalMedia(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            cursor: 'pointer',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '85vh',
              background: '#0f172a',
              borderRadius: '16px',
              padding: '1rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.9)',
              border: '1px solid rgba(255,255,255,0.2)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setModalMedia(null)}
              style={{
                position: 'absolute',
                top: '-12px',
                right: '-12px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '1rem',
              }}
            >
              ✕
            </button>
            {modalMedia.type === 'VIDEO' ? (
              <video src={modalMedia.dataUrl} controls autoPlay style={{ maxWidth: '85vw', maxHeight: '75vh', borderRadius: '8px' }} />
            ) : (
              <img src={modalMedia.dataUrl} alt={modalMedia.name} style={{ maxWidth: '85vw', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px' }} />
            )}
            <div style={{ marginTop: '0.5rem', color: '#f8fafc', fontSize: '0.85rem', textAlign: 'center' }}>
              {modalMedia.name}
            </div>
          </div>
        </div>
      )}

      {/* Escalation Modal */}
      {showEscalateModal && (
        <div
          onClick={() => setShowEscalateModal(false)}
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
              border: '1px solid rgba(244, 63, 94, 0.5)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🚨</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>
                  Escalate to Tier-2 / Senior Engineering
                </h3>
              </div>
              <button
                onClick={() => setShowEscalateModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEscalateSubmit}>
              <div className="form-group">
                <label className="form-label">Escalation Reason</label>
                <select
                  className="form-select"
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                >
                  <option value="Engineering Bug / Backend Service Outage">⚡ Engineering Bug / Backend API Glitch</option>
                  <option value="Payment Gateway / Bank Transaction Failure">💳 Payment Gateway / Financial Dispute</option>
                  <option value="Warehouse / Carrier Shipment Exception">📦 Warehouse Fulfillment / Lost in Transit</option>
                  <option value="Security / Fraud / Policy Violation">🛡️ Account Security / Fraud Investigation</option>
                  <option value="Requires Management / Legal Authorization">⚖️ Requires Executive / Legal Approval</option>
                  <option value="Other Unresolvable Technical Edge Case">❓ Other Unresolvable Issue</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Diagnostic Findings &amp; Reason for Escalation</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Explain why this issue cannot be solved at Tier-1 and what engineering assistance is needed..."
                  value={escalateNotes}
                  onChange={(e) => setEscalateNotes(e.target.value)}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowEscalateModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" disabled={submittingEscalation || !escalateNotes.trim()}>
                  {submittingEscalation ? 'Dispatching Escalation...' : '🚨 Confirm Escalation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header with role-aware back navigation */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#60a5fa' }}>Ticket #{ticket.id}</span>
            <StatusBadge status={ticket.status} />
            {isAdmin && (
              <span className="badge badge-role" style={{ background: 'rgba(192, 132, 252, 0.2)', borderColor: '#c084fc', color: '#e9d5ff' }}>
                👑 Admin Full View
              </span>
            )}
            {isAgent && (
              <span className="badge badge-resolved" style={{ fontSize: '0.7rem' }}>
                🛠️ Support Specialist Console
              </span>
            )}
          </div>
          <h1 className="page-title" style={{ fontSize: '1.65rem' }}>{ticket.title}</h1>
        </div>

        <div>
          {isCustomer && (
            <Link to="/customer/my-tickets" className="btn btn-secondary">
              ← Back to My Tickets
            </Link>
          )}
          {isAgent && (
            <Link to="/agent/dashboard" className="btn btn-secondary">
              ← Back to Agent Queue
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin/dashboard" className="btn btn-secondary">
              ← Back to Admin Command Center
            </Link>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      {/* Ticket Details Summary Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
          Problem Description &amp; Customer Inquiry
        </h3>
        <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', color: 'var(--text-secondary)', fontSize: '0.975rem' }}>
          {descText}
        </p>

        {/* Attached Photos and Videos Gallery */}
        {descMedia.length > 0 && (
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>📸</span> Attached Media Files ({descMedia.length})
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {descMedia.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => setModalMedia(m)}
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}
                  title="Click to view full size"
                >
                  {m.type === 'VIDEO' ? (
                    <div style={{ position: 'relative', height: '110px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <video src={m.dataUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1rem' }}>
                        ▶
                      </div>
                    </div>
                  ) : (
                    <img src={m.dataUrl} alt={m.name} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: '0.45rem 0.65rem', fontSize: '0.75rem', color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    {m.type === 'VIDEO' ? '🎥 ' : '🖼️ '}
                    {m.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            fontSize: '0.875rem',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.2rem' }}>
              👤 Customer Profile
            </span>
            <strong style={{ color: 'var(--text-main)' }}>{ticket.customer?.name}</strong>
            <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
              <a href={`mailto:${ticket.customer?.email}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>
                ✉️ {ticket.customer?.email}
              </a>
            </div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.2rem' }}>
              🛠️ Assigned Specialist
            </span>
            {ticket.assignedAgent ? (
              <div>
                <strong style={{ color: '#34d399' }}>{ticket.assignedAgent.name}</strong>
                <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{ticket.assignedAgent.email}</div>
              </div>
            ) : (
              <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>Pending Assignment</span>
            )}
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.2rem' }}>
              🕒 Submitted Timestamp
            </span>
            <strong style={{ color: 'var(--text-secondary)' }}>{new Date(ticket.createdDate).toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Specialist & Admin Management Control Panel */}
      {(isAgent || isAdmin) && (
        <div className="card" style={{ background: 'rgba(22, 32, 51, 0.85)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <span>⚡</span> {isAdmin ? 'Executive Admin Override & Management' : 'Agent Action Console'}
            </h3>
            {isAgent && (
              <button
                type="button"
                onClick={() => setShowEscalateModal(true)}
                className="btn btn-secondary btn-sm"
                style={{ borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fda4af', fontSize: '0.8rem' }}
              >
                🚨 Escalate Unsolvable Issue to Tier-2
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Status Update Form */}
            <form onSubmit={handleStatusChange} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</label>
              <select
                className="form-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={{ width: 'auto', flex: 1 }}
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
              <button type="submit" className="btn btn-primary btn-sm" disabled={updatingStatus}>
                {updatingStatus ? 'Saving...' : 'Update Status'}
              </button>
            </form>

            {/* Admin Agent Reassignment Form */}
            {isAdmin && (
              <form onSubmit={handleAssignAgent} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Reassign:</label>
                <select
                  className="form-select"
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  style={{ width: 'auto', flex: 1 }}
                >
                  <option value="">-- Choose Specialist --</option>
                  {agents.map((ag) => (
                    <option key={ag.id} value={ag.id}>
                      {ag.name} ({ag.email})
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn btn-primary btn-sm" disabled={assigningAgent || !selectedAgentId}>
                  {assigningAgent ? 'Assigning...' : 'Reassign Specialist'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Conversation Thread / Responses */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            Discussion &amp; Activity Thread
          </h3>
          <span className="badge badge-role">{responses.length} Messages</span>
        </div>

        {responses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)' }}>
            <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>💬</div>
            <p style={{ fontStyle: 'italic' }}>No responses posted yet. Write a message below to start the conversation.</p>
          </div>
        ) : (
          <div className="thread-container">
            {responses.map((resp) => {
              const isAgentResp = resp.user?.role === 'SUPPORT_AGENT';
              const isAdminResp = resp.user?.role === 'ADMIN';
              const isEscalationNotice = resp.message?.includes('[TIER-2') || resp.message?.includes('ESCALATION');
              const { cleanText: respText, mediaList: respMedia } = parseDescriptionAndMedia(resp.message);

              return (
                <div
                  key={resp.id}
                  className={`thread-bubble ${isAdminResp ? 'agent-response' : isAgentResp ? 'agent-response' : 'customer-response'}`}
                  style={
                    isEscalationNotice
                      ? { borderColor: 'rgba(244, 63, 94, 0.6)', background: 'rgba(244, 63, 94, 0.1)' }
                      : isAdminResp
                      ? { borderColor: 'rgba(192, 132, 252, 0.4)', background: 'rgba(192, 132, 252, 0.06)' }
                      : {}
                  }
                >
                  <div className="thread-header">
                    <span className="thread-author">
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isEscalationNotice
                            ? 'rgba(244, 63, 94, 0.3)'
                            : isAdminResp
                            ? 'rgba(192, 132, 252, 0.25)'
                            : isAgentResp
                            ? 'rgba(16, 185, 129, 0.2)'
                            : 'rgba(59, 130, 246, 0.2)',
                          color: isEscalationNotice
                            ? '#fda4af'
                            : isAdminResp
                            ? '#c084fc'
                            : isAgentResp
                            ? '#34d399'
                            : '#60a5fa',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                      >
                        {isEscalationNotice ? '🚨' : resp.user?.name ? resp.user.name.charAt(0).toUpperCase() : '?'}
                      </span>
                      <span>{resp.user?.name}</span>
                      <span
                        className={`badge ${
                          isEscalationNotice
                            ? 'badge-danger'
                            : isAdminResp
                            ? 'badge-role'
                            : isAgentResp
                            ? 'badge-resolved'
                            : 'badge-open'
                        }`}
                        style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}
                      >
                        {isEscalationNotice
                          ? '🔥 Tier-2 Escalation'
                          : isAdminResp
                          ? '👑 Administrator'
                          : isAgentResp
                          ? 'Support Specialist'
                          : 'Customer'}
                      </span>
                    </span>
                    <span className="thread-time">{new Date(resp.responseDate).toLocaleString()}</span>
                  </div>

                  <div className="thread-body">{respText}</div>

                  {/* Render Response Attached Media */}
                  {respMedia.length > 0 && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {respMedia.map((rm, rIdx) => (
                        <div
                          key={rIdx}
                          onClick={() => setModalMedia(rm)}
                          style={{
                            cursor: 'pointer',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            background: '#0f172a',
                            width: '120px',
                            height: '80px',
                          }}
                        >
                          {rm.type === 'VIDEO' ? (
                            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                              <video src={rm.dataUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <div style={{ position: 'absolute', color: '#fff', fontSize: '0.85rem' }}>▶</div>
                            </div>
                          ) : (
                            <img src={rm.dataUrl} alt={rm.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Reply Submission Form with Photo/Video upload and Canned Response Presets */}
        <form onSubmit={handleSendResponse} style={{ marginTop: '2.25rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          {/* Canned Presets for Support Agents & Admins */}
          {(isAgent || isAdmin) && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.45rem' }}>
                ⚡ Specialist Quick Canned Presets:
              </label>
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setNewResponse(`Hello ${ticket.customer?.name || ''},\n\nWe are actively investigating this issue and coordinating with our engineering and carrier logistics specialists. We will provide an update within 2 hours.`)}
                  className="chip-btn"
                >
                  🔍 Investigating
                </button>
                <button
                  type="button"
                  onClick={() => setNewResponse(`Hello ${ticket.customer?.name || ''},\n\nCould you please attach additional screenshots or photos of the packaging/receipt so we can accelerate your replacement?`)}
                  className="chip-btn"
                >
                  📸 Request Photos
                </button>
                <button
                  type="button"
                  onClick={() => setNewResponse(`Hello ${ticket.customer?.name || ''},\n\nWe have verified your claim and initiated a full refund back to your original payment method. Please allow 3-5 business days for bank processing.`)}
                  className="chip-btn"
                >
                  💳 Refund Processed
                </button>
                <button
                  type="button"
                  onClick={() => setNewResponse(`Hello ${ticket.customer?.name || ''},\n\nYour replacement order has been successfully generated with expedited delivery. Tracking details will be emailed to you shortly.`)}
                  className="chip-btn"
                >
                  🔄 Replacement Dispatched
                </button>
                <button
                  type="button"
                  onClick={() => setNewResponse(`Hello ${ticket.customer?.name || ''},\n\nThis issue has been resolved per your request. Please let us know if there is anything else we can help you with!`)}
                  className="chip-btn"
                >
                  ✅ Issue Resolved
                </button>
              </div>
            </div>
          )}

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                <span>💬</span>
                <span>{isAdmin ? 'Post Executive Response' : isAgent ? 'Post Specialist Response' : 'Post a Reply'}</span>
              </label>

              {/* Attach File Button */}
              <label
                style={{
                  fontSize: '0.8rem',
                  color: '#60a5fa',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <span>📎 Attach Photo / Video</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleReplyFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <textarea
              className="form-control"
              rows={3}
              placeholder={isAdmin ? "Type administrator response or escalation note..." : isAgent ? "Type your customer reply or resolution details..." : "Write your reply or inquiry details here..."}
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
            ></textarea>

            {/* Reply Attachments Preview */}
            {replyAttachments.length > 0 && (
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {replyAttachments.map((f) => (
                  <div
                    key={f.id}
                    style={{
                      position: 'relative',
                      background: 'rgba(30, 41, 59, 0.9)',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '0.8rem',
                      color: '#f8fafc',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>{f.isVideo ? '🎥' : '🖼️'} {f.name}</span>
                    <button
                      type="button"
                      onClick={() => setReplyAttachments((prev) => prev.filter((a) => a.id !== f.id))}
                      style={{ background: 'transparent', border: 'none', color: '#fda4af', cursor: 'pointer', fontWeight: 700 }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-primary" disabled={submittingReply || (!newResponse.trim() && replyAttachments.length === 0)}>
            {submittingReply ? 'Posting Message...' : 'Send Message →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketDetails;
