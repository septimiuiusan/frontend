import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar: React.FC = () => {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <Link to="/" onClick={() => setOpen(false)}>
                        <span className="navbar-logo-icon">🥩</span>
                        <span className="navbar-brand">Steakz</span>
                    </Link>
                </div>
                <ul className={`navbar-links ${open ? 'open' : ''}`}>
                    <li><Link to="/" onClick={() => setOpen(false)}>Home</Link></li>
                    <li><Link to="/menu" onClick={() => setOpen(false)}>Menu</Link></li>
                    <li><Link to="/order" onClick={() => setOpen(false)}>Order Online</Link></li>
                    <li><Link to="/about" onClick={() => setOpen(false)}>About</Link></li>
                    <li><Link to="/reservations" onClick={() => setOpen(false)}>Reservations</Link></li>
                    <li><Link to="/feedback" onClick={() => setOpen(false)}>Reviews</Link></li>
                    <li><Link to="/contact" onClick={() => setOpen(false)}>Contact</Link></li>
                    {!user && (
                        <>
                            <li><Link to="/signup" onClick={() => setOpen(false)}>Sign Up</Link></li>
                            <li><Link to="/login" onClick={() => setOpen(false)}>Log In</Link></li>
                        </>
                    )}
                    {user && (
                        <>
                            <li><Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link></li>
                            <li><Link to="/profile" onClick={() => setOpen(false)}>Profile</Link></li>
                            {['ADMIN', 'MANAGER', 'CASHIER'].includes(user.role) && (
                                <li><Link to="/admin/contacts" onClick={() => setOpen(false)} className="admin-link">Admin Contacts</Link></li>
                            )}
                            <li><button onClick={logout} className="logout-btn">Logout</button></li>
                        </>
                    )}
                </ul>
                <button
                    className={`navbar-toggle ${open ? 'open' : ''}`}
                    onClick={() => setOpen(!open)}
                    aria-label="Toggle menu"
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;