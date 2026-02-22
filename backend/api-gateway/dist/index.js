"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
});
// Service routing
const services = {
    gameEngine: process.env.GAME_ENGINE_URL || 'http://localhost:3001',
    statistics: process.env.STATISTICS_URL || 'http://localhost:3002',
    emailService: process.env.EMAIL_SERVICE_URL || 'http://localhost:3003',
    metricsService: process.env.METRICS_SERVICE_URL || 'http://localhost:3004',
};
// Proxy middleware for game engine
app.use('/api/games', async (req, res) => {
    try {
        const response = await (0, axios_1.default)({
            method: req.method,
            url: `${services.gameEngine}/games${req.path.substring(5)}`,
            data: req.body,
            headers: req.headers,
        });
        res.status(response.status).json(response.data);
    }
    catch (error) {
        res.status(error.response?.status || 500).json({
            error: 'Game Engine Service Error',
            message: error.message,
        });
    }
});
// Proxy middleware for statistics
app.use('/api/stats', async (req, res) => {
    try {
        const response = await (0, axios_1.default)({
            method: req.method,
            url: `${services.statistics}/stats${req.path.substring(10)}`,
            data: req.body,
            headers: req.headers,
        });
        res.status(response.status).json(response.data);
    }
    catch (error) {
        res.status(error.response?.status || 500).json({
            error: 'Statistics Service Error',
            message: error.message,
        });
    }
});
// Proxy middleware for emails
app.use('/api/emails', async (req, res) => {
    try {
        const response = await (0, axios_1.default)({
            method: req.method,
            url: `${services.emailService}/emails${req.path.substring(10)}`,
            data: req.body,
            headers: req.headers,
        });
        res.status(response.status).json(response.data);
    }
    catch (error) {
        res.status(error.response?.status || 500).json({
            error: 'Email Service Error',
            message: error.message,
        });
    }
});
// Proxy middleware for metrics
app.use('/api/metrics', async (req, res) => {
    try {
        const response = await (0, axios_1.default)({
            method: req.method,
            url: `${services.metricsService}/metrics${req.path.substring(11)}`,
            data: req.body,
            headers: req.headers,
        });
        res.status(response.status).json(response.data);
    }
    catch (error) {
        res.status(error.response?.status || 500).json({
            error: 'Metrics Service Error',
            message: error.message,
        });
    }
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.path });
});
// Error handler
app.use((err, req, res) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});
app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});
