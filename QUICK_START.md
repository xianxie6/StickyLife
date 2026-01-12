# StickyLife 快速启动指南

## 🚀 启动应用

### 方式 1：一键启动（推荐）
```bash
npm run electron:dev
```
这会同时启动：
- Vite 开发服务器（http://localhost:5173）
- Electron 应用窗口

### 方式 2：仅启动开发服务器
```bash
npm run dev
```
然后在浏览器访问：http://localhost:5173

### 方式 3：仅启动 Electron（需要先运行 `npm run dev`）
```bash
npm run build:all  # 先构建
electron .
```

---

## 📝 常用命令

### 开发
```bash
npm run electron:dev    # 启动开发模式（Vite + Electron）
npm run dev             # 仅启动 Vite 开发服务器
```

### 构建
```bash
npm run build           # 构建前端
npm run build:electron  # 构建 Electron 主进程
npm run build:all       # 构建所有
```

### 打包
```bash
npm run electron:build  # 打包应用（生成 DMG/EXE）
```

---

## 💡 提示

- **开发时**：使用 `npm run electron:dev` 即可
- **查看浏览器版本**：运行 `npm run dev` 后访问 http://localhost:5173
- **停止应用**：在终端按 `Ctrl + C`

---

## 🔧 如果遇到问题

1. **端口被占用**：
   ```bash
   lsof -ti:5173 | xargs kill -9
   ```

2. **Electron 窗口没出现**：
   - 检查 Dock 是否有 Electron 图标
   - 按 `Cmd + Tab` 切换窗口
   - 重新运行 `npm run electron:dev`

3. **需要重新构建**：
   ```bash
   npm run build:all
   ```
