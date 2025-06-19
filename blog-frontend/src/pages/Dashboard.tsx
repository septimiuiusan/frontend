import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import RoleGuard from '../components/RoleGuard';

interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
  user?: { name: string; email: string; };
}

interface Order {
  id: string;
  total: number;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  user: { name: string; email: string; };
}

interface Reservation {
  id: string;
  date: string;
  time: string;
  partySize: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string; };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Feedback {
  id: string;
  name: string;
  email: string;
  message: string;
  rating: number;
  status: string;
  createdAt: string;
  user?: { name: string; email: string; };
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  
  // User management states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showManageRolesModal, setShowManageRolesModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER'
  });
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);

  // Fetch data based on user role
  useEffect(() => {
    if (user) {
      // Initial data fetch
      fetchDashboardData();

      // Set up real-time refresh intervals for staff members
      if (user.role !== 'CUSTOMER') {
        const interval = setInterval(() => {
          setRefreshing(true);
          fetchDashboardData().finally(() => {
            setRefreshing(false);
            setLastRefresh(new Date());
          });
        }, 30000); // Refresh every 30 seconds for real-time updates

        return () => clearInterval(interval);
      }
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const headers = { 'x-user-id': user.id };

      // Fetch data based on role
      const promises: Promise<any>[] = [];

      // Staff and above can see contacts
      if (['CASHIER', 'CHEF', 'MANAGER', 'ADMIN'].includes(user.role)) {
        promises.push(
          fetch('http://localhost:3001/api/contacts', { headers })
            .then(res => res.json())
            .then(data => data.contacts || [])
            .catch(() => [])
        );
      }

      // Cashier and above can see all orders
      if (['CASHIER', 'MANAGER', 'ADMIN'].includes(user.role)) {
        promises.push(
          fetch('http://localhost:3001/api/orders', { headers })
            .then(res => res.json())
            .then(data => data.orders || [])
            .catch(() => [])
        );
      }

      // Staff and above can see reservations
      if (['CASHIER', 'CHEF', 'MANAGER', 'ADMIN'].includes(user.role)) {
        promises.push(
          fetch('http://localhost:3001/api/reservations', { headers })
            .then(res => res.json())
            .then(data => data.reservations || [])
            .catch(() => [])
        );
      }

      // Admins can see users
      if (user.role === 'ADMIN') {
        promises.push(
          fetch('http://localhost:3001/api/users', { headers })
            .then(res => res.json())
            .then(data => data.users || [])
            .catch(() => [])
        );
      }

      // Admins can see feedbacks
      if (user.role === 'ADMIN') {
        promises.push(
          fetch('http://localhost:3001/api/admin/feedbacks', { headers })
            .then(res => res.json())
            .then(data => data.feedbacks || [])
            .catch(() => [])
        );
      }

      const results = await Promise.all(promises);
      
      let index = 0;
      if (['CASHIER', 'CHEF', 'MANAGER', 'ADMIN'].includes(user.role)) {
        setContacts(results[index++] || []);
      }
      if (['CASHIER', 'MANAGER', 'ADMIN'].includes(user.role)) {
        setOrders(results[index++] || []);
      }
      if (['CASHIER', 'CHEF', 'MANAGER', 'ADMIN'].includes(user.role)) {
        setReservations(results[index++] || []);
      }
      if (user.role === 'ADMIN') {
        setUsers(results[index++] || []);
        setFeedbacks(results[index++] || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update order status function
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update the order in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        console.log(`Order ${orderId} status updated to ${newStatus}`);
      } else {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Update reservation status function
  const updateReservationStatus = async (reservationId: string, newStatus: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/reservations/${reservationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update the reservation in the local state
        setReservations(prevReservations => 
          prevReservations.map(reservation => 
            reservation.id === reservationId 
              ? { ...reservation, status: newStatus }
              : reservation
          )
        );
        console.log(`Reservation ${reservationId} status updated to ${newStatus}`);
      } else {
        console.error('Failed to update reservation status');
      }
    } catch (error) {
      console.error('Error updating reservation status:', error);
    }
  };

  // User management functions
  const createUser = async () => {
    if (!user || !newUser.name || !newUser.email || !newUser.password) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(prevUsers => [data.user, ...prevUsers]);
        setNewUser({ name: '', email: '', password: '', role: 'CUSTOMER' });
        setShowAddUserModal(false);
        console.log('User created successfully:', data.user);
      } else {
        const errorData = await response.json();
        alert(`Failed to create user: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/user/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === userId 
              ? { ...u, role: newRole }
              : u
          )
        );
        setSelectedUserForRole(null);
        setShowManageRolesModal(false);
        console.log('User role updated successfully:', data.user);
      } else {
        const errorData = await response.json();
        alert(`Failed to update role: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role');
    }
  };

  // Update feedback status function
  const updateFeedbackStatus = async (feedbackId: string, newStatus: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/admin/feedback/${feedbackId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update the feedback in the local state
        setFeedbacks(prevFeedbacks => 
          prevFeedbacks.map(feedback => 
            feedback.id === feedbackId 
              ? { ...feedback, status: newStatus }
              : feedback
          )
        );
        console.log(`Feedback ${feedbackId} status updated to ${newStatus}`);
      } else {
        console.error('Failed to update feedback status');
      }
    } catch (error) {
      console.error('Error updating feedback status:', error);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Please log in to access your dashboard</h2>
        <a href="/login" style={{ color: '#a52a2a' }}>Go to Login</a>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#a52a2a', fontFamily: 'Merriweather, serif' }}>
          Welcome, {user.name}!
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#666' }}>
          Role: <strong style={{ color: '#a52a2a' }}>{user.role}</strong>
        </p>
        {user.role !== 'CUSTOMER' && (
          <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.5rem' }}>
            {refreshing ? (
              <span>🔄 Refreshing...</span>
            ) : (
              <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
            )}
          </div>
        )}
      </div>

      {/* Customer Dashboard */}
      <RoleGuard allowedRoles={['CUSTOMER']} fallback={null}>
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fff7f5', borderRadius: '8px' }}>
          <h2 style={{ color: '#a52a2a', marginBottom: '1rem' }}>Customer Dashboard</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <a href="/order" style={{ display: 'block', padding: '1.5rem', background: 'white', borderRadius: '8px', textDecoration: 'none', color: 'inherit', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍽️</div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Order Food</h3>
              <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>Browse our menu and place orders</p>
            </a>
            <a href="/reservations" style={{ display: 'block', padding: '1.5rem', background: 'white', borderRadius: '8px', textDecoration: 'none', color: 'inherit', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📅</div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Make Reservation</h3>
              <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>Reserve a table for dining</p>
            </a>
            <a href="/profile" style={{ display: 'block', padding: '1.5rem', background: 'white', borderRadius: '8px', textDecoration: 'none', color: 'inherit', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👤</div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>View Profile</h3>
              <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>See your order and reservation history</p>
            </a>
            <a href="/contact" style={{ display: 'block', padding: '1.5rem', background: 'white', borderRadius: '8px', textDecoration: 'none', color: 'inherit', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📧</div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Contact Us</h3>
              <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>Send us a message or inquiry</p>
            </a>
          </div>
        </div>
      </RoleGuard>

      {/* Staff Dashboard - Common for all staff */}
      {user.role !== 'CUSTOMER' && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#e8f4f8', borderRadius: '8px' }}>
          <h2 style={{ color: '#0056b3', marginBottom: '1rem' }}>Staff Dashboard</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'white', borderRadius: '8px', padding: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#0056b3' }}>📬 Recent Contact Messages</h3>
              {loading ? (
                <p>Loading contacts...</p>
              ) : contacts.length > 0 ? (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {contacts.slice(0, 3).map(contact => (
                    <div key={contact.id} style={{ padding: '0.5rem', marginBottom: '0.5rem', background: '#f8f9fa', borderRadius: '4px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{contact.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>{contact.message.substring(0, 100)}...</div>
                      <div style={{ fontSize: '0.7rem', color: contact.status === 'PENDING' ? '#ffc107' : '#28a745' }}>
                        Status: {contact.status}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>No contact messages</p>
              )}
              <a href="/admin/contacts" style={{ display: 'inline-block', marginTop: '0.5rem', color: '#0056b3', textDecoration: 'none', fontSize: '0.9rem' }}>
                View All Messages →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Cashier Specific */}
      {['ADMIN', 'MANAGER', 'CASHIER'].includes(user.role) && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f0f8f0', borderRadius: '8px' }}>
          <h2 style={{ color: '#28a745', marginBottom: '1rem' }}>💰 Cashier Operations (Real-time)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'white', borderRadius: '8px', padding: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#28a745' }}>Recent Orders</h3>
              {loading ? (
                <p>Loading orders...</p>
              ) : orders.length > 0 ? (
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', marginBottom: '0.5rem', background: '#f8f9fa', borderRadius: '5px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>${order.total.toFixed(2)}</div>
                        <div style={{ fontSize: '0.8rem' }}>{order.user.name}</div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>No recent orders</p>
              )}
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#d4edda', borderRadius: '5px' }}>
                <div style={{ fontWeight: 'bold', color: '#155724' }}>
                  Total Today: ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                </div>
              </div>
            </div>
            
            <div style={{ background: 'white', borderRadius: '8px', padding: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#ffc107' }}>Pending Reservations</h3>
              {loading ? (
                <p>Loading reservations...</p>
              ) : reservations.filter(res => res.status === 'PENDING').length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {reservations.filter(res => res.status === 'PENDING').map(reservation => (
                    <div key={reservation.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '0.75rem', 
                      marginBottom: '0.5rem', 
                      background: '#fff3cd', 
                      borderRadius: '5px',
                      border: '1px solid #ffeaa7'
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{new Date(reservation.date).toLocaleDateString()} at {reservation.time}</div>
                        <div style={{ fontSize: '0.8rem' }}>{reservation.user.name} (Party of {reservation.partySize})</div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>
                          Requested {new Date(reservation.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem', flexDirection: 'column' }}>
                        <button 
                          onClick={() => updateReservationStatus(reservation.id, 'CONFIRMED')}
                          style={{ 
                            padding: '0.25rem 0.75rem', 
                            background: '#28a745', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '3px', 
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => updateReservationStatus(reservation.id, 'CANCELLED')}
                          style={{ 
                            padding: '0.25rem 0.75rem', 
                            background: '#dc3545', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '3px', 
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>No pending reservations</p>
              )}
            </div>

            <div style={{ background: 'white', borderRadius: '8px', padding: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#28a745' }}>Confirmed Reservations</h3>
              {loading ? (
                <p>Loading reservations...</p>
              ) : reservations.filter(res => res.status === 'CONFIRMED').length > 0 ? (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {reservations.filter(res => res.status === 'CONFIRMED').map(reservation => (
                    <div key={reservation.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '0.75rem', 
                      marginBottom: '0.5rem', 
                      background: '#d4edda', 
                      borderRadius: '5px',
                      border: '1px solid #c3e6cb'
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{new Date(reservation.date).toLocaleDateString()} at {reservation.time}</div>
                        <div style={{ fontSize: '0.8rem' }}>{reservation.user.name} (Party of {reservation.partySize})</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem', flexDirection: 'column' }}>
                        <div style={{ fontSize: '0.7rem', color: '#28a745', fontWeight: 'bold' }}>CONFIRMED</div>
                        <button 
                          onClick={() => updateReservationStatus(reservation.id, 'COMPLETED')}
                          style={{ 
                            padding: '0.25rem 0.75rem', 
                            background: '#17a2b8', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '3px', 
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>No confirmed reservations</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Kitchen/Chef Specific */}
      {['ADMIN', 'CHEF'].includes(user.role) && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#fff3cd', borderRadius: '8px' }}>
          <h2 style={{ color: '#856404', marginBottom: '1rem' }}>👨‍🍳 Kitchen Dashboard</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'white', borderRadius: '8px', padding: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#856404' }}>Active Orders Queue</h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {loading ? (
                  <p>Loading orders...</p>
                ) : orders.length > 0 ? (
                  orders.filter(order => ['PENDING', 'PREPARING'].includes(order.status || 'PENDING')).map(order => (
                    <div key={order.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '0.75rem', 
                      background: order.status === 'PREPARING' ? '#ffeaa7' : '#ffebee', 
                      borderRadius: '5px', 
                      marginBottom: '0.5rem' 
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>Order #{order.id.slice(-6)}</div>
                        <div style={{ fontSize: '0.8rem' }}>{order.user.name} - €{order.total.toFixed(2)}</div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: order.status === 'PREPARING' ? '#856404' : '#d32f2f',
                          fontWeight: 'bold'
                        }}>
                          {order.status || 'PENDING'}
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                            style={{ 
                              padding: '0.25rem 0.5rem', 
                              background: '#ffc107', 
                              color: 'black', 
                              border: 'none', 
                              borderRadius: '3px', 
                              fontSize: '0.7rem',
                              cursor: 'pointer'
                            }}
                            disabled={order.status === 'PREPARING'}
                          >
                            Start
                          </button>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'READY')}
                            style={{ 
                              padding: '0.25rem 0.5rem', 
                              background: '#28a745', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '3px', 
                              fontSize: '0.7rem',
                              cursor: 'pointer'
                            }}
                          >
                            Ready
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>No active orders</p>
                )}
              </div>
            </div>
            
            <div style={{ background: 'white', borderRadius: '8px', padding: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#856404' }}>Kitchen Stats</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '5px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                    {orders.filter(order => ['READY', 'COMPLETED'].includes(order.status || '')).length}
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>Completed Today</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '5px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107' }}>
                    {orders.filter(order => order.status === 'PREPARING').length}
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>In Progress</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '5px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#17a2b8' }}>
                    {orders.filter(order => order.status === 'PENDING').length}
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>Pending</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '5px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6f42c1' }}>
                    {orders.length}
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>Total Orders</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manager Specific */}
      {['ADMIN', 'MANAGER'].includes(user.role) && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8d7da', borderRadius: '8px' }}>
          <h2 style={{ color: '#721c24', marginBottom: '1rem' }}>📊 Manager Analytics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'white', borderRadius: '8px', padding: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#721c24' }}>Daily Performance</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', background: '#d1ecf1', borderRadius: '5px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0c5460' }}>${orders.reduce((sum, order) => sum + order.total, 0).toFixed(0)}</div>
                  <div style={{ fontSize: '0.8rem' }}>Revenue Today</div>
                </div>
                <div style={{ padding: '1rem', background: '#d4edda', borderRadius: '5px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#155724' }}>{orders.length}</div>
                  <div style={{ fontSize: '0.8rem' }}>Orders Today</div>
                </div>
                <div style={{ padding: '1rem', background: '#fff3cd', borderRadius: '5px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#856404' }}>{reservations.length}</div>
                  <div style={{ fontSize: '0.8rem' }}>Reservations</div>
                </div>
                <div style={{ padding: '1rem', background: '#f8d7da', borderRadius: '5px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#721c24' }}>{contacts.filter(c => c.status === 'PENDING').length}</div>
                  <div style={{ fontSize: '0.8rem' }}>Pending Issues</div>
                </div>
              </div>
            </div>
            
            <div style={{ background: 'white', borderRadius: '8px', padding: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#721c24' }}>Staff Overview</h3>
              <div style={{ fontSize: '0.9rem' }}>
                <div style={{ padding: '0.5rem', marginBottom: '0.5rem', background: '#f8f9fa', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 'bold' }}>Kitchen Staff: ✅ All Present</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>2 Chefs, 1 Prep Cook</div>
                </div>
                <div style={{ padding: '0.5rem', marginBottom: '0.5rem', background: '#f8f9fa', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 'bold' }}>Service Staff: ✅ All Present</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>3 Servers, 2 Cashiers</div>
                </div>
                <div style={{ padding: '0.5rem', background: '#fff3cd', borderRadius: '4px' }}>
                  <div style={{ fontWeight: 'bold', color: '#856404' }}>⚠️ Peak Hours: 7-9 PM</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>Consider additional staff</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Only */}
      {user.role === 'ADMIN' && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#d1ecf1', borderRadius: '8px' }}>
          <h2 style={{ color: '#0c5460', marginBottom: '1rem' }}>🔑 Admin Control Panel</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'white', borderRadius: '8px', padding: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#0c5460' }}>User Management</h3>
              {loading ? (
                <p>Loading users...</p>
              ) : users.length > 0 ? (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {users.slice(0, 5).map(userData => (
                    <div key={userData.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', marginBottom: '0.5rem', background: '#f8f9fa', borderRadius: '4px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{userData.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{userData.email}</div>
                      </div>
                      <div style={{ 
                        fontSize: '0.7rem', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '12px',
                        background: userData.role === 'ADMIN' ? '#d1ecf1' : userData.role === 'MANAGER' ? '#f8d7da' : userData.role === 'CHEF' ? '#fff3cd' : userData.role === 'CASHIER' ? '#d4edda' : '#e2e3e5',
                        color: userData.role === 'ADMIN' ? '#0c5460' : userData.role === 'MANAGER' ? '#721c24' : userData.role === 'CHEF' ? '#856404' : userData.role === 'CASHIER' ? '#155724' : '#6c757d'
                      }}>
                        {userData.role}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>No users found</p>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  style={{ flex: 1, padding: '0.5rem', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', fontSize: '0.8rem' }}
                >
                  Add User
                </button>
                <button 
                  onClick={() => setShowManageRolesModal(true)}
                  style={{ flex: 1, padding: '0.5rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', fontSize: '0.8rem' }}
                >
                  Manage Roles
                </button>
              </div>
            </div>
            
            <div style={{ background: 'white', borderRadius: '8px', padding: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#0c5460' }}>Feedback Management</h3>
              {loading ? (
                <p>Loading feedback...</p>
              ) : feedbacks.length > 0 ? (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {feedbacks.slice(0, 3).map(feedback => (
                    <div key={feedback.id} style={{ padding: '0.75rem', marginBottom: '0.5rem', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{feedback.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>{feedback.email}</div>
                          <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                            {'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)} ({feedback.rating}/5)
                          </div>
                        </div>
                        <div style={{ 
                          fontSize: '0.7rem', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '12px',
                          background: feedback.status === 'APPROVED' ? '#d4edda' : feedback.status === 'REJECTED' ? '#f8d7da' : '#fff3cd',
                          color: feedback.status === 'APPROVED' ? '#155724' : feedback.status === 'REJECTED' ? '#721c24' : '#856404'
                        }}>
                          {feedback.status}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                        "{feedback.message.length > 80 ? feedback.message.substring(0, 80) + '...' : feedback.message}"
                      </div>
                      {feedback.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => updateFeedbackStatus(feedback.id, 'APPROVED')}
                            style={{ flex: 1, padding: '0.4rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.7rem' }}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => updateFeedbackStatus(feedback.id, 'REJECTED')}
                            style={{ flex: 1, padding: '0.4rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.7rem' }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#666', fontSize: '0.9rem' }}>No feedback submissions</p>
              )}
              <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
                Total: {feedbacks.length} | Pending: {feedbacks.filter(f => f.status === 'PENDING').length} | Approved: {feedbacks.filter(f => f.status === 'APPROVED').length}
              </div>
            </div>
            
            <div style={{ background: 'white', borderRadius: '8px', padding: '1rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#0c5460' }}>System Status</h3>
              <div style={{ fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', marginBottom: '0.5rem', background: '#d4edda', borderRadius: '4px' }}>
                  <span>Database</span>
                  <span style={{ color: '#155724', fontWeight: 'bold' }}>✅ Online</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', marginBottom: '0.5rem', background: '#d4edda', borderRadius: '4px' }}>
                  <span>Payment System</span>
                  <span style={{ color: '#155724', fontWeight: 'bold' }}>✅ Active</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', marginBottom: '0.5rem', background: '#d4edda', borderRadius: '4px' }}>
                  <span>Kitchen Display</span>
                  <span style={{ color: '#155724', fontWeight: 'bold' }}>✅ Connected</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#fff3cd', borderRadius: '4px' }}>
                  <span>Backup Status</span>
                  <span style={{ color: '#856404', fontWeight: 'bold' }}>⚠️ 2h ago</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', marginTop: '0.5rem', background: '#e2e3e5', borderRadius: '4px' }}>
                  <span>Total Users</span>
                  <span style={{ color: '#6c757d', fontWeight: 'bold' }}>{users.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000 
        }}>
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '8px', 
            minWidth: '400px', 
            maxWidth: '500px' 
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#0c5460' }}>Add New User</h3>
            <form onSubmit={(e) => { e.preventDefault(); createUser(); }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Name:</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email:</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Password:</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Role:</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="CUSTOMER">Customer</option>
                  <option value="CASHIER">Cashier</option>
                  <option value="CHEF">Chef</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="submit"
                  style={{ 
                    flex: 1, 
                    padding: '0.75rem', 
                    background: '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: 'pointer' 
                  }}
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setNewUser({ name: '', email: '', password: '', role: 'CUSTOMER' });
                  }}
                  style={{ 
                    flex: 1, 
                    padding: '0.75rem', 
                    background: '#6c757d', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: 'pointer' 
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Roles Modal */}
      {showManageRolesModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000 
        }}>
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: '8px', 
            minWidth: '500px', 
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#0c5460' }}>Manage User Roles</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {users.map(userData => (
                <div key={userData.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.75rem', 
                  marginBottom: '0.5rem', 
                  background: '#f8f9fa', 
                  borderRadius: '5px' 
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{userData.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{userData.email}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <select
                      value={userData.role}
                      onChange={(e) => updateUserRole(userData.id, e.target.value)}
                      style={{ 
                        padding: '0.25rem 0.5rem', 
                        border: '1px solid #ddd', 
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="CASHIER">Cashier</option>
                      <option value="CHEF">Chef</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={() => setShowManageRolesModal(false)}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  background: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px', 
                  cursor: 'pointer' 
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
