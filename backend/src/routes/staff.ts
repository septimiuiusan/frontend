import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Create Cashier
router.post('/create-cashier', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ 
        error: 'Name, email, and password are required' 
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const cashier = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'CASHIER' as any
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.status(201).json({
      message: 'Cashier created successfully',
      user: cashier
    });

  } catch (error) {
    console.error('Cashier creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Chef
router.post('/create-chef', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ 
        error: 'Name, email, and password are required' 
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const chef = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'CHEF' as any
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.status(201).json({
      message: 'Chef created successfully',
      user: chef
    });

  } catch (error) {
    console.error('Chef creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Admin
router.post('/create-admin', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ 
        error: 'Name, email, and password are required' 
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN' as any
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    res.status(201).json({
      message: 'Admin created successfully',
      user: admin
    });

  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
