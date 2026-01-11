import { contextBridge, ipcRenderer } from 'electron';

// 暴露受保护的方法给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  setIgnoreCursorEvents: (ignore: boolean) =>
    ipcRenderer.invoke('set-ignore-cursor-events', ignore),
});

// 类型声明（供 TypeScript 使用）
declare global {
  interface Window {
    electronAPI: {
      setIgnoreCursorEvents: (ignore: boolean) => Promise<{ success: boolean }>;
    };
  }
}


