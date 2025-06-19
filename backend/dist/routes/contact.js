"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const authMiddleware_1 = require("../middleware/authMiddleware");
const prisma_1 = __importDefault(require("../utils/prisma"));
const router = (0, express_1.Router)();
const contactSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').max(100, 'Name too long'),
    email: zod_1.z.string().email('Invalid email format'),
    message: zod_1.z.string().min(1, 'Message is required').max(1000, 'Message too long'),
    userId: zod_1.z.string().optional()
});
router.post('/contact', async (req, res) => {
    try {
        const { name, email, message, userId } = contactSchema.parse(req.body);
        if (userId) {
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
        }
        const contact = await prisma_1.default.contact.create({
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
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
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
router.get('/contacts', authMiddleware_1.authenticateUser, authMiddleware_1.requireStaff, async (_req, res) => {
    try {
        const contacts = await prisma_1.default.contact.findMany({
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
    }
    catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/contacts/status/:status', async (req, res) => {
    try {
        const { status } = req.params;
        if (!['PENDING', 'REVIEWED', 'RESOLVED'].includes(status.toUpperCase())) {
            res.status(400).json({ error: 'Invalid status. Must be PENDING, REVIEWED, or RESOLVED' });
            return;
        }
        const contacts = await prisma_1.default.contact.findMany({
            where: {
                status: status.toUpperCase()
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
    }
    catch (error) {
        console.error('Error fetching contacts by status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.patch('/contact/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['PENDING', 'REVIEWED', 'RESOLVED'].includes(status?.toUpperCase())) {
            res.status(400).json({ error: 'Invalid status. Must be PENDING, REVIEWED, or RESOLVED' });
            return;
        }
        const contact = await prisma_1.default.contact.update({
            where: { id },
            data: {
                status: status.toUpperCase()
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
    }
    catch (error) {
        console.error('Error updating contact status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=contact.js.map