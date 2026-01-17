import { Store } from 'tauri-plugin-store-api';
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

// 存储文件名
const STORE_FILE = '12_data.json';

// Store 实例（单例模式）
let storeInstance: Store | null = null;

/**
 * 获取 Store 实例（延迟初始化）
 */
async function getStore(): Promise<Store | null> {
  // 检查是否在 Tauri 环境中
  if (typeof window === 'undefined') {
    return null;
  }
  
  // 检查 Tauri API 是否存在
  const isTauri = '__TAURI_INTERNALS__' in window || 'tauri' in window;
  if (!isTauri) {
    console.warn('[Storage] Not in Tauri environment, using localStorage fallback');
    return null;
  }

  if (!storeInstance) {
    try {
      // 动态导入 Tauri Store（前端 API）
      const { Store } = await import('tauri-plugin-store-api');
      storeInstance = new Store(STORE_FILE);
      console.log('[Storage] Tauri Store initialized:', STORE_FILE);
    } catch (error) {
      console.error('[Storage] Error initializing Tauri Store:', error);
      console.warn('[Storage] Falling back to localStorage');
      return null;
    }
  }

  return storeInstance;
}

/**
 * 加载数据
 * 如果文件不存在或损坏，返回默认数据
 */
export async function loadData(): Promise<PersistentData> {
  try {
    const store = await getStore();
    
    if (store) {
      // 使用 Tauri Store
      try {
        const data = await store.get<PersistentData>('appData');
        
        if (data) {
          // 验证数据结构
          if (
            typeof data === 'object' &&
            Array.isArray(data.weeks) &&
            Array.isArray(data.tasks)
          ) {
            console.log('[Storage] Data loaded from Tauri Store:', {
              weeks: data.weeks.length,
              tasks: data.tasks.length,
            });
            return data;
          }
        }
      } catch (error) {
        console.error('[Storage] Error reading from Tauri Store:', error);
      }
    } else {
      // 后备：使用 localStorage
      const saved = localStorage.getItem('stickylife-persistent-data');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (
            typeof data === 'object' &&
            Array.isArray(data.weeks) &&
            Array.isArray(data.tasks)
          ) {
            console.log('[Storage] Data loaded from localStorage:', {
              weeks: data.weeks.length,
              tasks: data.tasks.length,
            });
            return data;
          }
        } catch (error) {
          console.error('[Storage] Error parsing localStorage data:', error);
        }
      }
    }
  } catch (error) {
    console.error('[Storage] Error loading data:', error);
  }

  console.log('[Storage] No saved data found, using default data');
  return defaultData;
}

/**
 * 保存数据
 * CRITICAL: 必须调用 .save() 来刷新到磁盘
 */
export async function saveData(data: Partial<PersistentData>): Promise<void> {
  try {
    const store = await getStore();
    
    if (store) {
      // 使用 Tauri Store
      try {
        // 读取现有数据
        const existingData = await store.get<PersistentData>('appData') || defaultData;
        
        // 合并数据
        const mergedData: PersistentData = {
          weeks: data.weeks !== undefined ? data.weeks : existingData.weeks,
          tasks: data.tasks !== undefined ? data.tasks : existingData.tasks,
          userSettings: {
            ...existingData.userSettings,
            ...(data.userSettings || {}),
          },
        };

        // 保存到 Store
        await store.set('appData', mergedData);
        
        // CRITICAL: 调用 save() 刷新到磁盘
        await store.save();
        
        console.log('[Storage] Data saved to Tauri Store:', {
          weeks: mergedData.weeks.length,
          tasks: mergedData.tasks.length,
        });
      } catch (error) {
        console.error('[Storage] Error saving to Tauri Store:', error);
        throw error;
      }
    } else {
      // 后备：使用 localStorage
      try {
        // 读取现有数据
        const saved = localStorage.getItem('stickylife-persistent-data');
        let existingData: PersistentData = defaultData;
        
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (
              typeof parsed === 'object' &&
              Array.isArray(parsed.weeks) &&
              Array.isArray(parsed.tasks)
            ) {
              existingData = parsed;
            }
          } catch (e) {
            console.warn('[Storage] Error parsing existing localStorage data:', e);
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

        // 保存到 localStorage
        localStorage.setItem('stickylife-persistent-data', JSON.stringify(mergedData));
        
        console.log('[Storage] Data saved to localStorage:', {
          weeks: mergedData.weeks.length,
          tasks: mergedData.tasks.length,
        });
      } catch (error) {
        console.error('[Storage] Error saving to localStorage:', error);
        throw error;
      }
    }
  } catch (error) {
    console.error('[Storage] Error saving data:', error);
    throw error;
  }
}

/**
 * 清除所有数据（重置为默认状态）
 */
export async function clearData(): Promise<void> {
  try {
    const store = await getStore();
    
    if (store) {
      await store.set('appData', defaultData);
      await store.save();
      console.log('[Storage] Data cleared in Tauri Store');
    } else {
      localStorage.setItem('stickylife-persistent-data', JSON.stringify(defaultData));
      console.log('[Storage] Data cleared in localStorage');
    }
  } catch (error) {
    console.error('[Storage] Error clearing data:', error);
    throw error;
  }
}
