import { app, BrowserWindow, ipcMain } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 保持窗口对象的全局引用
let mainWindow: BrowserWindow | null = null;

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    transparent: true, // 透明窗口
    frame: false, // 无边框
    alwaysOnTop: false, // 不始终置顶，允许用户切换到其他程序
    skipTaskbar: false, // 在任务栏显示（开发时方便查看）
    resizable: true,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // 允许透明窗口正常工作
    },
  });

  // 根据环境加载不同的内容
  if (process.env.NODE_ENV === 'development') {
    // 开发环境：加载 Vite 开发服务器
    mainWindow.loadURL('http://localhost:5173');
    // 打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境：加载构建后的文件
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }

  // 默认不点击穿透，让React可以处理鼠标事件
  // 点击穿透将通过CSS的pointer-events控制
  mainWindow.setIgnoreMouseEvents(false);

  // 窗口关闭时
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 当 Electron 完成初始化并准备创建浏览器窗口时调用
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // 在 macOS 上，当点击 dock 图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 当所有窗口都被关闭时退出应用（除了 macOS）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 处理：设置是否忽略鼠标事件
ipcMain.handle('set-ignore-cursor-events', (_event, ignore: boolean) => {
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
    return { success: true };
  }
  return { success: false };
});

