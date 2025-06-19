import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Hero.css';

const Hero: React.FC = () => {
    return (
        <section className="hero-section">
            <div className="hero-container">
                <div className="hero-content">
                    <h1 className="hero-title">Welcome to Steakz</h1>
                    <p className="hero-subtitle">Experience the finest steaks and premium dining.</p>
                    <Link to="/reservations" className="hero-cta">Book a Table</Link>
                </div>
            </div>
        </section>
    );
};

export default Hero;