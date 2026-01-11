# 数据模型与绑定逻辑说明

## 数据模型结构

### 1. WeekPlan（周计划）
每个周计划包含：
- `id`: 唯一标识符
- `weekNumber`: 周序号（1-12）
- `startDate`: 周开始日期
- `endDate`: 周结束日期
- `keyResults`: **3个KeyResult数组**（固定数量）
- `notes`: 周计划备注

### 2. KeyResult（关键结果）
每个KeyResult包含：
- `id`: 唯一标识符
- `title`: 标题
- `description`: 描述
- `target`: 目标值
- `current`: 当前值
- `unit`: 单位
- `completed`: 是否完成

### 3. DayPlan（日计划）
每个日计划包含：
- `id`: 唯一标识符
- `date`: 日期（ISO格式）
- `weekId`: **所属周计划的ID**（绑定关系）
- `tasks`: 任务列表
- `notes`: 日计划备注

### 4. Task（任务）
每个任务包含：
- `id`: 唯一标识符
- `title`: 标题
- `description`: 描述
- `completed`: 是否完成
- `priority`: 优先级
- `relatedKeyResultId`: **关联的KeyResult ID**（可选，用于绑定）
- `estimatedTime`: 预计时间
- `actualTime`: 实际时间

## 绑定逻辑

### 周计划与日计划的绑定

1. **通过 weekId 字段绑定**
   - 每个 `DayPlan` 都有一个 `weekId` 字段
   - `weekId` 指向对应的 `WeekPlan.id`
   - 一个周计划可以包含多个日计划（通常7个，周一到周日）

2. **日期范围验证**
   - 日计划的 `date` 必须在对应周计划的 `startDate` 和 `endDate` 之间
   - 系统会自动验证绑定关系的有效性

3. **自动生成机制**
   - 初始化12周计划时，会自动为每一周生成对应的日计划
   - 每个日计划自动设置正确的 `weekId`

### 任务与KeyResult的绑定

1. **通过 relatedKeyResultId 字段绑定**
   - 每个 `Task` 可以有一个可选的 `relatedKeyResultId` 字段
   - `relatedKeyResultId` 指向对应的 `KeyResult.id`
   - 一个KeyResult可以关联多个任务

2. **跨日计划关联**
   - 任务可以属于不同日期的日计划
   - 只要 `relatedKeyResultId` 相同，就属于同一个KeyResult
   - 这样可以追踪整个周内某个KeyResult的完成情况

## 状态管理

### 使用 useReducer

应用使用 `useReducer` 管理状态，包含以下 Action 类型：

- `INIT_WEEKS`: 初始化12周计划
- `UPDATE_WEEK`: 更新周计划
- `UPDATE_KEY_RESULT`: 更新KeyResult
- `ADD_DAY_PLAN`: 添加日计划
- `UPDATE_DAY_PLAN`: 更新日计划
- `ADD_TASK`: 添加任务
- `UPDATE_TASK`: 更新任务
- `SET_CURRENT_WEEK`: 设置当前周
- `SET_CURRENT_DATE`: 设置当前日期

### 数据初始化流程

1. 应用启动时，如果周计划为空，自动生成12周计划
2. 为每一周生成对应的日计划（7天）
3. 每个周计划包含3个默认的KeyResult
4. 根据当前日期自动设置当前周

## 工具函数

### weekDayBinding.ts

提供以下绑定逻辑工具函数：

- `getDayPlansForWeek()`: 获取指定周的所有日计划
- `isDayPlanInWeek()`: 检查日计划是否属于指定周
- `getAllTasksForWeek()`: 获取指定周的所有任务
- `getTasksByKeyResult()`: 获取关联到指定KeyResult的所有任务
- `calculateKeyResultProgress()`: 计算KeyResult的完成进度
- `getWeekCompletionRate()`: 获取周计划的整体完成度
- `validateDayPlanWeekBinding()`: 验证日计划与周计划的绑定关系
- `getWeekKeyResultsWithTasks()`: 获取指定周的所有KeyResults及其关联任务统计

## 数据完整性保证

1. **12周计划固定结构**
   - 系统保证始终有12个周计划
   - 每个周计划包含3个KeyResult

2. **日期范围一致性**
   - 日计划的日期必须在对应周计划的日期范围内
   - 系统提供验证函数确保数据一致性

3. **ID关联完整性**
   - 所有关联关系都通过ID字段维护
   - 删除操作需要同时更新所有关联数据

## 使用示例

```typescript
// 获取当前周的所有日计划
const weekDayPlans = getDayPlansForWeek(state.dayPlans, currentWeek.id);

// 获取关联到某个KeyResult的所有任务
const tasks = getTasksByKeyResult(state.dayPlans, weekId, keyResultId);

// 计算周计划的完成度
const completionRate = getWeekCompletionRate(week, state.dayPlans);
```

