import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../services/adminService';
import ticketService from '../services/ticketService';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import analyticsImg from '../assets/analytics_3d.jpg';

const AdminDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  // Navigation Tabs: 'all_tickets' | 'users' | 'workload' | 'telemetry'
  const [activeTab, setActiveTab] = useState('all_tickets');
  
  // Filters for Omniscient Ticket View
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterAgent, setFilterAgent] = useState('ALL');
  const [filterCustomer, setFilterCustomer] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filters for User Directory
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [creatingSample, setCreatingSample] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [ticketsData, usersData] = await Promise.all([
        adminService.getAllTickets(),
        adminService.getUsers(),
      ]);

      const tList = Array.isArray(ticketsData) ? ticketsData : [];
      const uList = Array.isArray(usersData) ? usersData : [];

      setTickets(tList);
      setUsers(uList);
      setAgents(uList.filter((u) => u.role === 'SUPPORT_AGENT'));
      setCustomers(uList.filter((u) => u.role === 'CUSTOMER'));
    } catch (err) {
      console.error('Failed to fetch admin omniscient data:', err);
      setError('Unable to load full system data from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAgent = async (ticketId, agentId) => {
    if (!agentId) return;
    try {
      await adminService.assignAgent(ticketId, agentId);
      setSuccessMsg(`Ticket #${ticketId} assigned successfully!`);
      fetchDashboardData();
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      alert('Failed to assign specialist.');
    }
  };

  const handleQuickStatusChange = async (ticketId, status) => {
    try {
      await ticketService.updateStatus(ticketId, status);
      setSuccessMsg(`Ticket #${ticketId} status updated to ${status}`);
      fetchDashboardData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleCreateSystemSampleTicket = async () => {
    setCreatingSample(true);
    try {
      const targetCustomer = customers.length > 0 ? customers[0] : (users[0] || { id: 1 });
      const created = await ticketService.createTicket({
        title: `[High] [Order & Billing] System Audit Ticket #${Math.floor(1000 + Math.random() * 9000)}`,
        description: `Executive administrator test ticket for live platform triage verification.\n• Customer ID: ${targetCustomer.id}\n• Security Clearance: Admin Superuser\n• Status: OPEN`,
        customerId: targetCustomer.id,
      });

      setSuccessMsg(`Sample ticket #${created.id} generated!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to create sample ticket:', err);
    } finally {
      setCreatingSample(false);
    }
  };

  // Metrics Calculations
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === 'OPEN').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const totalUsers = users.length;
  const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 100;

  // Filtered Tickets for Admin Omniscient Table
  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = filterStatus === 'ALL' || ticket.status === filterStatus;
    
    let matchesAgent = true;
    if (filterAgent === 'UNASSIGNED') {
      matchesAgent = !ticket.assignedAgent;
    } else if (filterAgent !== 'ALL') {
      matchesAgent = ticket.assignedAgent && ticket.assignedAgent.id.toString() === filterAgent;
    }

    let matchesCustomer = true;
    if (filterCustomer !== 'ALL') {
      matchesCustomer = ticket.customer && ticket.customer.id.toString() === filterCustomer;
    }

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (ticket.title && ticket.title.toLowerCase().includes(query)) ||
      (ticket.id && ticket.id.toString().includes(query)) ||
      (ticket.customer && ticket.customer.name.toLowerCase().includes(query)) ||
      (ticket.customer && ticket.customer.email.toLowerCase().includes(query)) ||
      (ticket.assignedAgent && ticket.assignedAgent.name.toLowerCase().includes(query));

    return matchesStatus && matchesAgent && matchesCustomer && matchesSearch;
  });

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    const query = userSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.id.toString().includes(query);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="container">
      {/* 3D Hero Banner for Admin Omniscient Command Center */}
      <div className="hero-3d-card" style={{ gridTemplateColumns: '1.3fr 0.7fr' }}>
        <div className="hero-3d-glow"></div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-3d-tag" style={{ background: 'rgba(192, 132, 252, 0.15)', borderColor: 'rgba(192, 132, 252, 0.4)', color: '#e9d5ff' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c084fc', boxShadow: '0 0 8px #c084fc' }}></span>
            Executive Omniscient Command Center
          </div>
          <h1 className="hero-3d-title">Full Platform System Control</h1>
          <p className="hero-3d-desc">
            You have full omniscient visibility into all <strong style={{ color: '#60a5fa' }}>{totalTickets} tickets</strong>, <strong style={{ color: '#34d399' }}>{customers.length} customer profiles</strong>, and <strong style={{ color: '#c084fc' }}>{agents.length} support specialists</strong>. Reassign queues, audit discussion threads, and oversee operations.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="user-badge" style={{ padding: '0.5rem 1rem' }}>
              <span>Specialists: {agents.length} Active</span>
            </span>
            <span className="user-badge" style={{ padding: '0.5rem 1rem', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <span>Total Workload: {totalTickets} Tickets</span>
            </span>
            <button
              onClick={handleCreateSystemSampleTicket}
              disabled={creatingSample}
              className="btn btn-secondary btn-sm"
              style={{ borderColor: 'rgba(192, 132, 252, 0.4)', background: 'rgba(192, 132, 252, 0.12)', color: '#e9d5ff' }}
            >
              <span>⚡</span> {creatingSample ? 'Creating...' : '+ Generate Test Ticket'}
            </button>
          </div>
        </div>

        <div className="hero-3d-img-container" style={{ maxHeight: '200px' }}>
          <img src={analyticsImg} alt="Platform Analytics" className="hero-3d-img" style={{ objectFit: 'cover' }} />
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              right: '10px',
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(10px)',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 700 }}>● Omniscient View Active</span>
            <span style={{ fontSize: '0.75rem', color: '#34d399' }}>Resolution: {resolutionRate}%</span>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMsg && (
        <div className="alert alert-success" style={{ position: 'sticky', top: '80px', zIndex: 90 }}>
          <span>✨ {successMsg}</span>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: '#6ee7b7', cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Top Telemetry Metrics Row */}
      <div className="metrics-grid">
        <MetricCard title="Total System Tickets" value={totalTickets} icon="📊" color="blue" />
        <MetricCard title="Unassigned / Open" value={openTickets} icon="🚨" color="yellow" />
        <MetricCard title="Active In-Progress" value={inProgressTickets} icon="⚡" color="blue" />
        <MetricCard title="Registered Accounts" value={totalUsers} icon="👥" color="green" />
      </div>

      {/* Master Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className={`btn ${activeTab === 'all_tickets' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('all_tickets')}
        >
          🎫 All Tickets &amp; Live Queue ({tickets.length})
        </button>
        <button
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          👥 User Directory &amp; Roles ({users.length})
        </button>
        <button
          className={`btn ${activeTab === 'workload' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('workload')}
        >
          ⚖️ Specialist Workload Balancing ({agents.length})
        </button>
      </div>

      {/* ===================================================================
         TAB 1: ALL TICKETS OMNISCIENT CONTROL
         =================================================================== */}
      {activeTab === 'all_tickets' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.35rem', flexWrap: 'wrap', gap: '0.85rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Omniscient System Ticket Queue</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Complete oversight of all customer inquiries, agent assignments, and status transitions
              </p>
            </div>
            <button
              onClick={handleCreateSystemSampleTicket}
              disabled={creatingSample}
              className="btn btn-secondary btn-sm"
            >
              + Quick System Ticket
            </button>
          </div>

          {/* Multi-Filter Bar */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.65)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              marginBottom: '1.35rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.85rem',
              alignItems: 'center',
            }}
          >
            {/* Search Input */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                Search Query
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Search ID, title, customer, agent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              />
            </div>

            {/* Filter by Status */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                Status Filter
              </label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: '0.45rem 1.75rem 0.45rem 0.75rem', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Statuses ({tickets.length})</option>
                <option value="OPEN">OPEN ({tickets.filter((t) => t.status === 'OPEN').length})</option>
                <option value="IN_PROGRESS">IN_PROGRESS ({tickets.filter((t) => t.status === 'IN_PROGRESS').length})</option>
                <option value="RESOLVED">RESOLVED ({tickets.filter((t) => t.status === 'RESOLVED').length})</option>
                <option value="CLOSED">CLOSED ({tickets.filter((t) => t.status === 'CLOSED').length})</option>
              </select>
            </div>

            {/* Filter by Specialist */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                Specialist Filter
              </label>
              <select
                className="form-select"
                value={filterAgent}
                onChange={(e) => setFilterAgent(e.target.value)}
                style={{ padding: '0.45rem 1.75rem 0.45rem 0.75rem', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Specialists</option>
                <option value="UNASSIGNED">Unassigned Only ({tickets.filter((t) => !t.assignedAgent).length})</option>
                {agents.map((ag) => (
                  <option key={ag.id} value={ag.id.toString()}>
                    {ag.name} ({tickets.filter((t) => t.assignedAgent?.id === ag.id).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Customer */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                Customer Filter
              </label>
              <select
                className="form-select"
                value={filterCustomer}
                onChange={(e) => setFilterCustomer(e.target.value)}
                style={{ padding: '0.45rem 1.75rem 0.45rem 0.75rem', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Customers ({customers.length})</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.name} ({tickets.filter((t) => t.customer?.id === c.id).length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🔄</div>
              <p>Loading all platform tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="empty-state" style={{ padding: '2.5rem 1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
              <h3>No Tickets Found</h3>
              <p style={{ maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
                {searchQuery || filterStatus !== 'ALL' || filterAgent !== 'ALL' || filterCustomer !== 'ALL'
                  ? 'No tickets match the selected filters.'
                  : 'There are no support tickets in the database yet.'}
              </p>
              {searchQuery || filterStatus !== 'ALL' || filterAgent !== 'ALL' || filterCustomer !== 'ALL' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('ALL');
                    setFilterAgent('ALL');
                    setFilterCustomer('ALL');
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Reset All Filters
                </button>
              ) : (
                <button onClick={handleCreateSystemSampleTicket} className="btn btn-primary btn-sm">
                  <span>⚡</span> Generate Test Ticket
                </button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer Details</th>
                    <th>Ticket Title</th>
                    <th>Status</th>
                    <th>Assign Specialist</th>
                    <th>Quick Status</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'right' }}>Audit Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{ticket.id}</td>
                      <td>
                        <strong style={{ color: 'var(--text-main)', display: 'block' }}>{ticket.customer?.name || 'Customer'}</strong>
                        <small style={{ color: 'var(--text-dim)', fontSize: '0.78rem' }}>{ticket.customer?.email || 'N/A'}</small>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-secondary)', maxWidth: '280px' }}>
                        {ticket.title}
                      </td>
                      <td>
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td>
                        <select
                          className="form-select"
                          style={{ width: 'auto', minWidth: '160px', padding: '0.3rem 1.75rem 0.3rem 0.6rem', fontSize: '0.825rem' }}
                          value={ticket.assignedAgent ? ticket.assignedAgent.id : ''}
                          onChange={(e) => handleAssignAgent(ticket.id, e.target.value)}
                        >
                          <option value="">-- Unassigned --</option>
                          {agents.map((ag) => (
                            <option key={ag.id} value={ag.id}>
                              {ag.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          className="form-select"
                          style={{ width: 'auto', minWidth: '130px', padding: '0.3rem 1.75rem 0.3rem 0.6rem', fontSize: '0.825rem' }}
                          value={ticket.status}
                          onChange={(e) => handleQuickStatusChange(ticket.id, e.target.value)}
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                        {new Date(ticket.createdDate).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/tickets/${ticket.id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.75rem' }}>
                          Full Audit →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================
         TAB 2: COMPREHENSIVE USER DIRECTORY
         =================================================================== */}
      {activeTab === 'users' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Registered User Directory</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                All customer accounts, support specialists, and platform administrators
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Search users..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                style={{ width: '220px', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              />
              <select
                className="form-select"
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                style={{ width: 'auto', padding: '0.45rem 1.75rem 0.45rem 0.75rem', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Roles ({users.length})</option>
                <option value="CUSTOMER">Customers ({customers.length})</option>
                <option value="SUPPORT_AGENT">Support Agents ({agents.length})</option>
                <option value="ADMIN">Admins ({users.filter((u) => u.role === 'ADMIN').length})</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔄</div>
              <p>Loading user directory...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Role Clearance</th>
                    <th>Tickets Associated</th>
                    <th style={{ textAlign: 'right' }}>Quick Filter</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => {
                    const userTickets =
                      u.role === 'CUSTOMER'
                        ? tickets.filter((t) => t.customer?.id === u.id)
                        : u.role === 'SUPPORT_AGENT'
                        ? tickets.filter((t) => t.assignedAgent?.id === u.id)
                        : tickets;

                    return (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>#{u.id}</td>
                        <td>
                          <strong style={{ color: 'var(--text-main)' }}>{u.name}</strong>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'ADMIN' ? 'badge-role' : u.role === 'SUPPORT_AGENT' ? 'badge-resolved' : 'badge-open'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {u.role === 'CUSTOMER' ? `${userTickets.length} Submitted` : u.role === 'SUPPORT_AGENT' ? `${userTickets.length} Assigned` : 'Global Access'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {u.role === 'CUSTOMER' && (
                            <button
                              onClick={() => {
                                setFilterCustomer(u.id.toString());
                                setActiveTab('all_tickets');
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
                            >
                              View Tickets ({userTickets.length})
                            </button>
                          )}
                          {u.role === 'SUPPORT_AGENT' && (
                            <button
                              onClick={() => {
                                setFilterAgent(u.id.toString());
                                setActiveTab('all_tickets');
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}
                            >
                              View Queue ({userTickets.length})
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================
         TAB 3: SPECIALIST WORKLOAD BALANCING
         =================================================================== */}
      {activeTab === 'workload' && (
        <div className="card">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Support Specialist Workload &amp; Distribution</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Monitor agent bandwidth and ensure equitable ticket queue allocation
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {agents.map((ag) => {
              const assigned = tickets.filter((t) => t.assignedAgent?.id === ag.id);
              const activeCount = assigned.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
              const resolvedCount = assigned.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
              const capacityPercentage = Math.min(Math.round((activeCount / 5) * 100), 100);

              return (
                <div
                  key={ag.id}
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }}></span>
                        <strong style={{ color: '#f8fafc', fontSize: '1rem' }}>{ag.name}</strong>
                      </div>
                      <span className="badge badge-resolved" style={{ fontSize: '0.7rem' }}>Specialist</span>
                    </div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '1rem' }}>{ag.email}</div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                      <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <span style={{ fontSize: '0.7rem', color: '#93c5fd', display: 'block' }}>Active Queue</span>
                        <strong style={{ color: '#60a5fa', fontSize: '1.1rem' }}>{activeCount}</strong>
                      </div>
                      <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <span style={{ fontSize: '0.7rem', color: '#6ee7b7', display: 'block' }}>Resolved</span>
                        <strong style={{ color: '#34d399', fontSize: '1.1rem' }}>{resolvedCount}</strong>
                      </div>
                    </div>

                    {/* Bandwidth bar */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        <span>Queue Capacity</span>
                        <span>{activeCount} / 5 target</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${capacityPercentage}%`,
                            height: '100%',
                            background: activeCount > 4 ? '#f43f5e' : activeCount > 2 ? '#fbbf24' : '#34d399',
                            borderRadius: '3px',
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setFilterAgent(ag.id.toString());
                      setActiveTab('all_tickets');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', fontSize: '0.8rem' }}
                  >
                    View Agent's Full Queue ({assigned.length}) →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scrollable Admin Governance Card */}
      <div className="scroll-section">
        <div className="section-heading">
          <div>
            <h2>⚙️ System Governance &amp; Workload Protocols</h2>
            <p>Executive admin controls, privacy guarantees, and audit recommendations</p>
          </div>
        </div>

        <div className="guide-cards-grid">
          <div className="guide-card">
            <h3><span>⚖️</span> Workload Balancing</h3>
            <p>
              Ensure all open tickets are allocated evenly across active support agents to prevent triage bottlenecks and SLA delays.
            </p>
          </div>
          <div className="guide-card">
            <h3><span>🛡️</span> Data Isolation &amp; Privacy</h3>
            <p>
              Customers only have access to their own tickets, while administrators hold full platform-wide audit visibility.
            </p>
          </div>
          <div className="guide-card">
            <h3><span>📈</span> Telemetry &amp; Uptime</h3>
            <p>
              Server instances and REST endpoint health are actively monitored for sub-second database response times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
