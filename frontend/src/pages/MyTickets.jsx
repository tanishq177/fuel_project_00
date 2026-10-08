import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ticketService from '../services/ticketService';
import StatusBadge from '../components/StatusBadge';

const MyTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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
      console.error('Failed to load tickets:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = filterStatus === 'ALL' || ticket.status === filterStatus;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      (ticket.title && ticket.title.toLowerCase().includes(query)) ||
      (ticket.id && ticket.id.toString().includes(query));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Support Tickets 📁</h1>
          <p className="page-subtitle">Search, filter, and monitor all your submitted customer inquiries.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/customer/dashboard" className="btn btn-secondary">
            ← Dashboard
          </Link>
          <Link to="/customer/create-ticket" className="btn btn-primary">
            <span>+</span> Create New Ticket
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1', minWidth: '260px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="🔍  Search by ticket subject, category, or ID #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status Filter:</label>
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '160px' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Statuses ({tickets.length})</option>
              <option value="OPEN">Open ({tickets.filter(t => t.status === 'OPEN').length})</option>
              <option value="IN_PROGRESS">In Progress ({tickets.filter(t => t.status === 'IN_PROGRESS').length})</option>
              <option value="RESOLVED">Resolved ({tickets.filter(t => t.status === 'RESOLVED').length})</option>
              <option value="CLOSED">Closed ({tickets.filter(t => t.status === 'CLOSED').length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            Matching Tickets <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 500 }}>({filteredTickets.length})</span>
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔄</div>
            <p>Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="empty-state" style={{ padding: '2.5rem 1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
            <h3>No Tickets Found</h3>
            <p style={{ maxWidth: '400px', margin: '0 auto 1.25rem auto', color: 'var(--text-muted)' }}>
              {searchQuery || filterStatus !== 'ALL'
                ? 'No tickets matched your search criteria or filter.'
                : 'You have not submitted any tickets yet.'}
            </p>
            {searchQuery || filterStatus !== 'ALL' ? (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setFilterStatus('ALL'); }}
                className="btn btn-secondary btn-sm"
              >
                Clear Search &amp; Filters
              </button>
            ) : (
              <Link to="/customer/create-ticket" className="btn btn-primary btn-sm">
                Create First Ticket
              </Link>
            )}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ticket Subject</th>
                  <th>Status</th>
                  <th>Assigned Specialist</th>
                  <th>Submitted On</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket) => (
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
                        <span style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '0.85rem' }}>Pending</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {new Date(ticket.createdDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/tickets/${ticket.id}`} className="btn btn-secondary btn-sm">
                        View Thread →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
