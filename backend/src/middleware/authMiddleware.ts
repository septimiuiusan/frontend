import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

dotenv.config();

// Enhanced authentication middleware with database lookup
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, async (err: any, decoded: any) => {
    if (err) {
      res.sendStatus(403);
      return;
    }

    if (!decoded) {
      res.sendStatus(401);
      return;
    }

    try {
      // Get fresh user data from database to ensure role is current
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      });

      if (!user) {
        res.sendStatus(401);
        return;
      }

      // Set user info with current role from database
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.sendStatus(500);
    }
  });
};

// Simple header-based auth for development (use JWT in production)
export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid user' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Enhanced role authorization with detailed permissions
export const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    
    if (!userRole) {
      res.status(401).json({ 
        error: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(userRole)) {
      res.status(403).json({ 
        error: 'Access denied',
        message: `This action requires one of the following roles: ${roles.join(', ')}`,
        userRole: userRole,
        requiredRoles: roles
      });
      return;
    }
    next();
  };
};

// Convenience middleware functions for specific access levels
export const requireAdmin = authorizeRole(['ADMIN']);
export const requireManager = authorizeRole(['ADMIN', 'MANAGER']);
export const requireStaff = authorizeRole(['ADMIN', 'MANAGER', 'CASHIER', 'CHEF']);
export const requireKitchen = authorizeRole(['ADMIN', 'CHEF']);
export const requireCashier = authorizeRole(['ADMIN', 'MANAGER', 'CASHIER']);
export const requireCustomerOrAbove = authorizeRole(['CUSTOMER', 'CASHIER', 'CHEF', 'MANAGER', 'ADMIN']);

// Check if user can access their own data or has staff privileges
export const requireOwnershipOrStaff = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const targetUserId = req.params.userId;
  const isOwner = req.user.id === targetUserId;
  const isStaff = ['ADMIN', 'MANAGER', 'CASHIER', 'CHEF'].includes(req.user.role);

  if (!isOwner && !isStaff) {
    res.status(403).json({ 
      error: 'Access denied', 
      message: 'You can only access your own data or must be staff'
    });
    return;
  }

  next();
};
