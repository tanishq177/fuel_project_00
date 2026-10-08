import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AiSupportBot from './components/AiSupportBot';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import CreateTicket from './pages/CreateTicket';
import MyTickets from './pages/MyTickets';
import TicketDetails from './pages/TicketDetails';
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Smart Home Redirector based on logged-in user role
const HomeRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'SUPPORT_AGENT') return <Navigate to="/agent/dashboard" replace />;
  return <Navigate to="/customer/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Default Index Route */}
              <Route path="/" element={<HomeRedirect />} />

              {/* Customer Routes */}
              <Route
                path="/customer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/create-ticket"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <CreateTicket />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/my-tickets"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER']}>
                    <MyTickets />
                  </ProtectedRoute>
                }
              />

              {/* Support Agent Routes */}
              <Route
                path="/agent/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['SUPPORT_AGENT']}>
                    <AgentDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Universal Ticket Details Route (Customer, Agent, Admin) */}
              <Route
                path="/tickets/:id"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'SUPPORT_AGENT', 'ADMIN']}>
                    <TicketDetails />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Global Interactive 3D AI Support Assistant */}
          <AiSupportBot />

          <footer className="footer">
            <p>Customer Support &amp; Helpdesk Platform • Enterprise 3D Cloud Infrastructure</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
