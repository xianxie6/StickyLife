// Figma 设计的数据类型

export interface StickyNote {
  id: string;
  content: string;
  layer: 'daily' | 'weekly' | 'yearly';
  date: string; // ISO date string
  color?: string;
  completed?: boolean;
  migrationCount?: number; // Number of times postponed
  createdAt: string;
  parentKRId?: string; // 关联的 KeyResult ID
}

export interface WeekKR {
  id: string;
  week: number;
  title: string;
  description: string;
  progress: number;
  dailyTasksCompleted: number;
  totalDailyTasks: number;
}

export type NenoMood = 'idle' | 'happy' | 'working' | 'sleeping';
