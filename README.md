# StickyLife - 桌面便签应用

一个使用 **Electron + React + TypeScript** 构建的跨平台桌面便签应用，支持透明窗口、始终置顶和点击穿透功能。

> ✅ **技术栈统一为 Electron**，支持 macOS、Windows、Linux 多平台。

## 技术栈

- **前端框架**: React 18 + TypeScript 5.2
- **构建工具**: Vite 5
- **桌面框架**: Electron 28
- **UI 框架**: Tailwind CSS 3.4 + Framer Motion 12
- **3D 渲染**: Three.js 0.182
- **拖拽**: React DnD 16

## 功能特性

- ✅ 透明窗口，始终置顶
- ✅ 点击穿透（鼠标悬停在便签上才可交互）
- ✅ 无边框设计
- ✅ 可拖拽主卡片
- ✅ 12 周计划进度追踪
- ✅ 今日聚焦任务管理
- ✅ Focus State Indicator（呼吸动画指示器）
- ✅ 跨平台支持（Windows、macOS、Linux）

## 开发

### 安装依赖

```bash
npm install
```

### 开发模式

启动开发服务器和 Electron：

```bash
npm run electron:dev
```

这会同时启动：
- Vite 开发服务器（http://localhost:5173）
- Electron 应用窗口

### 构建

#### 仅构建前端

```bash
npm run build
```

#### 构建 Electron 主进程

```bash
npm run build:electron
```

#### 构建所有（前端 + Electron）

```bash
npm run build:all
```

#### 打包应用

```bash
npm run electron:build
```

打包后的应用会在 `release` 目录中。

## 项目结构

```
StickyLife/
├── electron/          # Electron 主进程代码
│   ├── main.ts       # 主进程入口
│   ├── preload.ts    # 预加载脚本
│   └── tsconfig.json # Electron TypeScript 配置
├── src/              # React 前端代码
│   ├── App.tsx       # 主组件
│   ├── App.css       # 样式文件
│   ├── main.tsx      # React 入口
│   └── electron.d.ts # Electron API 类型声明
├── dist/             # 构建后的前端文件
├── dist-electron/    # 构建后的 Electron 主进程文件
└── release/          # 打包后的应用
```

## 平台支持

- **macOS**: DMG 和 ZIP
- **Windows**: NSIS 安装程序和 ZIP
- **Linux**: AppImage 和 DEB

## 注意事项

- 首次运行打包的应用时，macOS 可能会提示安全警告，需要在系统设置中允许运行
- 应用默认设置为透明、无边框、始终置顶，适合作为桌面便签使用


