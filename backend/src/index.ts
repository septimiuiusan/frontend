import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import signupRoutes from './routes/signup';
import authRoutes from './routes/auth';
import orderRoutes from './routes/order';
import reservationRoutes from './routes/reservation';
import staffRoutes from './routes/staff';
import contactRoutes from './routes/contact';
import userRoutes from './routes/users';
import feedbackRoutes from './routes/feedback';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', signupRoutes);
app.use('/api', authRoutes);
app.use('/api', orderRoutes);
app.use('/api', reservationRoutes);
app.use('/api', staffRoutes);
app.use('/api', contactRoutes);
app.use('/api', userRoutes);
app.use('/api', feedbackRoutes);

app.get('/', (_req, res) => {
    res.json({ 
        message: 'Steakz Restaurant API',
        endpoints: [
            'POST /api/signup',
            'POST /api/login',
            'POST /api/order', 
            'GET /api/orders/:userId',
            'POST /api/reservation',
            'GET /api/reservations',
            'GET /api/reservations/:userId',
            'POST /api/create-cashier',
            'POST /api/create-chef',
            'POST /api/create-admin',
            'POST /api/contact',
            'GET /api/contacts',
            'GET /api/contacts/status/:status',
            'PATCH /api/contact/:id/status'
        ]
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});