import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/api';
import '../styles/Reservations.css';

interface ReservationForm {
    name: string;
    email: string;
    date: string;
    time: string;
    guests: string;
    branchId: string;
}

interface Branch {
    id: string;
    name: string;
    country: string;
    flag: string;
    address: string;
    status: 'OPERATIONAL' | 'OPENING_SOON' | 'MAINTENANCE' | 'CLOSED';
}

const Reservations: React.FC = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState<ReservationForm>({
        name: '',
        email: '',
        date: '',
        time: '',
        guests: '2',
        branchId: ''
    });

    // Available branches - in a real app, this would come from an API
    const [branches] = useState<Branch[]>([
        {
            id: '1',
            name: 'London',
            country: 'UK',
            flag: '🇬🇧',
            address: '123 Oxford Street, London W1D 2HX',
            status: 'OPERATIONAL'
        },
        {
            id: '2',
            name: 'Paris',
            country: 'France',
            flag: '🇫🇷',
            address: '45 Champs-Élysées, 75008 Paris',
            status: 'OPERATIONAL'
        },
        {
            id: '3',
            name: 'Rome',
            country: 'Italy',
            flag: '🇮🇹',
            address: 'Via del Corso 87, 00186 Roma',
            status: 'OPERATIONAL'
        },
        {
            id: '4',
            name: 'Berlin',
            country: 'Germany',
            flag: '🇩🇪',
            address: 'Unter den Linden 12, 10117 Berlin',
            status: 'OPENING_SOON'
        }
    ]);

    const [errors, setErrors] = useState<Partial<ReservationForm>>({});
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name as keyof ReservationForm]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<ReservationForm> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.date) {
            newErrors.date = 'Date is required';
        } else {
            const selectedDate = new Date(formData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                newErrors.date = 'Please select a future date';
            }
        }

        if (!formData.time) {
            newErrors.time = 'Time is required';
        }

        if (!formData.branchId) {
            newErrors.branchId = 'Please select a location';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validateForm()) {
            setIsLoading(true);
            
            try {
                // Save reservation to backend
                console.log('User object:', user); // Debug log
                if (user?.id) {
                    console.log('Sending reservation data:', {
                        userId: user.id,
                        date: formData.date,
                        time: formData.time,
                        partySize: formData.guests,
                        specialRequest: null
                    }); // Debug log
                    
                    const response = await fetch(getApiUrl('/api/reservation'), {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-user-id': user.id
                        },
                        body: JSON.stringify({
                            userId: user.id,
                            date: formData.date,
                            time: formData.time,
                            partySize: formData.guests,
                            branchId: formData.branchId,
                            specialRequest: null // Could add this field to the form later
                        }),
                    });

                    console.log('Response status:', response.status); // Debug log
                    if (response.ok) {
                        const data = await response.json();
                        console.log('Reservation saved to backend:', data);
                        setShowModal(true);
                    } else {
                        const errorData = await response.json();
                        console.error('Failed to save reservation:', errorData);
                        alert(`Failed to save reservation: ${errorData.error || 'Unknown error'}`);
                        setShowModal(true); // Still show modal for now
                    }
                } else {
                    // User not logged in - could handle this differently
                    console.warn('User not logged in, reservation not saved to backend');
                    alert('You must be logged in to make a reservation');
                    setShowModal(false);
                }
            } catch (error) {
                console.error('Error saving reservation:', error);
                alert(`Error: ${error}`);
                setShowModal(true); // Still show modal for now
            } finally {
                setIsLoading(false);
            }
        }
    };

    const closeModal = () => {
        setShowModal(false);
        // Clear form
        setFormData({
            name: '',
            email: '',
            date: '',
            time: '',
            guests: '2',
            branchId: ''
        });
        setErrors({});
    };

    // Get selected branch info for display
    const getSelectedBranch = () => {
        return branches.find(branch => branch.id === formData.branchId);
    };

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="reservations-page">
            <section className="reservations-section">
                <div className="reservations-container">
                    <div className="reservations-header">
                        <h1 className="reservations-title">Make a Reservation</h1>
                        <p className="reservations-subtitle">
                            Reserve your table at any of our European locations for an exceptional dining experience at Steakz.
                        </p>
                    </div>

                    <div className="reservation-form-card">
                        <form onSubmit={handleSubmit} className="reservation-form">
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Full Name *"
                                    className={`form-input ${errors.name ? 'error' : ''}`}
                                />
                                {errors.name && <span className="error-message">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Email Address *"
                                    className={`form-input ${errors.email ? 'error' : ''}`}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <select
                                    name="branchId"
                                    value={formData.branchId}
                                    onChange={handleInputChange}
                                    className={`form-input ${errors.branchId ? 'error' : ''}`}
                                >
                                    <option value="">Select Location *</option>
                                    {branches
                                        .filter(branch => branch.status === 'OPERATIONAL')
                                        .map(branch => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.flag} {branch.name}, {branch.country} - {branch.address}
                                            </option>
                                        ))
                                    }
                                </select>
                                {errors.branchId && <span className="error-message">{errors.branchId}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        min={today}
                                        className={`form-input ${errors.date ? 'error' : ''}`}
                                    />
                                    {errors.date && <span className="error-message">{errors.date}</span>}
                                </div>

                                <div className="form-group">
                                    <select
                                        name="time"
                                        value={formData.time}
                                        onChange={handleInputChange}
                                        className={`form-input ${errors.time ? 'error' : ''}`}
                                    >
                                        <option value="">Select Time *</option>
                                        <option value="17:00">5:00 PM</option>
                                        <option value="17:30">5:30 PM</option>
                                        <option value="18:00">6:00 PM</option>
                                        <option value="18:30">6:30 PM</option>
                                        <option value="19:00">7:00 PM</option>
                                        <option value="19:30">7:30 PM</option>
                                        <option value="20:00">8:00 PM</option>
                                        <option value="20:30">8:30 PM</option>
                                        <option value="21:00">9:00 PM</option>
                                        <option value="21:30">9:30 PM</option>
                                    </select>
                                    {errors.time && <span className="error-message">{errors.time}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <select
                                    name="guests"
                                    value={formData.guests}
                                    onChange={handleInputChange}
                                    className="form-input"
                                >
                                    <option value="1">1 Guest</option>
                                    <option value="2">2 Guests</option>
                                    <option value="3">3 Guests</option>
                                    <option value="4">4 Guests</option>
                                    <option value="5">5 Guests</option>
                                    <option value="6">6 Guests</option>
                                    <option value="7">7 Guests</option>
                                    <option value="8">8 Guests</option>
                                    <option value="9">9+ Guests</option>
                                </select>
                            </div>

                            <button type="submit" className="book-btn" disabled={isLoading}>
                                {isLoading ? 'Booking...' : 'Book Now'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Reservation Confirmed</h3>
                        <div className="modal-message">
                            <p>Thank you for reserving a table at Steakz.</p>
                            {getSelectedBranch() && (
                                <div style={{ 
                                    marginTop: '1rem', 
                                    padding: '1rem', 
                                    background: '#f8f9fa', 
                                    borderRadius: '8px',
                                    fontSize: '0.9rem'
                                }}>
                                    <strong>Reservation Details:</strong>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        📍 <strong>Location:</strong> {getSelectedBranch()?.flag} {getSelectedBranch()?.name}, {getSelectedBranch()?.country}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                                        {getSelectedBranch()?.address}
                                    </div>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        📅 <strong>Date:</strong> {formData.date}
                                    </div>
                                    <div style={{ marginTop: '0.25rem' }}>
                                        🕐 <strong>Time:</strong> {formData.time}
                                    </div>
                                    <div style={{ marginTop: '0.25rem' }}>
                                        👥 <strong>Guests:</strong> {formData.guests}
                                    </div>
                                </div>
                            )}
                            <p style={{ marginTop: '1rem' }}>We look forward to serving you.</p>
                        </div>
                        <button onClick={closeModal} className="modal-close-btn">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reservations;