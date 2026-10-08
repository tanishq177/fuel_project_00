import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ticketService from '../services/ticketService';

const CreateTicket = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form States - General Purpose
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Order, Shipping & Delivery');
  const [priority, setPriority] = useState('Medium');
  const [orderReference, setOrderReference] = useState('');
  const [devicePlatform, setDevicePlatform] = useState('Web Browser (Chrome/Safari)');
  const [contactPreference, setContactPreference] = useState('Email Notification');

  // Media Attachments (Images & Videos)
  const [attachments, setAttachments] = useState([]);
  const [uploadError, setUploadError] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // File Upload Handler (Images & Videos)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadError('');

    files.forEach((file) => {
      // Limit file size to 15MB for responsive local storage/transmission
      if (file.size > 15 * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds the 15MB limit.`);
        return;
      }

      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        setUploadError(`File "${file.name}" is not a supported image or video.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setAttachments((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            name: file.name,
            type: file.type,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            isVideo,
            dataUrl: uploadEvent.target.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be re-selected if needed
    e.target.value = '';
  };

  const handleRemoveAttachment = (id) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Build a rich structured description payload preserving backend compatibility
      let fullDescription = description.trim();

      // Append Structured Metadata Block
      fullDescription += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📌 CUSTOMER TICKET & SERVICE DETAILS\n`;
      fullDescription += `• Issue Category: ${category}\n`;
      fullDescription += `• Urgency / Priority: ${priority.toUpperCase()}\n`;
      fullDescription += `• Platform / Device Used: ${devicePlatform}\n`;
      fullDescription += `• Preferred Contact Method: ${contactPreference}\n`;

      if (orderReference.trim()) {
        fullDescription += `• Order / Customer Reference ID: ${orderReference.trim()}\n`;
      }

      if (attachments.length > 0) {
        fullDescription += `\n📎 ATTACHED MEDIA FILES (${attachments.length}):\n`;
        attachments.forEach((att, idx) => {
          fullDescription += `[MEDIA_${idx + 1}:${att.isVideo ? 'VIDEO' : 'IMAGE'}:${att.name}]\n${att.dataUrl}\n[/MEDIA_${idx + 1}]\n`;
        });
      }

      fullDescription += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

      // Prefix title with priority and category for easy specialist scanning
      const formattedTitle = `[${priority}] [${category}] ${title.trim()}`;

      const newTicket = await ticketService.createTicket({
        title: formattedTitle,
        description: fullDescription,
        customerId: user.id,
      });

      // Redirect directly to newly created ticket view
      navigate(`/tickets/${newTicket.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit ticket. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1180px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Submit Support Ticket 📝</h1>
          <p className="page-subtitle">Need help with an order, account, product, or service? Fill out the form and attach screenshots or videos.</p>
        </div>
        <Link to="/customer/my-tickets" className="btn btn-secondary">
          ← Back to My Tickets
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '2rem', alignItems: 'start' }}>
        {/* Main Ticket Creation Form */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Category & Device Platform Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.35rem' }}>
              <div>
                <label className="form-label">What can we help you with? (Category)</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="Order, Shipping & Delivery">📦 Order, Shipping &amp; Delivery</option>
                  <option value="Billing, Invoices & Refunds">💳 Billing, Invoices &amp; Refunds</option>
                  <option value="Account, Password & Profile">👤 Account, Password &amp; Profile</option>
                  <option value="Product Defect / Item Issue">🛠️ Product Defect / Not Working</option>
                  <option value="Return, Exchange & Warranty">🔄 Returns, Exchanges &amp; Warranty</option>
                  <option value="App & Website Technical Help">📱 App / Website Technical Issue</option>
                  <option value="General Customer Service">❓ General Inquiry &amp; Feedback</option>
                </select>
              </div>

              <div>
                <label className="form-label">Device or Platform Used</label>
                <select
                  className="form-select"
                  value={devicePlatform}
                  onChange={(e) => setDevicePlatform(e.target.value)}
                >
                  <option value="Web Browser (Chrome/Safari)">🌐 Web Browser (Chrome / Safari / Edge)</option>
                  <option value="iPhone / iOS App">📱 iPhone / iOS App</option>
                  <option value="Android Mobile App">🤖 Android Smartphone / Tablet</option>
                  <option value="Windows PC / Laptop">💻 Windows PC / Laptop</option>
                  <option value="Mac / Apple Computer">🍏 Mac / Apple Computer</option>
                  <option value="Other Device">📺 Other / Smart Device</option>
                </select>
              </div>
            </div>

            {/* Urgency / Priority Pill Selector */}
            <div className="form-group">
              <label className="form-label">How urgent is this issue?</label>
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                {[
                  { level: 'Low', label: '🟢 Low Priority', sla: 'Response < 24h' },
                  { level: 'Medium', label: '🟡 Medium', sla: 'Response < 8h' },
                  { level: 'High', label: '🟠 High Urgency', sla: 'Response < 2h' },
                  { level: 'Critical', label: '🔴 Urgent / Emergency', sla: 'Response < 30m' },
                ].map((p) => {
                  const isSelected = priority === p.level;
                  return (
                    <button
                      key={p.level}
                      type="button"
                      onClick={() => setPriority(p.level)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        border: isSelected ? '1px solid #3b82f6' : '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                        color: isSelected ? '#93c5fd' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 0 15px rgba(59, 130, 246, 0.3)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                      }}
                    >
                      <span>{p.label}</span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.65, fontWeight: 500 }}>({p.sla})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title / Subject */}
            <div className="form-group">
              <label className="form-label">Ticket Subject / Summary</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Package marked delivered but not received / Payment charged twice"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <small style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.35rem', display: 'block' }}>
                Briefly summarize the issue in one short sentence.
              </small>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Detailed Description</label>
              <textarea
                className="form-control"
                rows={5}
                placeholder="Please describe what happened in detail, any error messages you received, or what resolution you are looking for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Order Reference & Contact Preference */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.35rem' }}>
              <div>
                <label className="form-label">Order ID / Account Number (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. ORD-98432 or ACC-1049"
                  value={orderReference}
                  onChange={(e) => setOrderReference(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Preferred Response Channel</label>
                <select
                  className="form-select"
                  value={contactPreference}
                  onChange={(e) => setContactPreference(e.target.value)}
                >
                  <option value="Email Notification">📧 Email Notification</option>
                  <option value="Phone Call Callback">📞 Phone Callback</option>
                  <option value="In-App Discussion Thread">💬 In-App Ticket Thread</option>
                  <option value="WhatsApp Support">📱 WhatsApp Message</option>
                </select>
              </div>
            </div>

            {/* Image & Video Upload Section */}
            <div
              className="form-group"
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '1.5rem',
                borderRadius: '14px',
                border: '1px dashed rgba(56, 189, 248, 0.4)',
                marginTop: '1.5rem',
              }}
            >
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontSize: '0.95rem' }}>
                <span>📸</span> Attach Images or Videos (Screenshots, Product Photos, Screen Recordings)
              </label>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Upload photos of defects, receipt screenshots, or short video screen recordings (MP4, PNG, JPG, WebM up to 15MB each).
              </p>

              {uploadError && <div className="alert alert-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>{uploadError}</div>}

              {/* Upload Button */}
              <label
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.875rem',
                }}
              >
                <span>📁</span> Select Photos or Video Files
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>

              {/* Preview Gallery */}
              {attachments.length > 0 && (
                <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
                  {attachments.map((file) => (
                    <div
                      key={file.id}
                      style={{
                        position: 'relative',
                        background: 'rgba(30, 41, 59, 0.8)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                      }}
                    >
                      {file.isVideo ? (
                        <video
                          src={file.dataUrl}
                          style={{ width: '100%', height: '90px', objectFit: 'cover' }}
                          controls={false}
                        />
                      ) : (
                        <img
                          src={file.dataUrl}
                          alt={file.name}
                          style={{ width: '100%', height: '90px', objectFit: 'cover' }}
                        />
                      )}

                      <div style={{ padding: '0.4rem 0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#f8fafc', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {file.isVideo ? '🎥 ' : '🖼️ '}
                          {file.name}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{file.size}</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(file.id)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(0, 0, 0, 0.75)',
                          color: '#fda4af',
                          border: 'none',
                          borderRadius: '50%',
                          width: '22px',
                          height: '22px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                        }}
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.75rem 1.75rem' }}>
                {loading ? 'Submitting Ticket...' : 'Submit Customer Ticket →'}
              </button>
              <Link to="/customer/dashboard" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Right Sidebar: Direct Contact Channels & Instant Help */}
        <div>
          {/* Direct Support Channels Card */}
          <div className="card" style={{ border: '1px solid rgba(56, 189, 248, 0.3)', background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(56, 189, 248, 0.15)', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700, color: '#7dd3fc', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              ⚡ 24/7 Support Channels
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>How to Reach Us</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Our dedicated customer support specialists are ready to help you across multiple channels.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '1.4rem' }}>🤖</span>
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: '0.9rem', display: 'block' }}>Nova 3D AI Assistant</strong>
                  <span style={{ color: '#34d399', fontSize: '0.75rem' }}>Instant Answers &amp; Guidance (Bottom Right)</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '1.4rem' }}>📧</span>
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: '0.9rem', display: 'block' }}>Customer Help Desk</strong>
                  <a href="mailto:support@helpdesk.cloud" style={{ color: '#60a5fa', fontSize: '0.8rem', textDecoration: 'none' }}>
                    support@helpdesk.cloud
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '1.4rem' }}>📞</span>
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: '0.9rem', display: 'block' }}>Toll-Free Hotline</strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>+1 (800) 555-HELP</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '1.4rem' }}>🕒</span>
                <div>
                  <strong style={{ color: '#f8fafc', fontSize: '0.9rem', display: 'block' }}>Support Hours &amp; SLA</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>24/7 Coverage • Average Response &lt; 15 mins</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Helpful Customer Tips */}
          <div className="card" style={{ background: 'rgba(15, 23, 42, 0.7)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>💡</span> Tips for Faster Resolutions
            </h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              <li>Attach a clear <strong>photo or screenshot</strong> of the issue.</li>
              <li>Include your <strong>Order or Account ID</strong> if applicable.</li>
              <li>You can chat with your assigned agent inside the ticket thread.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;
