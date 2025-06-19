import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/Menu.css'; // Import menu styles for consistency

const Home: React.FC = () => {
    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container">
                    <div className="hero-content">
                        <h1 className="hero-title">Welcome to Steakz</h1>
                        <p className="hero-subtitle">Experience the finest steaks and premium dining.</p>
                        <Link to="/reservations" className="hero-cta">Book a Table</Link>
                    </div>
                </div>
            </section>

            {/* Signature Dishes Section */}
            <section className="signature-dishes-section">
                <div className="menu-container">
                    <h2 className="menu-main-title">Signature Dishes</h2>
                    <div className="menu-category">
                        <div className="menu-grid">
                            <div className="menu-card">
                                <h4 className="menu-item-title">Classic Ribeye</h4>
                                <p className="menu-desc">Perfectly marbled ribeye steak grilled to your preference with herb butter.</p>
                                <p className="menu-price">$32.99</p>
                            </div>
                            <div className="menu-card">
                                <h4 className="menu-item-title">Tomahawk Steak</h4>
                                <p className="menu-desc">Impressive bone-in ribeye perfect for sharing, dry-aged for 28 days.</p>
                                <p className="menu-price">$68.99</p>
                            </div>
                            <div className="menu-card">
                                <h4 className="menu-item-title">Truffle Filet Mignon</h4>
                                <p className="menu-desc">Tender filet mignon with aromatic black truffle sauce and pomme purée.</p>
                                <p className="menu-price">$45.99</p>
                            </div>
                        </div>
                    </div>
                    {/* View Full Menu Button */}
                    <div className="menu-btn-row">
                        <Link to="/menu" className="menu-btn">View Full Menu</Link>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="about-section">
                <div className="section-container">
                    <div className="about-content">
                        <h2 className="section-title">About Steakz</h2>
                        <p className="about-text">
                            At Steakz, we are committed to culinary excellence. Our chefs use time-honored 
                            techniques and premium ingredients to craft memorable meals in an elegant and 
                            welcoming atmosphere.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;