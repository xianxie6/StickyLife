import { useState, useEffect, useCallback, useRef } from 'react';
import { loadData, saveData, PersistentData } from '../utils/storage';
import { StickyNote, WeekKR } from '../types';

// 检查是否在 Electron 环境中
const isElectron = () => {
  if (typeof window === 'undefined') return false;
  // 检查 Electron API 是否存在
  try {
    return !!(window as any).electronAPI || !!(window as any).require;
  } catch {
    return false;
  }
};

export function useStore() {
  const [isLoading, setIsLoading] = useState(true);
  const [weeks, setWeeks] = useState<WeekKR[]>([]);
  const [tasks, setTasks] = useState<StickyNote[]>([]);
  const [userSettings, setUserSettings] = useState<PersistentData['userSettings']>({
    theme: 'default',
    currentWeek: 1,
    completedWeeks: 0,
  });
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // 初始化：从磁盘加载数据
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('[Store] Loading data from disk...');
        const data = await loadData();
        setWeeks(data.weeks || []);
        setTasks(data.tasks || []);
        setUserSettings(data.userSettings || {
          theme: 'default',
          currentWeek: 1,
          completedWeeks: 0,
        });
        isInitializedRef.current = true;
        console.log('[Store] Store initialized successfully:', {
          weeks: data.weeks?.length || 0,
          tasks: data.tasks?.length || 0,
        });
      } catch (error) {
        console.error('[Store] Error initializing store:', error);
        // 使用默认值
        setWeeks([]);
        setTasks([]);
        setUserSettings({
          theme: 'default',
          currentWeek: 1,
          completedWeeks: 0,
        });
        isInitializedRef.current = true;
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // 防抖保存函数（1000ms 延迟，避免过度写入）
  const debouncedSave = useCallback(async (data: Partial<PersistentData>, delay: number = 1000) => {
    // 取消之前的保存操作
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // 设置新的保存操作
    saveTimeoutRef.current = setTimeout(async () => {
      if (isInitializedRef.current) {
        try {
          await saveData(data);
          console.log('[Store] Data saved (debounced)');
        } catch (error) {
          console.error('[Store] Error saving data (debounced):', error);
        }
      }
    }, delay);
  }, []);

  // 更新周数据
  const updateWeeks = useCallback((newWeeks: WeekKR[]) => {
    setWeeks(newWeeks);
    if (isInitializedRef.current) {
      // 自动保存（防抖）
      debouncedSave({ weeks: newWeeks });
    }
  }, [debouncedSave]);

  // 更新任务数据
  const updateTasks = useCallback((newTasks: StickyNote[]) => {
    setTasks(newTasks);
    if (isInitializedRef.current) {
      // 自动保存（防抖）
      debouncedSave({ tasks: newTasks });
    }
  }, [debouncedSave]);

  // 更新用户设置
  const updateUserSettings = useCallback((newSettings: Partial<PersistentData['userSettings']>) => {
    setUserSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (isInitializedRef.current) {
        // 自动保存（防抖）
        debouncedSave({ userSettings: updated });
      }
      return updated;
    });
  }, [debouncedSave]);

  // 添加任务
  const addTask = useCallback((task: StickyNote) => {
    setTasks(prev => {
      const newTasks = [...prev, task];
      if (isInitializedRef.current) {
        // 自动保存（防抖）
        debouncedSave({ tasks: newTasks });
      }
      return newTasks;
    });
  }, [debouncedSave]);

  // 更新任务
  const updateTask = useCallback((id: string, updates: Partial<StickyNote>) => {
    setTasks(prev => {
      const newTasks = prev.map(task => task.id === id ? { ...task, ...updates } : task);
      if (isInitializedRef.current) {
        // 自动保存（防抖）
        debouncedSave({ tasks: newTasks });
      }
      return newTasks;
    });
  }, [debouncedSave]);

  // 删除任务
  const deleteTask = useCallback((id: string) => {
    setTasks(prev => {
      const newTasks = prev.filter(task => task.id !== id);
      if (isInitializedRef.current) {
        // 自动保存（防抖）
        debouncedSave({ tasks: newTasks });
      }
      return newTasks;
    });
  }, [debouncedSave]);

  // 清理定时器并在窗口关闭前保存数据
  useEffect(() => {
    const handleBeforeUnload = async () => {
      // 取消延迟保存
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      // 立即保存所有数据
      if (isInitializedRef.current) {
        try {
          await saveData({ weeks, tasks, userSettings });
          console.log('[Store] Data saved on beforeunload');
        } catch (error) {
          console.error('[Store] Error saving data before unload:', error);
        }
      }
    };

    // 监听窗口关闭事件
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [weeks, tasks, userSettings]);

  return {
    isLoading,
    weeks,
    tasks,
    userSettings,
    updateWeeks,
    updateTasks,
    updateUserSettings,
    addTask,
    updateTask,
    deleteTask,
  };
}
