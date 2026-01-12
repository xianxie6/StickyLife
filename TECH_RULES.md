# StickyLife 技术规则文档

## 📋 项目概述

**StickyLife** 是一个跨平台桌面便签应用，采用透明窗口、始终置顶和点击穿透技术，实现桌面小部件效果。

---

## 🛠️ 技术栈

### 核心框架
- **前端框架**: React 18.2.0
- **语言**: TypeScript 5.2.0
- **桌面框架**: Electron 28.0.0
- **构建工具**: Vite 5.0.0

### UI 与样式
- **CSS 框架**: Tailwind CSS 3.4.19
- **动画库**: Framer Motion 12.25.0
- **图标库**: Lucide React 0.562.0
- **拖拽**: React DnD 16.0.1

### 3D 渲染
- **3D 库**: Three.js 0.182.0（用于 Neno 吉祥物）

### 构建与打包
- **打包工具**: Electron Builder 24.9.1
- **CSS 处理**: PostCSS 8.5.6 + Autoprefixer 10.4.23

---

## 📁 项目结构

```
StickyLife/
├── electron/              # Electron 主进程
│   ├── main.ts           # 主进程入口（窗口配置、IPC）
│   ├── preload.ts        # 预加载脚本（安全桥接）
│   └── tsconfig.json     # Electron TS 配置
│
├── src/                   # React 前端代码
│   ├── components/        # 组件
│   │   ├── DesktopWidget.tsx    # 桌面模式主组件
│   │   ├── MergedFocusCard.tsx  # 合并的12周+今日聚焦卡片
│   │   ├── TodayFocusArea.tsx   # 今日聚焦区域
│   │   ├── KRTaskCard.tsx       # 关键结果卡片
│   │   └── NenoFigma.tsx        # Neno 吉祥物组件
│   │
│   ├── types/            # TypeScript 类型定义
│   │   └── index.ts      # StickyNote, WeekKR, NenoMood
│   │
│   ├── App.tsx           # 应用主入口
│   ├── App.css           # 应用样式
│   ├── index.css         # 全局样式（Tailwind + 自定义）
│   ├── main.tsx          # React 入口
│   └── electron.d.ts     # Electron API 类型声明
│
├── dist/                 # 构建后的前端文件
├── dist-electron/        # 构建后的 Electron 主进程
├── release/              # 打包后的应用（DMG/EXE）
│
├── package.json          # 项目配置和依赖
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts        # Vite 配置
├── tailwind.config.js    # Tailwind CSS 配置
└── postcss.config.js     # PostCSS 配置
```

---

## 🎨 设计系统

### 颜色规范
```css
--color-neno-yellow: #FFF9C4    /* 便签黄色（主色）*/
--color-week-white: #F7F9F9     /* 周计划白色 */
--color-year-kraft: #E0C9A6     /* 年度视图牛皮纸色 */
--color-ink-gray: #2D3436       /* 文字灰色 */
--color-coral-pink: #FF7675     /* 珊瑚粉（狗耳朵）*/
--color-sage-green: #55EFC4     /* 鼠尾草绿（完成状态）*/
```

### 字体规范
- **手写字体**: 'Caveat', 'Patrick Hand', 'Kalam'（用于便签内容）
- **系统字体**: Inter, Segoe UI, -apple-system（用于 UI 元素）

### 设计风格
- **美学**: "Skeuomorphism Ultra"（超写实主义）
- **效果**: 毛玻璃（Frosted Glass）+ 纸张纹理（Paper Texture）
- **氛围**: Cozy（舒适）、Tactile（触感）、Airy（透气）

### 样式类
- `.glass-surface`: 毛玻璃效果
- `.paper-texture`: 纸张纹理
- `.handwritten`: 手写字体样式
- `.sticky-note`: 便签基础样式
- `.dog-ear`: 狗耳朵折角效果

---

## ⚙️ 开发规范

### TypeScript 配置
- **目标版本**: ES2020
- **模块系统**: ESNext
- **JSX**: React JSX（自动导入）
- **严格模式**: 关闭（`strict: false`，兼容旧代码）

### 代码组织
- **组件**: 使用函数式组件 + Hooks
- **状态管理**: React useState/useReducer + localStorage
- **类型定义**: 统一在 `src/types/index.ts`
- **样式**: Tailwind CSS 类名 + 自定义 CSS

### 命名规范
- **组件**: PascalCase（如 `DesktopWidget.tsx`）
- **文件**: kebab-case 或 PascalCase（与组件名一致）
- **变量/函数**: camelCase
- **类型/接口**: PascalCase

---

## 🚀 构建与打包

### 开发命令
```bash
npm run dev              # 仅启动 Vite 开发服务器
npm run electron:dev     # 启动 Vite + Electron（推荐）
```

### 构建命令
```bash
npm run build            # 构建前端（TypeScript + Vite）
npm run build:electron   # 构建 Electron 主进程
npm run build:all        # 构建前端 + Electron
npm run electron:build   # 完整打包（生成 DMG/EXE）
```

