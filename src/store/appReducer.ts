import { AppState, AppAction, WeekPlan, DayPlan, KeyResult, Task, TodayFocusTask } from '../types';
import { generate12WeeksPlan, generateDayPlansForWeek } from '../utils/dataGenerator';

// 生成唯一ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 初始状态
export const initialState: AppState = {
  weeks: [],
  dayPlans: [],
  currentWeekId: null,
  currentDate: new Date().toISOString().split('T')[0],
  todayFocus: [],
  selectedWeekId: null,
};

// Reducer 函数
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // 初始化12周计划
    case 'INIT_WEEKS': {
      const weeks = generate12WeeksPlan(action.payload.startDate);
      // 为每一周生成初始日计划
      const dayPlans: DayPlan[] = [];
      weeks.forEach(week => {
        dayPlans.push(...generateDayPlansForWeek(week));
      });
      
      return {
        ...state,
        weeks,
        dayPlans,
        currentWeekId: weeks[0]?.id || null,
      };
    }

    // 更新周计划
    case 'UPDATE_WEEK': {
      const { weekId, week } = action.payload;
      return {
        ...state,
        weeks: state.weeks.map(w => 
          w.id === weekId ? { ...w, ...week } : w
        ),
      };
    }

    // 更新KeyResult
    case 'UPDATE_KEY_RESULT': {
      const { weekId, keyResultId, keyResult } = action.payload;
      return {
        ...state,
        weeks: state.weeks.map(week => {
          if (week.id === weekId) {
            return {
              ...week,
              keyResults: week.keyResults.map(kr =>
                kr.id === keyResultId ? { ...kr, ...keyResult } : kr
              ),
            };
          }
          return week;
        }),
      };
    }

    // 添加日计划
    case 'ADD_DAY_PLAN': {
      return {
        ...state,
        dayPlans: [...state.dayPlans, action.payload.dayPlan],
      };
    }

    // 更新日计划
    case 'UPDATE_DAY_PLAN': {
      const { dayPlanId, dayPlan } = action.payload;
      return {
        ...state,
        dayPlans: state.dayPlans.map(dp =>
          dp.id === dayPlanId ? { ...dp, ...dayPlan } : dp
        ),
      };
    }

    // 添加任务
    case 'ADD_TASK': {
      const { dayPlanId, task } = action.payload;
      return {
        ...state,
        dayPlans: state.dayPlans.map(dp =>
          dp.id === dayPlanId
            ? { ...dp, tasks: [...dp.tasks, task] }
            : dp
        ),
      };
    }

    // 更新任务
    case 'UPDATE_TASK': {
      const { dayPlanId, taskId, task } = action.payload;
      return {
        ...state,
        dayPlans: state.dayPlans.map(dp => {
          if (dp.id === dayPlanId) {
            return {
              ...dp,
              tasks: dp.tasks.map(t =>
                t.id === taskId ? { ...t, ...task } : t
              ),
            };
          }
          return dp;
        }),
      };
    }

    // 设置当前周
    case 'SET_CURRENT_WEEK': {
      return {
        ...state,
        currentWeekId: action.payload.weekId,
      };
    }

    // 设置当前日期
    case 'SET_CURRENT_DATE': {
      return {
        ...state,
        currentDate: action.payload.date,
      };
    }

    // 设置选中的周（用于显示详情）
    case 'SET_SELECTED_WEEK': {
      return {
        ...state,
        selectedWeekId: action.payload.weekId,
      };
    }

    // 分发KeyResult到TodayFocus
    case 'DISTRIBUTE_KEY_RESULT': {
      const { keyResultId, weekId } = action.payload;
      const week = state.weeks.find(w => w.id === weekId);
      if (!week) return state;

      const keyResult = week.keyResults.find(kr => kr.id === keyResultId);
      if (!keyResult) return state;

      // 检查是否已经存在相同的任务
      const existingTask = state.todayFocus.find(
        task => task.relatedKeyResultId === keyResultId && task.weekId === weekId
      );
      if (existingTask) return state;

      // 创建新的TodayFocus任务
      const newTask: TodayFocusTask = {
        id: generateId(),
        title: keyResult.title,
        description: keyResult.description,
        completed: false,
        priority: 'medium',
        relatedKeyResultId: keyResultId,
        weekId: weekId,
        estimatedTime: undefined,
        actualTime: undefined,
        createdAt: new Date().toISOString(),
      };

      return {
        ...state,
        todayFocus: [...state.todayFocus, newTask],
      };
    }

    // 添加TodayFocus任务
    case 'ADD_TODAY_FOCUS_TASK': {
      return {
        ...state,
        todayFocus: [...state.todayFocus, action.payload.task],
      };
    }

    // 更新TodayFocus任务
    case 'UPDATE_TODAY_FOCUS_TASK': {
      const { taskId, task } = action.payload;
      return {
        ...state,
        todayFocus: state.todayFocus.map(t =>
          t.id === taskId ? { ...t, ...task } : t
        ),
      };
    }

    // 移除TodayFocus任务
    case 'REMOVE_TODAY_FOCUS_TASK': {
      return {
        ...state,
        todayFocus: state.todayFocus.filter(t => t.id !== action.payload.taskId),
      };
    }

    // 更新周完成状态和百分比
    case 'UPDATE_WEEK_COMPLETION': {
      const { weekId, completionPercentage, status } = action.payload;
      return {
        ...state,
        weeks: state.weeks.map(week =>
          week.id === weekId
            ? {
                ...week,
                completionPercentage,
                status: status || week.status || 'pending',
              }
            : week
        ),
      };
    }

    default:
      return state;
  }
}

