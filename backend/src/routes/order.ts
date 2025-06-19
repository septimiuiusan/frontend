import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateUser, requireOwnershipOrStaff, requireStaff } from '../middleware/authMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Validation schema
const orderItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1')
});

const orderSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  items: z.array(orderItemSchema).min(1, 'At least one item is required')
});

// Create order (customers can create their own orders)
router.post('/order', authenticateUser, async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate input
    const { userId, items } = orderSchema.parse(req.body);

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ 
        error: 'User not found' 
      });
      return;
    }

    // Menu items matching the frontend Order component
    const menuItems = [
      // Starters
      { id: '1', name: 'Burrata with Heirloom Tomatoes', price: 12.50 },
      { id: '2', name: 'Beef Carpaccio', price: 15.20 },
      { id: '3', name: 'Foie Gras Torchon', price: 19.60 },
      { id: '4', name: 'Lobster Bisque', price: 16.90 },
      
      // Steaks
      { id: '5', name: 'Dry-Aged Ribeye', price: 64.20 },
      { id: '6', name: 'Wagyu Tenderloin', price: 87.30 },
      { id: '7', name: 'Roasted Duck Breast', price: 48.10 },
      { id: '8', name: 'Pan-Seared Sea Bass', price: 56.20 },
      { id: '9', name: 'Truffle Tagliatelle', price: 39.20 },
      
      // Sides
      { id: '10', name: 'Truffle Mac & Cheese', price: 14.30 },
      { id: '11', name: 'Roasted Asparagus', price: 10.70 },
      { id: '12', name: 'Garlic Mashed Potatoes', price: 8.90 },
      { id: '13', name: 'Grilled Vegetables', price: 12.50 },
      
      // Desserts
      { id: '14', name: 'Vanilla Bean Panna Cotta', price: 12.50 },
      { id: '15', name: '72% Dark Chocolate Fondant', price: 14.30 },
      { id: '16', name: 'Lemon Basil Tart', price: 10.70 },
      { id: '17', name: 'Tiramisu Classico', price: 11.60 },
      
      // Wines
      { id: '18', name: 'Château Margaux 2015', price: 133.80 },
      { id: '19', name: 'Dom Pérignon Vintage 2012', price: 107.00 },
      { id: '20', name: 'Caymus Cabernet Sauvignon', price: 75.80 },
      { id: '21', name: 'Sancerre Loire Valley', price: 58.00 },
      
      // Drinks
      { id: '22', name: 'Still Mineral Water', price: 5.40 },
      { id: '23', name: 'Sommelier\'s Pairing Flight', price: 40.10 },
      { id: '24', name: 'Craft Coffee', price: 7.10 },
      { id: '25', name: 'Herbal Tea Selection', price: 6.20 }
    ];

    let total = 0;
    // Calculate total without storing individual items
    items.forEach(item => {
      const menuItem = menuItems.find(m => m.id === item.itemId);
      if (!menuItem) {
        throw new Error(`Menu item ${item.itemId} not found`);
      }
      total += menuItem.price * item.quantity;
    });

    // Create order without items (simplified)
    const order = await prisma.order.create({
      data: {
        userId,
        total
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
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
      return;
    }

    if (error instanceof Error && error.message.includes('Menu item')) {
      res.status(400).json({
        error: error.message
      });
      return;
    }

    console.error('Order creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error during order creation' 
    });
  }
});

// Get user orders
// Get user orders (users can only see their own, staff can see all)
router.get('/orders/:userId', authenticateUser, requireOwnershipOrStaff, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ 
        error: 'User not found' 
      });
      return;
    }

    // Get user's orders
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      message: 'Orders retrieved successfully',
      orders
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching orders' 
    });
  }
});

// Get all orders (for kitchen/staff view)
router.get('/orders', authenticateUser, requireStaff, async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
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
      message: 'All orders retrieved successfully',
      orders
    });

  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ 
      error: 'Internal server error while fetching orders' 
    });
  }
});

// Update order status (for kitchen/chef use)
router.patch('/orders/:orderId/status', authenticateUser, requireStaff, async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ 
        error: 'Invalid status',
        validStatuses 
      });
      return;
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!existingOrder) {
      res.status(404).json({ 
        error: 'Order not found' 
      });
      return;
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
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
      message: 'Order status updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      error: 'Internal server error while updating order status' 
    });
  }
});

export default router;