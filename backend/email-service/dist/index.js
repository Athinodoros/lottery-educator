"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3003;
// Middleware
app.use(express_1.default.json());
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'email-service', timestamp: new Date().toISOString() });
});
// TODO: Implement email endpoints
// POST /emails - Submit contact form
// DELETE /emails/:id - Delete email (GDPR compliance)
// GET /emails - Get all emails (admin only)
app.listen(port, () => {
    console.log(`Email Service running on port ${port}`);
});
