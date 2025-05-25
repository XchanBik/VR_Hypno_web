import { app, BrowserWindow } from 'electron'
import path from 'path'
import { spawn } from 'child_process'

let mainWindow: BrowserWindow | null = null
let serverProcess: any = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.loadURL('http://localhost:13337')
}

function startServer() {
  const serverPath = path.join(__dirname, '../server/server.js')
  serverProcess = spawn('node', [serverPath], {
    stdio: 'inherit'
  })

  serverProcess.on('error', (err: Error) => {
    console.error('Failed to start server:', err)
  })
}

app.whenReady().then(() => {
  startServer()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (serverProcess) {
      serverProcess.kill()
    }
    app.quit()
  }
}) 