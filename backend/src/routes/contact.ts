import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticateUser, requireStaff } from '../middleware/authMiddleware';
import prisma from '../utils/prisma';

const router = Router();

// Validation schema for contact form
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  userId: z.string().optional() // Optional - for logged in users
});

// Create new contact message
router.post('/contact', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, message, userId } = contactSchema.parse(req.body);

    // If userId provided, verify user exists
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
    }

    // Create contact message
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        message,
        userId: userId || null,
        status: 'PENDING'
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
      message: 'Contact message sent successfully',
      contact
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
      return;
    }

    console.error('Contact creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all contact messages (for admin/staff view)
// Get all contact messages (for admin/staff view only)
router.get('/contacts', authenticateUser, requireStaff, async (_req: Request, res: Response): Promise<void> => {
  try {
    const contacts = await prisma.contact.findMany({
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
      message: 'Contact messages retrieved successfully',
      contacts
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get contact messages by status
router.get('/contacts/status/:status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.params;
    
    if (!['PENDING', 'REVIEWED', 'RESOLVED'].includes(status.toUpperCase())) {
      res.status(400).json({ error: 'Invalid status. Must be PENDING, REVIEWED, or RESOLVED' });
      return;
    }

    const contacts = await prisma.contact.findMany({
      where: {
        status: status.toUpperCase() as 'PENDING' | 'REVIEWED' | 'RESOLVED'
      },
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
      message: `Contact messages with status ${status} retrieved successfully`,
      contacts
    });

  } catch (error) {
    console.error('Error fetching contacts by status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contact status (for admin/staff)
router.patch('/contact/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'REVIEWED', 'RESOLVED'].includes(status?.toUpperCase())) {
      res.status(400).json({ error: 'Invalid status. Must be PENDING, REVIEWED, or RESOLVED' });
      return;
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        status: status.toUpperCase() as 'PENDING' | 'REVIEWED' | 'RESOLVED'
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

    res.json({
      message: 'Contact status updated successfully',
      contact
    });

  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
