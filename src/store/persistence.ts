import { StickyNote, WeekKR } from '../types';

// 数据接口定义
export interface PersistentData {
  weeks: WeekKR[];
  tasks: StickyNote[];
  userSettings: {
    theme?: string;
    currentWeek?: number;
    completedWeeks?: number;
  };
}

// 默认数据
const defaultData: PersistentData = {
  weeks: [],
  tasks: [],
  userSettings: {
    theme: 'default',
    currentWeek: 1,
    completedWeeks: 0,
  },
};

// 存储键名
const STORAGE_KEY = 'stickylife-persistent-data';

/**
 * 加载数据
 * 如果文件不存在或损坏，返回默认数据
 */
export async function loadData(): Promise<PersistentData> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      // 验证数据结构
      if (typeof data === 'object' && Array.isArray(data.weeks) && Array.isArray(data.tasks)) {
        console.log('Data loaded successfully:', {
          weeks: data.weeks.length,
          tasks: data.tasks.length,
        });
        return data;
      }
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  
  console.log('No saved data found, using default data');
  return defaultData;
}

/**
 * 保存数据（同步版本，确保数据立即保存）
 */
export function saveDataSync(data: Partial<PersistentData>): void {
  try {
    // 读取现有数据
    const saved = localStorage.getItem(STORAGE_KEY);
    let existingData: PersistentData = defaultData;
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && Array.isArray(parsed.weeks) && Array.isArray(parsed.tasks)) {
          existingData = parsed;
        }
      } catch (e) {
        console.warn('Error parsing existing data, using default:', e);
      }
    }
    
    // 合并数据
    const mergedData: PersistentData = {
      weeks: data.weeks !== undefined ? data.weeks : existingData.weeks,
      tasks: data.tasks !== undefined ? data.tasks : existingData.tasks,
      userSettings: {
        ...existingData.userSettings,
        ...(data.userSettings || {}),
      },
    };

    // 同步保存到 localStorage（立即保存，不等待）
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedData));

    console.log('Data saved successfully (sync):', {
      weeks: mergedData.weeks.length,
      tasks: mergedData.tasks.length,
    });
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
}

/**
 * 保存数据（异步版本，保持向后兼容）
 */
export async function saveData(data: Partial<PersistentData>): Promise<void> {
  saveDataSync(data);
}

/**
 * 保存周数据（WeekKRs）- 同步版本
 */
export function saveWeeksSync(weeks: WeekKR[]): void {
  saveDataSync({ weeks });
}

/**
 * 保存周数据（WeekKRs）- 异步版本
 */
export async function saveWeeks(weeks: WeekKR[]): Promise<void> {
  saveWeeksSync(weeks);
}

/**
 * 保存任务数据（StickyNotes）- 同步版本
 */
export function saveTasksSync(tasks: StickyNote[]): void {
  saveDataSync({ tasks });
}

/**
 * 保存任务数据（StickyNotes）- 异步版本
 */
export async function saveTasks(tasks: StickyNote[]): Promise<void> {
  saveTasksSync(tasks);
}

/**
 * 保存用户设置 - 同步版本
 */
export function saveUserSettingsSync(settings: PersistentData['userSettings']): void {
  saveDataSync({ userSettings: settings });
}

/**
 * 保存用户设置 - 异步版本
 */
export async function saveUserSettings(settings: PersistentData['userSettings']): Promise<void> {
  saveUserSettingsSync(settings);
}

/**
 * 清除所有数据（重置为默认状态）
 */
export async function clearData(): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    console.log('Data cleared, reset to default');
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}
