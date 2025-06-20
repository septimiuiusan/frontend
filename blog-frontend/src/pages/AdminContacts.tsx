import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';
import { StaffOnly } from '../components/RoleGuard';

interface Contact {
  id: string;
  name: string;
  email: string;
  message: string;
  userId?: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

const AdminContacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    // Only fetch contacts if user exists (RoleGuard handles role checking)
    if (user) {
      fetchContacts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('/api/contacts'), {
        headers: {
          'x-user-id': user?.id || ''
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setContacts(data.contacts);
      } else {
        setError(data.error || 'Failed to fetch contacts');
      }
    } catch (err) {
      setError('Failed to fetch contacts');
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Early returns after all hooks have been called - but RoleGuard handles this now
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading contacts...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        <h2>Error: {error}</h2>
        <button onClick={fetchContacts}>Retry</button>
      </div>
    );
  }

  const updateStatus = async (contactId: string, newStatus: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/contact/${contactId}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh the contacts list
        fetchContacts();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update status');
      }
    } catch (err) {
      setError('Failed to update status');
      console.error('Error updating status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#ffc107';
      case 'REVIEWED': return '#17a2b8';
      case 'RESOLVED': return '#28a745';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading contacts...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        <h2>Error: {error}</h2>
        <button onClick={fetchContacts}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: '#a52a2a', fontFamily: 'Merriweather, serif' }}>
          Contact Messages ({contacts.length})
        </h1>
        <button 
          onClick={fetchContacts}
          style={{
            background: '#a52a2a',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>

      {contacts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>No contact messages found</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {contacts.map((contact) => (
            <div
              key={contact.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1.5rem',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>
                    {contact.name}
                  </h3>
                  <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                    {contact.email}
                    {contact.user && (
                      <span style={{ marginLeft: '0.5rem', fontStyle: 'italic' }}>
                        (User: {contact.user.name})
                      </span>
                    )}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      background: getStatusColor(contact.status),
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {contact.status}
                  </span>
                  <select
                    value={contact.status}
                    onChange={(e) => updateStatus(contact.id, e.target.value)}
                    style={{
                      padding: '0.25rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      fontSize: '0.8rem'
                    }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="REVIEWED">REVIEWED</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#555' }}>Message:</h4>
                <p style={{ 
                  margin: '0', 
                  padding: '0.75rem', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '4px',
                  lineHeight: '1.5'
                }}>
                  {contact.message}
                </p>
              </div>
              
              <div style={{ fontSize: '0.8rem', color: '#888' }}>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Created:</strong> {formatDate(contact.createdAt)}
                </p>
                {contact.updatedAt !== contact.createdAt && (
                  <p style={{ margin: '0.25rem 0' }}>
                    <strong>Updated:</strong> {formatDate(contact.updatedAt)}
                  </p>
                )}
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>ID:</strong> {contact.id}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminContactsPage: React.FC = () => (
  <StaffOnly>
    <AdminContacts />
  </StaffOnly>
);

export default AdminContactsPage;
