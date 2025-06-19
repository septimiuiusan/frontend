"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDeleteUser = exports.adminChangeRole = exports.adminUpdateUser = exports.adminCreateUser = exports.getUserById = exports.getAllUsers = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const hash_1 = require("../utils/hash");
const getAllUsers = async (req, res) => {
    try {
        const user = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalCount = await prisma_1.default.user.count({
            where: user.role === 'WRITER' ? { role: 'WRITER' } : undefined
        });
        const users = await prisma_1.default.user.findMany({
            where: user.role === 'WRITER' ? { role: 'WRITER' } : undefined,
            select: {
                id: true,
                username: true,
                role: true,
                createdAt: true,
                createdBy: {
                    select: {
                        username: true
                    }
                },
                posts: {
                    select: {
                        id: true,
                        title: true,
                        createdAt: true
                    }
                },
                _count: {
                    select: {
                        posts: true,
                        comments: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });
        res.json({
            users,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
        });
    }
    catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const requestingUser = req.user;
        const targetUser = await prisma_1.default.user.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                username: true,
                role: true,
                createdAt: true,
                createdBy: {
                    select: {
                        username: true
                    }
                },
                posts: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        createdAt: true,
                        _count: {
                            select: {
                                comments: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        posts: true,
                        comments: true
                    }
                }
            }
        });
        if (!targetUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (requestingUser.role === 'WRITER' && targetUser.role !== 'WRITER') {
            res.status(403).json({ message: 'Unauthorized to view this user' });
            return;
        }
        res.json(targetUser);
    }
    catch (error) {
        console.error('Error in getUserById:', error);
        res.status(500).json({ message: 'Error fetching user details' });
    }
};
exports.getUserById = getUserById;
const adminCreateUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const adminUser = req.user;
        if (!username?.trim() || !password?.trim()) {
            res.status(400).json({ message: 'Username and password are required' });
            return;
        }
        if (role && !['ADMIN', 'WRITER'].includes(role)) {
            res.status(400).json({ message: 'Invalid role specified' });
            return;
        }
        const existingUser = await prisma_1.default.user.findUnique({
            where: { username: username.trim() }
        });
        if (existingUser) {
            res.status(400).json({ message: 'Username already exists' });
            return;
        }
        const hashedPassword = await (0, hash_1.hashPassword)(password);
        const newUser = await prisma_1.default.user.create({
            data: {
                username: username.trim(),
                password: hashedPassword,
                role: role || 'WRITER',
                createdById: adminUser.id
            },
            select: {
                id: true,
                username: true,
                role: true,
                createdAt: true,
                createdBy: {
                    select: {
                        username: true
                    }
                }
            }
        });
        res.status(201).json({
            message: 'User created successfully',
            user: newUser
        });
    }
    catch (error) {
        console.error('Error in adminCreateUser:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
};
exports.adminCreateUser = adminCreateUser;
const adminUpdateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password } = req.body;
        const adminUser = req.user;
        if (!username?.trim() && !password?.trim()) {
            res.status(400).json({ message: 'No update data provided' });
            return;
        }
        const targetUser = await prisma_1.default.user.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                role: true,
                createdById: true
            }
        });
        if (!targetUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (targetUser.role === 'ADMIN' &&
            targetUser.id !== adminUser.id &&
            targetUser.createdById !== adminUser.id) {
            res.status(403).json({ message: 'Cannot modify other admin accounts' });
            return;
        }
        const updateData = {};
        if (username?.trim()) {
            const existingUser = await prisma_1.default.user.findUnique({
                where: { username: username.trim() }
            });
            if (existingUser && existingUser.id !== Number(id)) {
                res.status(400).json({ message: 'Username already exists' });
                return;
            }
            updateData.username = username.trim();
        }
        if (password?.trim()) {
            updateData.password = await (0, hash_1.hashPassword)(password);
        }
        const updatedUser = await prisma_1.default.user.update({
            where: { id: Number(id) },
            data: updateData,
            select: {
                id: true,
                username: true,
                role: true,
                updatedAt: true,
                createdBy: {
                    select: {
                        username: true
                    }
                }
            }
        });
        res.json({
            message: 'User updated successfully',
            user: updatedUser
        });
    }
    catch (error) {
        console.error('Error in adminUpdateUser:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
};
exports.adminUpdateUser = adminUpdateUser;
const adminChangeRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const adminUser = req.user;
        if (!role || !['ADMIN', 'WRITER'].includes(role)) {
            res.status(400).json({ message: 'Invalid role specified' });
            return;
        }
        const targetUser = await prisma_1.default.user.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                role: true,
                createdById: true
            }
        });
        if (!targetUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (Number(id) === adminUser.id) {
            res.status(400).json({ message: 'Cannot change your own role' });
            return;
        }
        if (targetUser.role === 'ADMIN' && targetUser.createdById !== adminUser.id) {
            res.status(403).json({ message: 'Cannot modify another admin\'s role' });
            return;
        }
        const updatedUser = await prisma_1.default.user.update({
            where: { id: Number(id) },
            data: { role },
            select: {
                id: true,
                username: true,
                role: true,
                updatedAt: true,
                createdBy: {
                    select: {
                        username: true
                    }
                }
            }
        });
        res.json({
            message: `User role updated to ${role}`,
            user: updatedUser
        });
    }
    catch (error) {
        console.error('Error in adminChangeRole:', error);
        res.status(500).json({ message: 'Error changing user role' });
    }
};
exports.adminChangeRole = adminChangeRole;
const adminDeleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const adminUser = req.user;
        const targetUser = await prisma_1.default.user.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                role: true,
                createdById: true,
                username: true
            }
        });
        if (!targetUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (Number(id) === adminUser.id) {
            res.status(400).json({ message: 'Cannot delete your own account' });
            return;
        }
        if (targetUser.role === 'ADMIN' && targetUser.createdById !== adminUser.id) {
            res.status(403).json({ message: 'Cannot delete another admin account' });
            return;
        }
        await prisma_1.default.user.delete({
            where: { id: Number(id) }
        });
        res.json({
            message: `User ${targetUser.username} and all associated data deleted successfully`
        });
    }
    catch (error) {
        console.error('Error in adminDeleteUser:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
};
exports.adminDeleteUser = adminDeleteUser;
//# sourceMappingURL=userController.js.map