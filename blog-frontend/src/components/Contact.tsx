import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Contact.css';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { user } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        userId: user?.id || undefined // Include userId if user is logged in
      };

      const response = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setSubmitMessage('Thank you for your message! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setIsSuccess(false);
        setSubmitMessage(data.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending contact message:', error);
      setIsSuccess(false);
      setSubmitMessage('Failed to send message. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        <h2 className="contact-title">Contact Us</h2>
        <p className="contact-desc">
          Questions or special requests? Reach out and our team will be happy to help.
        </p>
        
        {submitMessage && (
          <div className={`submit-message ${isSuccess ? 'success' : 'error'}`}>
            {submitMessage}
          </div>
        )}
        
        <form className="contact-form" onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="name"
            placeholder="Your Name" 
            value={formData.name}
            onChange={handleInputChange}
            required 
          />
          <input 
            type="email" 
            name="email"
            placeholder="Your Email" 
            value={formData.email}
            onChange={handleInputChange}
            required 
          />
          <textarea 
            name="message"
            placeholder="Your Message" 
            rows={5} 
            value={formData.message}
            onChange={handleInputChange}
            required 
          />
          <button 
            type="submit" 
            className="contact-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
        
        {user && (
          <p className="logged-in-notice">
            Logged in as {user.name} - we'll link this message to your account.
          </p>
        )}
      </div>
    </section>
  );
};

export default Contact;
export {};