### 打包配置
- **macOS**: DMG + ZIP（需要 `build/icon.icns`）
- **Windows**: NSIS 安装程序 + ZIP（需要 `build/icon.ico`）
- **Linux**: AppImage + DEB（需要 `build/icon.png`）

---

## 🔧 Electron 配置

### 窗口设置
```typescript
{
  transparent: true,      // 透明窗口
  frame: false,          // 无边框
  alwaysOnTop: true,     // 始终置顶
  skipTaskbar: false,    // 在任务栏显示（开发时）
  resizable: true,       // 可调整大小
}
```

### 安全设置
```typescript
{
  nodeIntegration: false,        // 禁用 Node.js 集成
  contextIsolation: true,         // 启用上下文隔离
  webSecurity: false,             // 允许透明窗口（开发）
  preload: 'preload.js'          // 预加载脚本
}
```

### IPC 通信
- **主进程 → 渲染进程**: 通过 `preload.ts` 暴露 API
- **渲染进程 → 主进程**: 通过 `window.electronAPI` 调用
- **当前 API**: `setIgnoreCursorEvents(ignore: boolean)` - 设置点击穿透

---

## 📦 数据模型

### StickyNote（便签）
```typescript
interface StickyNote {
  id: string;
  content: string;
  layer: 'daily' | 'weekly' | 'yearly';
  date: string;              // ISO 日期字符串
  color?: string;
  completed?: boolean;
  migrationCount?: number;    // 顺延次数
  createdAt: string;
  parentKRId?: string;        // 关联的 KeyResult ID
}
```

### WeekKR（周关键结果）
```typescript
interface WeekKR {
  id: string;
  week: number;              // 周序号（1-12）
  title: string;
  description: string;
  progress: number;          // 进度百分比（0-100）
  dailyTasksCompleted: number;
  totalDailyTasks: number;
}
```

### 数据存储
- **存储方式**: localStorage
- **键名**: 
  - `stickylife-notes`: 便签列表
  - `stickylife-completed`: 已完成的便签

---

## 🎯 核心功能

### 桌面模式（DesktopWidget）
- 透明窗口，显示桌面壁纸
- 毛玻璃卡片（居中底部）
- 12 周进度圆点导航
- 周详情展开（点击圆点）
- 今日聚焦便签区域
- Neno 吉祥物（左下角）

### 交互功能
- **点击穿透**: 鼠标移出便签区域时，窗口忽略鼠标事件
- **拖拽**: 支持便签拖拽（React DnD）
- **编辑**: 双击便签编辑内容
- **完成**: 点击完成按钮标记任务完成
- **删除**: 点击删除按钮移除便签

---

## 🔒 安全与性能

### 安全
- ✅ 上下文隔离（Context Isolation）
- ✅ 禁用 Node.js 集成
- ✅ 预加载脚本桥接
- ✅ 内容安全策略（CSP）

### 性能
- ✅ Vite 快速构建
- ✅ 代码分割（自动）
- ✅ Tree Shaking（自动）
- ✅ 生产环境优化

---

## 📝 开发注意事项

### 必须遵循
1. **类型安全**: 使用 TypeScript 类型定义
2. **组件复用**: 提取可复用组件
3. **样式统一**: 使用 Tailwind 类名 + 设计系统颜色
4. **数据持久化**: 使用 localStorage 保存用户数据

### 避免
- ❌ 直接使用 `window.electronAPI` 而不检查是否存在
- ❌ 硬编码样式值（使用设计系统变量）
- ❌ 在组件中直接操作 DOM（使用 React 状态）

---

## 🌐 跨平台支持

### 已支持
- ✅ macOS（Intel + Apple Silicon）
- ✅ Windows（10/11）
- ✅ Linux（AppImage + DEB）

### 平台差异处理
- **点击穿透**: 使用 Electron 的 `setIgnoreMouseEvents`
- **窗口样式**: 各平台自动适配
- **图标格式**: 各平台使用对应格式（.icns/.ico/.png）

---

## 📚 依赖管理

### 生产依赖
- React 生态系统
- Electron
- Three.js
- Framer Motion
- React DnD

### 开发依赖
- TypeScript
- Vite + 插件
- Tailwind CSS + PostCSS
- Electron Builder

### 版本锁定
- 使用 `package-lock.json` 锁定版本
- 定期更新依赖（注意破坏性变更）

---

## 🚨 已知问题

1. **图标缺失**: 打包需要 `build/icon.icns`（macOS）和 `build/icon.ico`（Windows）
2. **旧组件**: 部分旧组件（WeekDetail、TodayFocus 等）已废弃但未删除
3. **类型检查**: TypeScript 严格模式已关闭，部分类型未完全定义

---

## 📖 参考资源

- [Electron 文档](https://www.electronjs.org/docs)
- [React 文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Framer Motion 文档](https://www.framer.com/motion)
- [Vite 文档](https://vitejs.dev)

---

**最后更新**: 2025-01-11
**项目版本**: 0.1.0
