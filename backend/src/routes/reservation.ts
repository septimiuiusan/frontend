import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateUser, requireOwnershipOrStaff, requireCashier } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Create reservation (customers can create their own)
router.post('/reservation', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, date, time, partySize, specialRequest } = req.body;

    // Basic validation
    if (!userId || !date || !time || !partySize) {
      res.status(400).json({ 
        error: 'userId, date, time, and partySize are required' 
      });
      return;
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Combine date and time
    const reservationDateTime = new Date(`${date}T${time}:00`);

    // Create reservation
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

  } catch (error) {
    console.error('Reservation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all reservations (for admin/staff view)
// Get all reservations (for admin/staff view - cashiers can manage walk-ins)
router.get('/reservations', authenticateUser, requireCashier, async (_req: Request, res: Response): Promise<void> => {
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

  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's reservations
// Get user's reservations (users can only see their own, staff can see all)
router.get('/reservations/:userId', authenticateUser, requireOwnershipOrStaff, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Verify user exists
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

  } catch (error) {
    console.error('Error fetching user reservations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update reservation status (for staff use)
router.patch('/reservations/:reservationId/status', authenticateUser, requireCashier, async (req: Request, res: Response): Promise<void> => {
  try {
    const { reservationId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ 
        error: 'Invalid status',
        validStatuses 
      });
      return;
    }

    // Check if reservation exists
    const existingReservation = await prisma.reservation.findUnique({
      where: { id: reservationId }
    });

    if (!existingReservation) {
      res.status(404).json({ 
        error: 'Reservation not found' 
      });
      return;
    }

    // Update reservation status
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status },
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

    res.json({
      message: 'Reservation status updated successfully',
      reservation: updatedReservation
    });

  } catch (error) {
    console.error('Error updating reservation status:', error);
    res.status(500).json({ 
      error: 'Internal server error while updating reservation status' 
    });
  }
});

export default router;