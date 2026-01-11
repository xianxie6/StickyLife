import { useReducer, useEffect } from 'react';
import { appReducer, initialState } from '../store/appReducer';
import { AppState, AppAction } from '../types';
import { getWeekByDate, getDayPlanByDate } from '../utils/dataGenerator';

// 自定义 Hook 管理应用状态
export function useAppState() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 初始化：如果周计划为空，则生成12周计划
  useEffect(() => {
    if (state.weeks.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      dispatch({ type: 'INIT_WEEKS', payload: { startDate: today } });
    }
  }, [state.weeks.length]);

  // 根据当前日期自动设置当前周
  useEffect(() => {
    if (state.weeks.length > 0 && state.currentDate) {
      const week = getWeekByDate(state.weeks, state.currentDate);
      if (week && week.id !== state.currentWeekId) {
        dispatch({ type: 'SET_CURRENT_WEEK', payload: { weekId: week.id } });
      }
    }
  }, [state.currentDate, state.weeks, state.currentWeekId]);

  return {
    state,
    dispatch,
    // 便捷方法
    getCurrentWeek: () => 
      state.weeks.find(w => w.id === state.currentWeekId) || null,
    getSelectedWeek: () =>
      state.weeks.find(w => w.id === state.selectedWeekId) || null,
    getCurrentDayPlan: () => 
      getDayPlanByDate(state.dayPlans, state.currentDate),
    getWeekByDate: (date: string) => 
      getWeekByDate(state.weeks, date),
    getDayPlanByDate: (date: string) => 
      getDayPlanByDate(state.dayPlans, date),
  };
}

