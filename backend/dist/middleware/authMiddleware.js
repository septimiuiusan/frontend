"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOwnershipOrStaff = exports.requireCustomerOrAbove = exports.requireCashier = exports.requireKitchen = exports.requireStaff = exports.requireManager = exports.requireAdmin = exports.authorizeRole = exports.authenticateUser = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const prisma = new client_1.PrismaClient();
dotenv_1.default.config();
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    if (!token) {
        res.sendStatus(401);
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            res.sendStatus(403);
            return;
        }
        if (!decoded) {
            res.sendStatus(401);
            return;
        }
        try {
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
            req.user = user;
            next();
        }
        catch (error) {
            console.error('Auth middleware error:', error);
            res.sendStatus(500);
        }
    });
};
exports.authenticateToken = authenticateToken;
const authenticateUser = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
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
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
};
exports.authenticateUser = authenticateUser;
const authorizeRole = (roles) => {
    return (req, res, next) => {
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
exports.authorizeRole = authorizeRole;
exports.requireAdmin = (0, exports.authorizeRole)(['ADMIN']);
exports.requireManager = (0, exports.authorizeRole)(['ADMIN', 'MANAGER']);
exports.requireStaff = (0, exports.authorizeRole)(['ADMIN', 'MANAGER', 'CASHIER', 'CHEF']);
exports.requireKitchen = (0, exports.authorizeRole)(['ADMIN', 'CHEF']);
exports.requireCashier = (0, exports.authorizeRole)(['ADMIN', 'MANAGER', 'CASHIER']);
exports.requireCustomerOrAbove = (0, exports.authorizeRole)(['CUSTOMER', 'CASHIER', 'CHEF', 'MANAGER', 'ADMIN']);
const requireOwnershipOrStaff = (req, res, next) => {
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
exports.requireOwnershipOrStaff = requireOwnershipOrStaff;
//# sourceMappingURL=authMiddleware.js.map