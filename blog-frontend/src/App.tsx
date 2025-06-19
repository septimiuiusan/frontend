import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Order from './components/Order';
import About from './pages/About';
import Reservations from './pages/Reservations';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import AdminContacts from './pages/AdminContacts';
import DashboardPage from './pages/Dashboard';
import Feedback from './pages/Feedback';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <OrderProvider>
                <Router>
                    <div className="App">
                        <Navbar />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/menu" element={<Menu />} />
                            <Route path="/order" element={<Order />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/reservations" element={<Reservations />} />
                            <Route path="/feedback" element={<Feedback />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/dashboard" element={<DashboardPage />} />
                            <Route path="/admin/contacts" element={<AdminContacts />} />
                        </Routes>
                    </div>
                </Router>
            </OrderProvider>
        </AuthProvider>
    );
}

export default App;