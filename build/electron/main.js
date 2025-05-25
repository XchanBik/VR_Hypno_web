"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
let mainWindow = null;
let serverProcess = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadURL('http://localhost:13337');
}
function startServer() {
    const serverPath = path_1.default.join(__dirname, '../server/server.js');
    serverProcess = (0, child_process_1.spawn)('node', [serverPath], {
        stdio: 'inherit'
    });
    serverProcess.on('error', (err) => {
        console.error('Failed to start server:', err);
    });
}
electron_1.app.whenReady().then(() => {
    startServer();
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (serverProcess) {
            serverProcess.kill();
        }
        electron_1.app.quit();
    }
});
