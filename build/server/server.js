"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 13337;
app.use(express_1.default.json());
// API Routes
app.get('/api/message', (req, res) => {
    const message = {
        id: 1,
        content: 'Hello from the server!',
        timestamp: new Date()
    };
    const response = {
        success: true,
        data: message
    };
    res.json(response);
});
// Serve static files from the frontend build
app.use(express_1.default.static(path_1.default.join(__dirname, '../front')));
// Fallback route for SPA
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../front/index.html'));
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
