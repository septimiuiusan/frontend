"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post('/reservation', authMiddleware_1.authenticateUser, async (req, res) => {
    try {
        const { userId, date, time, partySize, specialRequest } = req.body;
        if (!userId || !date || !time || !partySize) {
            res.status(400).json({
                error: 'userId, date, time, and partySize are required'
            });
            return;
        }
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const reservationDateTime = new Date(`${date}T${time}:00`);
        const reservation = await prisma.reservation.create({
            data: {
                userId,
                date: reservationDateTime,
                time: time,
                partySize: parseInt(partySize),
                specialRequest: specialRequest || null,
                status: 'PENDING'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.status(201).json({
            message: 'Reservation created successfully',
            reservation
        });
    }
    catch (error) {
        console.error('Reservation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/reservations', authMiddleware_1.authenticateUser, authMiddleware_1.requireCashier, async (_req, res) => {
    try {
        const reservations = await prisma.reservation.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                date: 'asc'
            }
        });
        res.json({
            message: 'Reservations retrieved successfully',
            reservations
        });
    }
    catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/reservations/:userId', authMiddleware_1.authenticateUser, authMiddleware_1.requireOwnershipOrStaff, async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const reservations = await prisma.reservation.findMany({
            where: { userId },
            orderBy: {
                date: 'desc'
            }
        });
        res.json({
            message: 'User reservations retrieved successfully',
            reservations
        });
    }
    catch (error) {
        console.error('Error fetching user reservations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=reservation.js.map