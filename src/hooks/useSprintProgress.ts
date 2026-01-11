import { useEffect, useRef } from 'react';
import { AppState, AppAction } from '../types';
import { getDayPlansByWeek } from '../utils/dataGenerator';

interface UseSprintProgressProps {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

/**
 * 计算指定周的完成百分比和状态
 */
function calculateWeekCompletion(
  weekId: string,
  todayFocus: AppState['todayFocus'],
  dayPlans: AppState['dayPlans']
): { completionPercentage: number; status: 'pending' | 'in-progress' | 'done' } | null {
  // 获取该周的所有日计划
  const weekDayPlans = getDayPlansByWeek(dayPlans, weekId);

  // 收集该周的所有任务（包括 TodayFocus 任务和日计划中的任务）
  const allWeekTasks: Array<{ completed: boolean }> = [];

  // 1. 添加该周的所有 TodayFocus 任务
  const weekTodayFocusTasks = todayFocus.filter(t => t.weekId === weekId);
  allWeekTasks.push(...weekTodayFocusTasks);

  // 2. 添加该周所有日计划中的任务
  weekDayPlans.forEach(dayPlan => {
    allWeekTasks.push(...dayPlan.tasks);
  });

  // 如果没有任务，返回 null
  const totalTasks = allWeekTasks.length;
  if (totalTasks === 0) return null;

  const completedTasks = allWeekTasks.filter(t => t.completed).length;
  const completionPercentage = Math.round((completedTasks / totalTasks) * 100);

  // 判断是否所有任务都已完成
  const allTasksCompleted = completedTasks === totalTasks && totalTasks > 0;
  const status: 'pending' | 'in-progress' | 'done' = allTasksCompleted
    ? 'done'
    : completedTasks > 0
    ? 'in-progress'
    : 'pending';

  return { completionPercentage, status };
}

/**
 * 监听 TodayFocus 任务完成状态，自动更新周的完成百分比和状态
 */
export function useSprintProgress({ state, dispatch }: UseSprintProgressProps) {
  // 使用 ref 来跟踪上一次的 todayFocus 状态，以便检测变化
  const prevTodayFocusRef = useRef<AppState['todayFocus']>(state.todayFocus);

  useEffect(() => {
    const currentTodayFocus = state.todayFocus;
    const prevTodayFocus = prevTodayFocusRef.current;

    // 收集所有需要更新的周 ID
    const weeksToUpdate = new Set<string>();

    // 1. 检查任务状态变化（完成或取消完成）
    currentTodayFocus.forEach(task => {
      const prevTask = prevTodayFocus.find(t => t.id === task.id);
      if (prevTask && prevTask.completed !== task.completed && task.weekId) {
        weeksToUpdate.add(task.weekId);
      }
    });

    // 2. 检查被移除的任务（从 prevTodayFocus 中消失的任务）
    prevTodayFocus.forEach(prevTask => {
      const currentTask = currentTodayFocus.find(t => t.id === prevTask.id);
      if (!currentTask && prevTask.weekId) {
        weeksToUpdate.add(prevTask.weekId);
      }
    });

    // 3. 更新所有受影响的周
    weeksToUpdate.forEach(weekId => {
      const result = calculateWeekCompletion(
        weekId,
        currentTodayFocus,
        state.dayPlans
      );

      if (result) {
        dispatch({
          type: 'UPDATE_WEEK_COMPLETION',
          payload: {
            weekId,
            completionPercentage: result.completionPercentage,
            status: result.status,
          },
        });
      }
    });

    // 更新 ref 为当前状态
    prevTodayFocusRef.current = currentTodayFocus;
  }, [state.todayFocus, state.dayPlans, dispatch]);
}

