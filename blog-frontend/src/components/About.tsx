import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/About.css';

const About: React.FC = () => {
    return (
        <section className="about-section" id="about">
            <div className="about-container">
                <h2 className="about-title">About Steakz</h2>
                <p className="about-desc">
                    At Steakz, we are committed to culinary excellence. Our chefs use time-honored 
                    techniques and premium ingredients to craft memorable meals in an elegant and 
                    welcoming atmosphere.
                </p>
                {/* Add reservation CTA if needed */}
                <div className="about-cta">
                    <Link to="/reservations" className="btn">Book Your Experience</Link>
                </div>
            </div>
        </section>
    );
};

export default About;