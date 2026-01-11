import { WeekPlan, DayPlan, KeyResult, Task } from '../types';

// 生成唯一ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 获取一周的开始日期（周一）
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 调整为周一
  return new Date(d.setDate(diff));
}

// 获取一周的结束日期（周日）
function getWeekEnd(startDate: Date): Date {
  const end = new Date(startDate);
  end.setDate(end.getDate() + 6);
  return end;
}

// 格式化日期为 ISO 字符串
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// 生成12周计划的初始数据
export function generate12WeeksPlan(startDate: string): WeekPlan[] {
  const weeks: WeekPlan[] = [];
  const start = new Date(startDate);
  const weekStart = getWeekStart(start);

  for (let i = 0; i < 12; i++) {
    const currentWeekStart = new Date(weekStart);
    currentWeekStart.setDate(weekStart.getDate() + i * 7);
    const currentWeekEnd = getWeekEnd(new Date(currentWeekStart));

    const week: WeekPlan = {
      id: generateId(),
      weekNumber: i + 1,
      startDate: formatDate(currentWeekStart),
      endDate: formatDate(currentWeekEnd),
      keyResults: generateDefaultKeyResults(i + 1),
      notes: '',
      status: 'pending',
      completionPercentage: 0,
    };

    weeks.push(week);
  }

  return weeks;
}

// 生成默认的3个KeyResult
function generateDefaultKeyResults(weekNumber: number): KeyResult[] {
  return [
    {
      id: generateId(),
      title: `第${weekNumber}周 - 关键结果 1`,
      description: '请设置你的第一个关键结果',
      target: 100,
      current: 0,
      unit: '%',
      completed: false,
    },
    {
      id: generateId(),
      title: `第${weekNumber}周 - 关键结果 2`,
      description: '请设置你的第二个关键结果',
      target: 100,
      current: 0,
      unit: '%',
      completed: false,
    },
    {
      id: generateId(),
      title: `第${weekNumber}周 - 关键结果 3`,
      description: '请设置你的第三个关键结果',
      target: 100,
      current: 0,
      unit: '%',
      completed: false,
    },
  ];
}

// 为指定周生成日计划
export function generateDayPlansForWeek(week: WeekPlan): DayPlan[] {
  const dayPlans: DayPlan[] = [];
  const startDate = new Date(week.startDate);
  const endDate = new Date(week.endDate);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayPlan: DayPlan = {
      id: generateId(),
      date: formatDate(new Date(d)),
      weekId: week.id,
      tasks: [],
      notes: '',
    };
    dayPlans.push(dayPlan);
  }

  return dayPlans;
}

// 获取指定日期所属的周计划
export function getWeekByDate(weeks: WeekPlan[], date: string): WeekPlan | null {
  const targetDate = new Date(date);
  
  return weeks.find(week => {
    const start = new Date(week.startDate);
    const end = new Date(week.endDate);
    return targetDate >= start && targetDate <= end;
  }) || null;
}

// 获取指定周的所有日计划
export function getDayPlansByWeek(dayPlans: DayPlan[], weekId: string): DayPlan[] {
  return dayPlans.filter(plan => plan.weekId === weekId);
}

// 获取指定日期的日计划
export function getDayPlanByDate(dayPlans: DayPlan[], date: string): DayPlan | null {
  return dayPlans.find(plan => plan.date === date) || null;
}

