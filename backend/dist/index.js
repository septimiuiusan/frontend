"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const signup_1 = __importDefault(require("./routes/signup"));
const auth_1 = __importDefault(require("./routes/auth"));
const order_1 = __importDefault(require("./routes/order"));
const reservation_1 = __importDefault(require("./routes/reservation"));
const staff_1 = __importDefault(require("./routes/staff"));
const contact_1 = __importDefault(require("./routes/contact"));
const users_1 = __importDefault(require("./routes/users"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api', signup_1.default);
app.use('/api', auth_1.default);
app.use('/api', order_1.default);
app.use('/api', reservation_1.default);
app.use('/api', staff_1.default);
app.use('/api', contact_1.default);
app.use('/api', users_1.default);
app.get('/', (_req, res) => {
    res.json({
        message: 'Steakz Restaurant API',
        endpoints: [
            'POST /api/signup',
            'POST /api/login',
            'POST /api/order',
            'GET /api/orders/:userId',
            'POST /api/reservation',
            'GET /api/reservations',
            'GET /api/reservations/:userId',
            'POST /api/create-cashier',
            'POST /api/create-chef',
            'POST /api/create-admin',
            'POST /api/contact',
            'GET /api/contacts',
            'GET /api/contacts/status/:status',
            'PATCH /api/contact/:id/status'
        ]
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map