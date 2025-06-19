import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { requireStaff } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Validation schema
const feedbackSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be less than 1000 characters'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional()
});

// Create feedback (anyone can submit)
router.post('/feedback', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const { name, email, message, rating = 5 } = feedbackSchema.parse(req.body);
    
    // Get user ID from header if available (for logged-in users)
    const userId = req.headers['x-user-id'] as string;

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        name,
        email,
        message,
        rating,
        userId: userId || null
      },
      include: {
        user: userId ? {
          select: {
            id: true,
            name: true,
            email: true
          }
        } : false
      }
    });

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('Validation error details:', error.errors);
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
      return;
    }

    console.error('Feedback creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error during feedback submission' 
    });
  }
});

// Get all approved feedbacks (public)
router.get('/feedbacks', async (_req: Request, res: Response): Promise<void> => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: {
        status: 'APPROVED'
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Limit to 20 most recent approved feedbacks
    });

    res.json({
      feedbacks: feedbacks.map(feedback => ({
        id: feedback.id,
        name: feedback.name,
        message: feedback.message,
        rating: feedback.rating,
        createdAt: feedback.createdAt
      }))
    });

  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching feedbacks' 
    });
  }
});

// Get all feedbacks for admin (with auth)
router.get('/admin/feedbacks', requireStaff, async (_req: Request, res: Response): Promise<void> => {
  try {
    const feedbacks = await prisma.feedback.findMany({
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
        createdAt: 'desc'
      }
    });

    res.json({
      feedbacks
    });

  } catch (error) {
    console.error('Error fetching all feedbacks:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching feedbacks' 
    });
  }
});

// Update feedback status (admin only)
router.patch('/admin/feedback/:id/status', requireStaff, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({
        error: 'Invalid status. Must be PENDING, APPROVED, or REJECTED'
      });
      return;
    }

    const feedback = await prisma.feedback.update({
      where: { id },
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
      message: 'Feedback status updated successfully',
      feedback
    });

  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({ 
      error: 'Internal server error while updating feedback status' 
    });
  }
});

export default router;
