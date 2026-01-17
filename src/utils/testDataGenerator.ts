import { WeekKR, StickyNote } from '../types';
import { PersistentData } from '../store/persistence';

/**
 * 生成测试用的周计划数据（WeekKR）
 */
export function generateTestWeekKRs(): WeekKR[] {
  const weekKRs: WeekKR[] = [];
  const today = new Date();
  
  // 生成前 4 周的数据，每周 2-3 个关键结果
  for (let week = 1; week <= 4; week++) {
    const krCount = week === 1 ? 3 : week === 2 ? 2 : week === 3 ? 3 : 2;
    
    for (let i = 0; i < krCount; i++) {
      const krId = `kr-${week}-${i + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // 根据周数设置不同的进度
      let progress = 0;
      let dailyTasksCompleted = 0;
      let totalDailyTasks = 0;
      
      if (week === 1) {
        // 第1周：已完成
        totalDailyTasks = 5;
        dailyTasksCompleted = 5;
        progress = 100;
      } else if (week === 2) {
        // 第2周：进行中
        totalDailyTasks = 8;
        dailyTasksCompleted = 5;
        progress = Math.round((5 / 8) * 100);
      } else if (week === 3) {
        // 第3周：刚开始
        totalDailyTasks = 6;
        dailyTasksCompleted = 2;
        progress = Math.round((2 / 6) * 100);
      } else {
        // 第4周：未开始
        totalDailyTasks = 7;
        dailyTasksCompleted = 0;
        progress = 0;
      }
      
      const titles = [
        `完成产品原型设计`,
        `完成用户调研报告`,
        `实现核心功能开发`,
        `完成UI/UX设计`,
        `完成技术文档编写`,
        `完成测试用例编写`,
        `完成性能优化`,
        `完成代码审查`,
      ];
      
      const descriptions = [
        `完成产品的核心功能原型设计，包括主要交互流程`,
        `完成用户调研，收集至少50份有效问卷`,
        `实现用户认证、数据存储等核心功能模块`,
        `完成主要页面的UI/UX设计，确保用户体验流畅`,
        `编写完整的技术文档，包括API文档和架构说明`,
        `编写测试用例，覆盖率达到80%以上`,
        `优化应用性能，确保加载时间在2秒以内`,
        `完成代码审查，修复所有关键bug`,
      ];
      
      const titleIndex = (week - 1) * 2 + i;
      const title = titles[titleIndex % titles.length];
      const description = descriptions[titleIndex % descriptions.length];
      
      weekKRs.push({
        id: krId,
        week,
        title,
        description,
        progress,
        dailyTasksCompleted,
        totalDailyTasks,
      });
    }
  }
  
  return weekKRs;
}

/**
 * 生成测试用的每日任务数据（StickyNote）
 */
export function generateTestTasks(weekKRs: WeekKR[]): StickyNote[] {
  const tasks: StickyNote[] = [];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // 为第1周和第2周生成一些已完成的任务
  const week1KRs = weekKRs.filter(kr => kr.week === 1);
  const week2KRs = weekKRs.filter(kr => kr.week === 2);
  
  // 第1周已完成的任务
  week1KRs.forEach((kr, index) => {
    for (let i = 0; i < 2; i++) {
      const taskId = `task-1-${kr.id}-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const taskDate = new Date(today);
      taskDate.setDate(today.getDate() - 7 + i); // 一周前的任务
      
      tasks.push({
        id: taskId,
        content: `${kr.title} - 任务 ${i + 1}`,
        layer: 'daily',
        date: taskDate.toISOString().split('T')[0],
        completed: true,
        parentKRId: kr.id,
        createdAt: taskDate.toISOString(),
      });
    }
  });
  
  // 第2周进行中的任务
  week2KRs.forEach((kr, index) => {
    for (let i = 0; i < 2; i++) {
      const taskId = `task-2-${kr.id}-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const taskDate = new Date(today);
      taskDate.setDate(today.getDate() - 3 + i); // 3天前的任务
      
      tasks.push({
        id: taskId,
        content: `${kr.title} - 任务 ${i + 1}`,
        layer: 'daily',
        date: taskDate.toISOString().split('T')[0],
        completed: i === 0, // 第一个已完成，第二个未完成
        parentKRId: kr.id,
        createdAt: taskDate.toISOString(),
      });
    }
  });
  
  // 今天的任务
  const todayTasks = [
    '完成周报总结',
    '准备明天的会议材料',
    '回复重要邮件',
    '更新项目进度',
  ];
  
  todayTasks.forEach((content, index) => {
    const taskId = `task-today-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    tasks.push({
      id: taskId,
      content,
      layer: 'daily',
      date: todayStr,
      completed: false,
      createdAt: today.toISOString(),
    });
  });
  
  return tasks;
}

/**
 * 生成完整的测试数据
 */
export function generateTestData(): PersistentData {
  const weekKRs = generateTestWeekKRs();
  const tasks = generateTestTasks(weekKRs);
  
  return {
    weeks: weekKRs,
    tasks: tasks.filter(t => !t.completed), // 只返回未完成的任务
    userSettings: {
      theme: 'default',
      currentWeek: 3, // 当前是第3周
      completedWeeks: 1, // 已完成1周
    },
  };
}

/**
 * 将测试数据保存到 localStorage
 */
export function saveTestDataToStorage(): PersistentData {
  const testData = generateTestData();
  
  try {
    // 保存到主存储键
    localStorage.setItem('stickylife-persistent-data', JSON.stringify(testData));
    
    // 同时保存到兼容的旧键名（如果需要）
    localStorage.setItem('stickylife-notes', JSON.stringify(testData.tasks));
    localStorage.setItem('stickylife-weeks', JSON.stringify(testData.weeks));
    localStorage.setItem('stickylife-settings', JSON.stringify(testData.userSettings));
    
    console.log('✅ 测试数据已保存到 localStorage:', {
      weeks: testData.weeks.length,
      tasks: testData.tasks.length,
      currentWeek: testData.userSettings.currentWeek,
      completedWeeks: testData.userSettings.completedWeeks,
    });
    
    return testData;
  } catch (error) {
    console.error('❌ 保存测试数据失败:', error);
    throw error;
  }
}

/**
 * 清除所有测试数据
 */
export function clearTestData(): void {
  try {
    localStorage.removeItem('stickylife-persistent-data');
    localStorage.removeItem('stickylife-notes');
    localStorage.removeItem('stickylife-completed');
    localStorage.removeItem('stickylife-weeks');
    localStorage.removeItem('stickylife-settings');
    
    console.log('✅ 测试数据已清除');
  } catch (error) {
    console.error('❌ 清除测试数据失败:', error);
    throw error;
  }
}
