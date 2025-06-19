"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
router.post('/create-cashier', async (req, res) => {
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
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        const cashier = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'CASHIER'
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
    }
    catch (error) {
        console.error('Cashier creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/create-chef', async (req, res) => {
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
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        const chef = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'CHEF'
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
    }
    catch (error) {
        console.error('Chef creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/create-admin', async (req, res) => {
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
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        const admin = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'ADMIN'
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
    }
    catch (error) {
        console.error('Admin creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=staff.js.map