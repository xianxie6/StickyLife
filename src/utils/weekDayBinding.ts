import { WeekPlan, DayPlan, Task, KeyResult } from '../types';
import { getDayPlansByWeek } from './dataGenerator';

/**
 * 周计划与日计划的绑定逻辑工具函数
 */

// 获取指定周的所有日计划
export function getDayPlansForWeek(dayPlans: DayPlan[], weekId: string): DayPlan[] {
  return getDayPlansByWeek(dayPlans, weekId);
}

// 检查日计划是否属于指定周
export function isDayPlanInWeek(dayPlan: DayPlan, week: WeekPlan): boolean {
  return dayPlan.weekId === week.id;
}

// 获取指定周的所有任务
export function getAllTasksForWeek(dayPlans: DayPlan[], weekId: string): Task[] {
  const weekDayPlans = getDayPlansForWeek(dayPlans, weekId);
  return weekDayPlans.flatMap(dp => dp.tasks);
}

// 获取关联到指定KeyResult的所有任务
export function getTasksByKeyResult(
  dayPlans: DayPlan[], 
  weekId: string, 
  keyResultId: string
): Task[] {
  const weekDayPlans = getDayPlansForWeek(dayPlans, weekId);
  return weekDayPlans.flatMap(dp => 
    dp.tasks.filter(task => task.relatedKeyResultId === keyResultId)
  );
}

// 计算KeyResult的完成进度（基于关联任务）
export function calculateKeyResultProgress(
  keyResult: KeyResult,
  relatedTasks: Task[]
): number {
  if (relatedTasks.length === 0) {
    return keyResult.current;
  }
  
  const completedTasks = relatedTasks.filter(t => t.completed).length;
  const progress = (completedTasks / relatedTasks.length) * 100;
  return Math.min(progress, keyResult.target);
}

// 获取周计划的整体完成度
export function getWeekCompletionRate(
  week: WeekPlan,
  dayPlans: DayPlan[]
): number {
  const weekDayPlans = getDayPlansForWeek(dayPlans, week.id);
  const allTasks = weekDayPlans.flatMap(dp => dp.tasks);
  
  if (allTasks.length === 0) {
    // 基于KeyResults的完成度
    const completedKeyResults = week.keyResults.filter(kr => kr.completed).length;
    return (completedKeyResults / week.keyResults.length) * 100;
  }
  
  const completedTasks = allTasks.filter(t => t.completed).length;
  return (completedTasks / allTasks.length) * 100;
}

// 验证日计划与周计划的绑定关系
export function validateDayPlanWeekBinding(
  dayPlan: DayPlan,
  week: WeekPlan
): { valid: boolean; error?: string } {
  if (dayPlan.weekId !== week.id) {
    return { valid: false, error: '日计划的weekId与周计划ID不匹配' };
  }
  
  const dayDate = new Date(dayPlan.date);
  const weekStart = new Date(week.startDate);
  const weekEnd = new Date(week.endDate);
  
  if (dayDate < weekStart || dayDate > weekEnd) {
    return { valid: false, error: '日计划的日期不在周计划的日期范围内' };
  }
  
  return { valid: true };
}

// 获取指定周的所有KeyResults及其关联任务统计
export function getWeekKeyResultsWithTasks(
  week: WeekPlan,
  dayPlans: DayPlan[]
): Array<{
  keyResult: KeyResult;
  relatedTasks: Task[];
  taskCompletionRate: number;
}> {
  const weekDayPlans = getDayPlansForWeek(dayPlans, week.id);
  const allTasks = weekDayPlans.flatMap(dp => dp.tasks);
  
  return week.keyResults.map(keyResult => {
    const relatedTasks = allTasks.filter(
      task => task.relatedKeyResultId === keyResult.id
    );
    const completedTasks = relatedTasks.filter(t => t.completed).length;
    const taskCompletionRate = relatedTasks.length > 0
      ? (completedTasks / relatedTasks.length) * 100
      : 0;
    
    return {
      keyResult,
      relatedTasks,
      taskCompletionRate,
    };
  });
}

