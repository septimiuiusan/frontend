import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { getApiUrl } from '../config/api';
import '../styles/profile.css';

const Profile: React.FC = () => {
    const { user, logout, isLoading } = useAuth();
    const { getUserOrders, orders } = useOrders();
    const [activeTab, setActiveTab] = useState('profile');
    const [reservations, setReservations] = useState<any[]>([]);

    // Load user reservations
    useEffect(() => {
        const loadReservations = async () => {
            if (user?.id) {
                try {
                    const response = await fetch(getApiUrl(`/api/reservations/${user.id}`), {
                        headers: {
                            'x-user-id': user.id
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setReservations(data.reservations);
                    } else {
                        console.error('Failed to load reservations:', response.status);
                    }
                } catch (error) {
                    console.error('Error loading reservations:', error);
                }
            }
        };
        
        loadReservations();
    }, [user]);

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '16px',
                        marginTop: '40px',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)'
                    }}>
                        <h2 style={{ color: '#a52a2a', marginBottom: '20px', fontFamily: 'Playfair Display, serif' }}>Loading...</h2>
                        <p style={{ color: '#5a5a5a' }}>Please wait while we load your profile.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Get user's orders
    const userOrders = user ? getUserOrders(user.id) : [];

    const getTotalSpent = () => {
        return userOrders
            .reduce((total, order) => total + order.total, 0);
    };

    const getTotalOrders = () => {
        return userOrders.length;
    };

    if (!user) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '16px',
                        marginTop: '40px',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)'
                    }}>
                        <h2 style={{ color: '#a52a2a', marginBottom: '20px', fontFamily: 'Playfair Display, serif' }}>Please Log In</h2>
                        <p style={{ marginBottom: '30px', color: '#5a5a5a' }}>You need to be logged in to view your profile and order history.</p>
                        <a href="/login" className="action-btn primary">Go to Login</a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <h1 className="profile-title">My Profile</h1>
                    <p className="profile-subtitle">Your account and dining history</p>
                </div>

                {/* Tab Navigation */}
                <div className="profile-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        👤 Profile
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        🍽️ Order History ({userOrders.length})
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'reservations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reservations')}
                    >
                        📅 Reservations ({reservations.length})
                    </button>
                </div>

                {/* Profile Info Tab */}
                {activeTab === 'profile' && (
                    <div className="profile-content">
                        <div className="profile-info-card">
                            <div className="profile-avatar">
                                <span className="avatar-initial">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="profile-details">
                                <h2 className="user-name">{user.name}</h2>
                                <p className="user-email">{user.email}</p>
                                <p className="user-role">Account Type: <span className="role-badge">{user.role}</span></p>
                            </div>
                        </div>

                        <div className="profile-stats">
                            <div className="stat-item">
                                <span className="stat-number">{getTotalOrders()}</span>
                                <span className="stat-label">Total Orders</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">€{getTotalSpent().toFixed(2)}</span>
                                <span className="stat-label">Total Spent</span>
                            </div>
                        </div>

                        <div className="profile-actions">
                            <button onClick={logout} className="action-btn danger">Logout</button>
                        </div>
                    </div>
                )}

                {/* Order History Tab */}
                {activeTab === 'orders' && (
                    <div className="order-history-content">
                        <div className="order-history-header">
                            <h3>Your Orders</h3>
                            {userOrders.length > 0 ? (
                                <p>{getTotalOrders()} orders • €{getTotalSpent().toFixed(2)} spent</p>
                            ) : (
                                <p>No orders found for this user</p>
                            )}
                        </div>

                        {userOrders.length > 0 ? (
                            <div className="order-history-list">
                                {userOrders.map(order => (
                                    <div key={order.id} className="order-history-item">
                                        <div className="order-header-row">
                                            <div className="order-basic-info">
                                                <span className="order-id">#{order.id.split('-')[1]}</span>
                                                <span className="order-datetime">
                                                    {new Date(order.date).toLocaleDateString('en-GB', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })} • {order.time}
                                                </span>
                                            </div>
                                            <div className="order-total-only">
                                                <span className="order-total">€{order.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="order-items">
                                            <div className="items-grid">
                                                {order.items.map((item, index) => (
                                                    <span key={index} className="order-item-detail">
                                                        {item.quantity}x {item.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-orders">
                                <h4>No orders yet</h4>
                                <p>Ready to start your culinary journey?</p>
                                <a href="/order" className="action-btn primary">Order Now</a>
                            </div>
                        )}
                    </div>
                )}

                {/* Reservations Tab */}
                {activeTab === 'reservations' && (
                    <div className="profile-content">
                        <div className="section-header">
                            <h3 className="section-title">Your Reservations</h3>
                            <p className="section-subtitle">Manage your table bookings</p>
                        </div>

                        {reservations.length > 0 ? (
                            <div className="orders-list">
                                {reservations.map((reservation) => (
                                    <div key={reservation.id} className="order-card">
                                        <div className="order-header">
                                            <div className="order-info">
                                                <span className="order-id">#{reservation.id.slice(-8)}</span>
                                                <span className="order-date">
                                                    {new Date(reservation.date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })} • {reservation.time}
                                                </span>
                                            </div>
                                            <div className="order-total-status">
                                                <span className="order-total">{reservation.partySize} guests</span>
                                                <span className={`order-status ${reservation.status.toLowerCase()}`}>
                                                    {reservation.status === 'CONFIRMED' ? '✓' : 
                                                     reservation.status === 'PENDING' ? '⏳' : '✗'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="order-items">
                                            <div className="items-grid">
                                                <span className="order-item-detail">
                                                    Status: {reservation.status}
                                                </span>
                                                {reservation.specialRequest && (
                                                    <span className="order-item-detail">
                                                        Special Request: {reservation.specialRequest}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-orders">
                                <h4>No reservations yet</h4>
                                <p>Book a table for your next dining experience!</p>
                                <a href="/reservations" className="action-btn primary">Make Reservation</a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;