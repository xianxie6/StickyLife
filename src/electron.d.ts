// Electron API 类型声明
export {};

declare global {
  interface Window {
    electronAPI?: {
      setIgnoreCursorEvents: (ignore: boolean) => Promise<{ success: boolean }>;
      hideWindow: () => Promise<{ success: boolean }>;
      resizeWindow: (width: number, height: number) => Promise<{ success: boolean }>;
    };
  }
}


