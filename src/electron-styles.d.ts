// Electron-specific CSS properties
import 'react';

declare module 'react' {
  interface CSSProperties {
    WebkitAppRegion?: 'drag' | 'no-drag';
    webkitAppRegion?: 'drag' | 'no-drag';
  }
}
