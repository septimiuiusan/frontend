import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schema
const reservationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  date: z.string().refine(date => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
  }, 'Date must be a valid future date'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  partySize: z.number().int().min(1, 'Party size must be at least 1').max(20, 'Party size cannot exceed 20'),
  specialRequest: z.string().optional()
});

router.post('/reservation', async (req: Request, res: Response) => {
  try {
    // Validate input
    const { userId, date, time, partySize, specialRequest } = reservationSchema.parse(req.body);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Combine date and time into a DateTime
    const reservationDateTime = new Date(`${date}T${time}:00`);

    // Check for existing reservations at the same time (optional business logic)
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        userId,
        reservationDate: reservationDateTime,
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      }
    });

    if (existingReservation) {
      return res.status(400).json({
        error: 'You already have a reservation at this date and time'
      });
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        userId,
        reservationDate: reservationDateTime,
        partySize,
        specialRequest: specialRequest || null,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation: {
        ...reservation,
        date: reservation.reservationDate.toISOString().split('T')[0],
        time: reservation.reservationDate.toTimeString().slice(0, 5)
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }

    console.error('Reservation creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error during reservation creation' 
    });
  }
});

export default router;