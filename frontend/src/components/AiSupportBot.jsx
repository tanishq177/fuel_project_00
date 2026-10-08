import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import aiAvatarImg from '../assets/ai_avatar.jpg';

const AiSupportBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "👋 Hi there! I'm **Nova**, your 3D AI Support Specialist. How can I help you resolve an issue today?",
      action: null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // AI Knowledge & Problem Solving Rule Engine
  const generateAiResponse = (userText) => {
    const q = userText.toLowerCase();

    if (q.includes('password') || q.includes('reset') || q.includes('forgot') || q.includes('login')) {
      return {
        text: "🔑 **Password & Access Recovery**:\n1. If you're currently signed in, you can log out using the top-right button.\n2. For quick viva testing, you can use the **1-Click Demo Buttons** on the login page (Customer, Agent, or Admin).\n3. If you need a new account, head over to the Registration page.",
        action: { label: 'Go to Login Page', path: '/login' },
      };
    }

    if (q.includes('create') || q.includes('submit') || q.includes('new ticket') || q.includes('open ticket')) {
      return {
        text: "📝 **Submitting a New Support Ticket**:\n1. Click on **'+ Create Ticket'** in the navigation bar.\n2. Provide a clear, concise subject and detailed steps to reproduce.\n3. Your ticket will be automatically queued with status **OPEN** and assigned to a support specialist.",
        action: { label: '+ Create Ticket Now', path: '/customer/create-ticket' },
      };
    }

    if (q.includes('status') || q.includes('check') || q.includes('my ticket') || q.includes('progress') || q.includes('track')) {
      return {
        text: "🎫 **Ticket Status Lifecycle**:\n• **OPEN**: Ticket received & queued.\n• **IN_PROGRESS**: Specialist is investigating and working on your resolution.\n• **RESOLVED**: Fix deployed or response provided.\n• **CLOSED**: Issue completed and finalized.\n\nYou can track all your tickets in real-time under **My Tickets**.",
        action: { label: 'View My Tickets', path: '/customer/my-tickets' },
      };
    }

    if (q.includes('invoice') || q.includes('billing') || q.includes('download') || q.includes('pdf')) {
      return {
        text: "📄 **Billing & Invoice Troubleshooting**:\n1. Check if pop-ups are allowed in your browser settings.\n2. Ensure your internet connection is active.\n3. If the invoice generation fails repeatedly, open a ticket with subject *'Billing Invoice Error'* so our finance team can assist you directly.",
        action: { label: 'Open Billing Ticket', path: '/customer/create-ticket' },
      };
    }

    if (q.includes('agent') || q.includes('human') || q.includes('specialist') || q.includes('talk') || q.includes('escalat')) {
      return {
        text: "🧑‍💻 **Connecting with a Support Agent**:\n• Our specialists review tickets in order of priority with an average SLA response time of **under 15 minutes**.\n• Once an agent is assigned, you can message them directly in the ticket's conversation thread!",
        action: { label: 'Check Ticket Threads', path: '/customer/my-tickets' },
      };
    }

    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      return {
        text: "Hello! 😊 I can help you check ticket statuses, troubleshoot common account problems, guide you through submitting issues, or connect you with specialists. What's on your mind?",
        action: null,
      };
    }

    // Default intelligent problem solver
    return {
      text: `💡 **Troubleshooting Guidance**:\nI understand you need assistance with: *"${userText}"*.\n\nHere are standard steps you can take:\n1. Open a new support ticket with detailed steps so a specialized agent can investigate.\n2. Include any error codes or screenshots in your description.\n3. Check your **My Tickets** tab for live updates from agents.`,
      action: { label: 'Submit a Support Ticket', path: '/customer/create-ticket' },
    };
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking and typing response
    setTimeout(() => {
      const reply = generateAiResponse(text);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: reply.text,
        action: reply.action,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 650);
  };

  const handleActionClick = (path) => {
    if (path) {
      navigate(path);
      setIsOpen(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: "✨ Chat cleared. How can I assist you with your helpdesk queries?",
        action: null,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating 3D AI Assistant Trigger Button */}
      <div
        className="ai-bot-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        {!isOpen && (
          <div
            style={{
              background: 'rgba(17, 24, 39, 0.92)',
              backdropFilter: 'blur(14px)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '9999px',
              padding: '0.5rem 1rem',
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.6), 0 0 15px rgba(56, 189, 248, 0.3)',
              color: '#f8fafc',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'pulseGlow 2.5s infinite',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
            <span>Ask Nova AI</span>
          </div>
        )}

        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7), 0 0 25px rgba(59, 130, 246, 0.6)',
            border: '2px solid rgba(56, 189, 248, 0.8)',
            transform: isOpen ? 'scale(0.95)' : 'scale(1)',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <img
            src={aiAvatarImg}
            alt="3D AI Support Assistant"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Expandable Glassmorphism 3D Chat Modal */}
      {isOpen && (
        <div
          className="ai-chat-window"
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            width: '400px',
            maxWidth: 'calc(100vw - 48px)',
            height: '560px',
            maxHeight: 'calc(100vh - 140px)',
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '20px',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.85), 0 0 35px rgba(59, 130, 246, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9998,
            overflow: 'hidden',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '1.5px solid #38bdf8',
                  boxShadow: '0 0 10px rgba(56, 189, 248, 0.4)',
                }}
              >
                <img src={aiAvatarImg} alt="Nova AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>Nova 3D AI</span>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(56, 189, 248, 0.2)', color: '#7dd3fc', padding: '0.1rem 0.45rem', borderRadius: '9999px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>BOT</span>
                </h4>
                <div style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }}></span>
                  Active Problem Solver
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                onClick={clearChat}
                title="Clear Chat History"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  padding: '0.3rem',
                }}
              >
                🗑️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Problem Suggestion Chips */}
          <div
            style={{
              padding: '0.65rem 1rem',
              background: 'rgba(11, 15, 25, 0.6)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              gap: '0.45rem',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            <button onClick={() => handleSendMessage('How to reset password')} className="chip-btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
              🔑 Password
            </button>
            <button onClick={() => handleSendMessage('Check my ticket status')} className="chip-btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
              🎫 Statuses
            </button>
            <button onClick={() => handleSendMessage('Invoice download error')} className="chip-btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
              📄 Invoice
            </button>
            <button onClick={() => handleSendMessage('Talk to support agent')} className="chip-btn" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
              🧑‍💻 Agents
            </button>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              padding: '1.25rem 1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '0.85rem 1.05rem',
                    borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background:
                      msg.sender === 'user'
                        ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
                        : 'rgba(30, 41, 59, 0.75)',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    border: msg.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.text}

                  {msg.action && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
                      <button
                        onClick={() => handleActionClick(msg.action.path)}
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                      >
                        {msg.action.label} →
                      </button>
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.25rem', padding: '0 0.4rem' }}>
                  {msg.time}
                </span>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.85rem', background: 'rgba(30, 41, 59, 0.6)', borderRadius: '12px', width: 'fit-content' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', animation: 'pulseDot 1s infinite' }}></span>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8', animation: 'pulseDot 1s infinite 0.2s' }}></span>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c084fc', animation: 'pulseDot 1s infinite 0.4s' }}></span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>Nova is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(11, 15, 25, 0.85)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <input
              type="text"
              className="form-control"
              placeholder="Ask a question or describe an issue..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              style={{ padding: '0.55rem 0.85rem', fontSize: '0.875rem' }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!inputMessage.trim() || isTyping}
              style={{ padding: '0.55rem 0.95rem' }}
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AiSupportBot;
