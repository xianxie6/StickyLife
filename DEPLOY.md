# 部署指南

## 推送到 GitHub

### 方法 1: 使用 GitHub CLI（推荐）

如果你已安装 GitHub CLI：

```bash
gh auth login
git push -u origin main
```

### 方法 2: 使用 Personal Access Token

1. 在 GitHub 创建 Personal Access Token：
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token (classic)"
   - 选择 `repo` 权限
   - 复制生成的 token

2. 推送代码：

```bash
git push https://<YOUR_TOKEN>@github.com/xianxie6/StickyLife.git main
```

### 方法 3: 使用 SSH

1. 设置 SSH 密钥（如果还没有）：
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # 将 ~/.ssh/id_ed25519.pub 内容添加到 GitHub Settings > SSH keys
   ```

2. 更改远程 URL：
   ```bash
   git remote set-url origin git@github.com:xianxie6/StickyLife.git
   git push -u origin main
   ```

### 方法 4: 在 GitHub 网页上操作

如果上述方法都不行，可以在 GitHub 网页上：
1. 访问 https://github.com/xianxie6/StickyLife
2. 点击 "uploading an existing file"
3. 拖拽项目文件上传

## 自动构建和发布

代码推送到 GitHub 后，GitHub Actions 会自动：

1. **构建应用**：在 macOS、Windows、Linux 三个平台上构建
2. **创建 Release**：当你创建版本标签时（如 `v1.0.0`），会自动创建 Release 并上传构建产物

### 创建版本标签

```bash
# 创建标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

GitHub Actions 会自动：
- 在三个平台构建应用
- 创建 GitHub Release
- 上传 DMG、ZIP、EXE、AppImage、DEB 等安装包

## 本地打包

如果你想在本地打包：

```bash
# 构建所有代码
npm run build:all

# 打包应用
npm run electron:build
```

打包后的文件在 `release/` 目录中。
