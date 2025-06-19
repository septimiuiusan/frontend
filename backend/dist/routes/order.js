"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const orderItemSchema = zod_1.z.object({
    itemId: zod_1.z.string().min(1, 'Item ID is required'),
    quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1')
});
const orderSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, 'User ID is required'),
    items: zod_1.z.array(orderItemSchema).min(1, 'At least one item is required')
});
router.post('/order', authMiddleware_1.authenticateUser, async (req, res) => {
    try {
        const { userId, items } = orderSchema.parse(req.body);
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            res.status(404).json({
                error: 'User not found'
            });
            return;
        }
        const menuItems = [
            { id: 'ribeye', name: 'Ribeye Steak', price: 32.99 },
            { id: 'filet', name: 'Filet Mignon', price: 42.99 },
            { id: 'wine', name: 'House Wine', price: 8.99 },
            { id: 'sides', name: 'Garlic Mashed Potatoes', price: 6.99 }
        ];
        let total = 0;
        items.forEach(item => {
            const menuItem = menuItems.find(m => m.id === item.itemId);
            if (!menuItem) {
                throw new Error(`Menu item ${item.itemId} not found`);
            }
            total += menuItem.price * item.quantity;
        });
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
router.get('/orders/:userId', authMiddleware_1.authenticateUser, authMiddleware_1.requireOwnershipOrStaff, async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            res.status(404).json({
                error: 'User not found'
            });
            return;
        }
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
    }
    catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({
            error: 'Internal server error while fetching orders'
        });
    }
});
router.get('/orders', authMiddleware_1.authenticateUser, authMiddleware_1.requireStaff, async (_req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({
            error: 'Internal server error while fetching orders'
        });
    }
});
exports.default = router;
//# sourceMappingURL=order.js.map