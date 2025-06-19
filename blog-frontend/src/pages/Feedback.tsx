import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Feedback.css';

interface CustomerReview {
    id: string;
    name: string;
    message: string;
    rating: number;
    createdAt: string;
}

const Feedback: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [reviews, setReviews] = useState<CustomerReview[]>([]);
    const { user } = useAuth();

    // Pre-fill form if user is logged in
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    // Load approved reviews
    useEffect(() => {
        const loadReviews = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/feedbacks');
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data.feedbacks);
                }
            } catch (error) {
                console.error('Error loading reviews:', error);
            }
        };
        loadReviews();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:3001/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(user?.id && { 'x-user-id': user.id })
                },
                body: JSON.stringify({
                    name,
                    email,
                    message,
                    rating
                }),
            });

            if (response.ok) {
                setShowConfirmation(true);
                // Reset form
                setName(user?.name || '');
                setEmail(user?.email || '');
                setMessage('');
                setRating(5);
            } else {
                const errorData = await response.json();
                console.error('Validation error:', errorData);
                
                if (errorData.details && Array.isArray(errorData.details)) {
                    const errorMessages = errorData.details.map((detail: any) => 
                        `${detail.field}: ${detail.message}`
                    ).join('\n');
                    alert(`Validation Error:\n${errorMessages}`);
                } else {
                    alert(`Error: ${errorData.error || 'Unknown error occurred'}`);
                }
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeConfirmation = () => {
        setShowConfirmation(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span
                key={index}
                className={`star ${index < rating ? 'filled' : 'empty'}`}
            >
                ★
            </span>
        ));
    };

    return (
        <div className="feedback-page">
            <section className="feedback-section">
                <div className="feedback-container">
                    <div className="feedback-header">
                        <h1 className="feedback-title">Customer Reviews</h1>
                        <p className="feedback-subtitle">
                            Hear what our guests are saying about their Steakz experience
                        </p>
                    </div>

                    {/* Customer Reviews Section */}
                    <div className="reviews-section">
                        <h2 className="reviews-title">Recent Reviews</h2>
                        <div className="reviews-grid">
                            {reviews.length > 0 ? (
                                reviews.slice(0, 6).map((review) => (
                                    <div key={review.id} className="review-card">
                                        <div className="review-header">
                                            <div className="review-author">
                                                <h4 className="author-name">{review.name}</h4>
                                                <span className="review-date">{formatDate(review.createdAt)}</span>
                                            </div>
                                            <div className="review-rating">
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                        <p className="review-text">{review.message}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="no-reviews">
                                    <p>No reviews yet. Be the first to share your experience!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Feedback Form Section */}
                    <div className="feedback-form-section">
                        <div className="form-header">
                            <h2 className="form-title">Share Your Experience</h2>
                            <p className="form-subtitle">
                                We value your feedback and use it to continually improve our service
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="feedback-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name" className="form-label">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="form-input"
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="form-input"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="rating" className="form-label">Rating</label>
                                <div className="rating-selector">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className={`rating-star ${star <= rating ? 'selected' : ''}`}
                                            onClick={() => setRating(star)}
                                        >
                                            ★
                                        </button>
                                    ))}
                                    <span className="rating-text">
                                        {rating === 1 ? 'Poor' : 
                                         rating === 2 ? 'Fair' :
                                         rating === 3 ? 'Good' :
                                         rating === 4 ? 'Very Good' :
                                         'Excellent'}
                                    </span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="message" className="form-label">Your Review</label>
                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                    rows={5}
                                    className="form-textarea"
                                    placeholder="Tell us about your experience at Steakz..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="modal-overlay" onClick={closeConfirmation}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Thank You!</h3>
                        <p className="modal-message">
                            Your feedback has been submitted successfully. We appreciate you taking the time to share your experience with us.
                        </p>
                        <p className="modal-note">
                            Your review will be published after moderation.
                        </p>
                        <button onClick={closeConfirmation} className="modal-close-btn">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Feedback;
