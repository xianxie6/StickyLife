# Tauri 持久化存储设置指南

本文档说明如何设置和使用 Tauri 持久化存储功能。

## 前提条件

1. 安装 Rust 和 Cargo
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   ```

2. 安装 Tauri CLI
   ```bash
   npm install -g @tauri-apps/cli
   # 或
   cargo install tauri-cli
   ```

## 安装步骤

### 1. 安装前端依赖

```bash
npm install tauri-plugin-store-api
```

### 2. 安装 Rust 依赖

Rust 依赖已在 `src-tauri/Cargo.toml` 中配置，运行以下命令安装：

```bash
cd src-tauri
cargo build
```

### 3. 运行开发环境

```bash
# 在项目根目录
npm run dev
# 在另一个终端
cd src-tauri
cargo tauri dev
```

## 数据存储位置

- **macOS**: `~/Library/Application Support/com.stickylife.app/sticky-data.json`
- **Windows**: `%APPDATA%\com.stickylife.app\sticky-data.json`
- **Linux**: `~/.config/com.stickylife.app/sticky-data.json`

## 数据结构

存储的数据结构如下：

```typescript
interface PersistentData {
  weeks: WeekKR[];           // 12周的关键结果
  tasks: StickyNote[];        // 所有任务（包括已完成）
  userSettings: {
    theme?: string;
    currentWeek?: number;
    completedWeeks?: number;
  };
}
```

## 使用方式

### 在组件中使用

```typescript
import { useStore } from '../store/useStore';

function MyComponent() {
  const { weeks, tasks, isLoading, updateWeeks, updateTasks } = useStore();
  
  // 更新周数据（自动保存）
  const handleUpdate = () => {
    updateWeeks(newWeeks);
  };
  
  // 更新任务数据（自动保存）
  const handleTaskUpdate = () => {
    updateTasks(newTasks);
  };
}
```

### 直接使用持久化 API

```typescript
import { loadData, saveData, saveWeeks, saveTasks } from '../store/persistence';

// 加载数据
const data = await loadData();

// 保存数据
await saveWeeks(weeksArray);
await saveTasks(tasksArray);
```

## 错误处理

- 如果文件不存在，系统会自动创建并使用默认数据
- 如果文件损坏或格式错误，系统会回退到默认数据
- 所有错误都会在控制台输出日志

## 从 Electron 迁移

如果项目当前使用 Electron，需要：

1. 安装 Tauri CLI 和 Rust
2. 运行 `npm install tauri-plugin-store-api`
3. 运行 `cd src-tauri && cargo build`
4. 使用 `cargo tauri dev` 替代 `npm run electron:dev`

## 注意事项

- 数据保存使用防抖机制（500ms），避免频繁写入
- 在非 Tauri 环境中（如浏览器开发），会自动回退到 localStorage
- 确保在 Tauri 环境中运行才能使用文件持久化存储
