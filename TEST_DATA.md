# 测试数据使用指南

## 快速开始

### 方法一：在浏览器控制台使用（推荐）

1. 启动开发环境：
   ```bash
   npm run dev
   # 或
   npm run electron:dev
   ```

2. 打开浏览器控制台（F12 或 Cmd+Option+I）

3. 在控制台输入以下命令：

   **加载测试数据：**
   ```javascript
   StickyLifeTestData.load()
   ```
   然后刷新页面即可看到测试数据。

   **清除测试数据：**
   ```javascript
   StickyLifeTestData.clear()
   ```
   然后刷新页面即可看到空状态。

   **预览测试数据（不保存）：**
   ```javascript
   StickyLifeTestData.preview()
   ```

### 方法二：在代码中直接调用

```typescript
import { saveTestDataToStorage, clearTestData, generateTestData } from './utils/testDataGenerator';

// 加载测试数据
saveTestDataToStorage();

// 清除测试数据
clearTestData();

// 生成测试数据（不保存）
const testData = generateTestData();
```

## 测试数据内容

### 周计划数据（WeekKR）

- **第1周**：3个关键结果，全部完成（进度100%）
- **第2周**：2个关键结果，进行中（进度约62%）
- **第3周**：3个关键结果，刚开始（进度约33%）
- **第4周**：2个关键结果，未开始（进度0%）

### 每日任务数据（StickyNote）

- 第1周和第2周的历史任务（部分已完成）
- 今天的待办任务（4个）

### 用户设置

- 当前周：第3周
- 已完成周数：1周

## 数据结构

测试数据会保存到 `localStorage` 的以下键中：

- `stickylife-persistent-data` - 主数据存储
- `stickylife-notes` - 任务列表（兼容旧版本）
- `stickylife-weeks` - 周计划列表（兼容旧版本）
- `stickylife-settings` - 用户设置（兼容旧版本）

## 注意事项

1. 测试数据会在刷新页面后生效
2. 清除数据后需要刷新页面才能看到空状态
3. 测试数据是随机生成的，每次调用 `load()` 会生成新的数据
4. 测试数据仅用于开发测试，不会影响生产环境
