"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdminUser = void 0;
const client_1 = require("@prisma/client");
const hash_1 = require("./hash");
const prisma = new client_1.PrismaClient();
const seedAdminUser = async () => {
    try {
        const adminExists = await prisma.user.findUnique({
            where: { username: 'admin' },
        });
        if (!adminExists) {
            const adminPassword = await (0, hash_1.hashPassword)('admin123');
            await prisma.user.create({
                data: {
                    username: 'admin',
                    password: adminPassword,
                    role: 'ADMIN',
                },
            });
            console.log('✅ Admin user created');
        }
        else {
            console.log('ℹ️ Admin user already exists');
        }
    }
    catch (error) {
        console.error('Error checking for admin user:', error);
        return;
    }
};
exports.seedAdminUser = seedAdminUser;
//# sourceMappingURL=seedAdmin.js.map