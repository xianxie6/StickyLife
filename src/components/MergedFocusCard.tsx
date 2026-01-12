import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TodayFocusArea } from './TodayFocusArea';
import { KRTaskCard } from './KRTaskCard';
import { DockedPuffy } from './DockedPuffy';
import { StickyNote, WeekKR } from '../types';
import { Plus } from 'lucide-react';

interface MergedFocusCardProps {
  notes: StickyNote[];
  currentWeek: number;
  completedWeeks: number;
  onAddNote: (note: Omit<StickyNote, 'id' | 'createdAt'>) => void;
  onUpdateNote: (id: string, updates: Partial<StickyNote>) => void;
  onDeleteNote: (id: string) => void;
  onCompleteNote: (id: string) => void;
  isDocked?: boolean;
  onDockChange?: (docked: boolean) => void;
  mascotData?: {
    currentWeek: number;
    completionRate: number;
    overdueCount: number;
  };
}

export function MergedFocusCard({
  notes,
  currentWeek,
  completedWeeks,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onCompleteNote,
  isDocked = false,
  onDockChange,
  mascotData,
}: MergedFocusCardProps) {
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [weekKRs, setWeekKRs] = useState<Record<number, WeekKR[]>>({
    4: [
      {
        id: 'kr-1',
        week: 4,
        title: '完成用户调研报告',
        description: '收集并分析100份用户反馈',
        progress: 40,
        dailyTasksCompleted: 2,
        totalDailyTasks: 5
      },
      {
        id: 'kr-2',
        week: 4,
        title: '设计系统升级',
        description: '完成核心组件库重构',
        progress: 60,
        dailyTasksCompleted: 3,
        totalDailyTasks: 5
      },
      {
        id: 'kr-3',
        week: 4,
        title: '技术文档撰写',
        description: '编写API文档和使用指南',
        progress: 20,
        dailyTasksCompleted: 1,
        totalDailyTasks: 5
      }
    ]
  });

  const totalWeeks = 12;

  const handleWeekClick = (week: number) => {
    if (selectedWeek === week) {
      setSelectedWeek(null);
    } else {
      setSelectedWeek(week);
    }
  };

  const handleAddKR = (week: number) => {
    const newKR: WeekKR = {
      id: `kr-${Date.now()}`,
      week,
      title: '',
      description: '',
      progress: 0,
      dailyTasksCompleted: 0,
      totalDailyTasks: 0
    };
    
    setWeekKRs(prev => ({
      ...prev,
      [week]: [...(prev[week] || []), newKR]
    }));
  };

  const handleUpdateKR = (krId: string, updates: Partial<WeekKR>) => {
    setWeekKRs(prev => {
      const updated = { ...prev };
      for (const week in updated) {
        const weekKRList = updated[week];
        const krIndex = weekKRList.findIndex(kr => kr.id === krId);
        if (krIndex !== -1) {
          updated[week] = [
            ...weekKRList.slice(0, krIndex),
            { ...weekKRList[krIndex], ...updates },
            ...weekKRList.slice(krIndex + 1)
          ];
          break;
        }
      }
      return updated;
    });
  };

  const handleDeleteKR = (krId: string) => {
    setWeekKRs(prev => {
      const updated = { ...prev };
      for (const week in updated) {
        updated[week] = updated[week].filter(kr => kr.id !== krId);
      }
      return updated;
    });
  };

  const handleCreateDailyTask = (krId: string, krTitle: string) => {
    const today = new Date().toISOString().split('T')[0];
    onAddNote({
      content: `${krTitle} - 今日子任务`,
      layer: 'daily',
      date: today,
      color: '#FFF9C4',
      parentKRId: krId
    });
    
    // Update KR task count
    setWeekKRs(prev => {
      const updated = { ...prev };
      for (const week in updated) {
        const weekKRList = updated[week];
        const krIndex = weekKRList.findIndex(kr => kr.id === krId);
        if (krIndex !== -1) {
          const kr = { ...weekKRList[krIndex] };
          kr.totalDailyTasks += 1;
          updated[week] = [
            ...weekKRList.slice(0, krIndex),
            kr,
            ...weekKRList.slice(krIndex + 1)
          ];
          break;
        }
      }
      return updated;
    });
  };

  const getWeekDateRange = (week: number) => {
    const startDate = new Date(2025, 0, 1); // Starting from 2025-01-01
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + (week - 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')} ~ ${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;
  };

  const selectedWeekKRs = selectedWeek ? (weekKRs[selectedWeek] || []) : [];
  const todayNotes = notes.filter(note => note.date === new Date().toISOString().split('T')[0]);

  // 监听滚动事件，显示/隐藏滚动条
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      setIsScrolling(true);
      
      // 清除之前的定时器
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // 滚动停止后300ms隐藏滚动条
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 300);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const getWeekColor = (week: number) => {
    if (week <= completedWeeks) {
      return '#10b981'; // Green for completed
    } else if (week === currentWeek) {
      return '#fbbf24'; // Yellow for current
    }
    return 'transparent';
  };

  return (
    <div className="relative">
      {/* 停靠的 Puffy 在卡片左下角 */}
      {isDocked && mascotData && (
        <DockedPuffy
          mascotData={mascotData}
          onWakeUp={() => onDockChange?.(false)}
        />
      )}

      <div 
        className="glass-surface rounded-2xl shadow-2xl flex flex-col"
        style={{
          width: '25vw',
          minWidth: '400px',
          maxHeight: 'calc(100vh - 160px)',
          backdropFilter: 'blur(30px)',
          background: 'rgba(255, 255, 255, 0.35)',
        }}
      >
        {/* 12 Week Progress Circles - Fixed Header */}
        <div className="px-8 py-6 border-b border-white/20 flex-shrink-0">
          {/* Sprint Title */}
          <div className="mb-4 text-center">
            <h2 
              className="text-2xl opacity-60 mb-1"
              style={{ 
                fontFamily: "'Caveat', cursive",
                fontWeight: 600
              }}
            >
              Sprint 1
            </h2>
            <p className="text-sm opacity-50">
              第 {currentWeek} 周 / 共 {totalWeeks} 周
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Row 1: Weeks 1-6 */}
            <div className="flex gap-3 justify-center">
              {[1, 2, 3, 4, 5, 6].map((week) => (
                <motion.div
                  key={week}
                  className="relative cursor-pointer"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: week * 0.05 }}
                  onClick={() => handleWeekClick(week)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Week Circle */}
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      transition-all duration-300 relative
                      ${week === currentWeek ? 'ring-4 ring-yellow-200' : ''}
                      ${week === selectedWeek ? 'ring-4 ring-white' : ''}
                    `}
                    style={{
                      backgroundColor: getWeekColor(week),
                      border: week > currentWeek ? '2px dashed rgba(139, 69, 19, 0.3)' : 'none',
                      boxShadow: week === currentWeek 
                        ? '0 0 20px rgba(251, 191, 36, 0.6)' 
                        : week <= completedWeeks 
                        ? '0 4px 10px rgba(16, 185, 129, 0.3)'
                        : 'none'
                    }}
                  >
                    {/* Week Number */}
                    <span 
                      className="text-sm font-medium handwritten relative z-10"
                      style={{ 
                        color: week <= currentWeek ? 'white' : 'rgba(139, 69, 19, 0.5)'
                      }}
                    >
                      {week}
                    </span>

                    {/* Checkmark for completed weeks */}
                    {week <= completedWeeks && (
                      <svg 
                        className="absolute w-4 h-4 text-white top-1 right-0.5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Current Week Glow Effect */}
                  {week === currentWeek && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, transparent 70%)',
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Row 2: Weeks 7-12 */}
            <div className="flex gap-3 justify-center">
              {[7, 8, 9, 10, 11, 12].map((week) => (
                <motion.div
                  key={week}
                  className="relative cursor-pointer"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: week * 0.05 }}
                  onClick={() => handleWeekClick(week)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Week Circle */}
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      transition-all duration-300 relative
                      ${week === currentWeek ? 'ring-4 ring-yellow-200' : ''}
                      ${week === selectedWeek ? 'ring-4 ring-white' : ''}
                    `}
                    style={{
                      backgroundColor: getWeekColor(week),
                      border: week > currentWeek ? '2px dashed rgba(139, 69, 19, 0.3)' : 'none',
                      boxShadow: week === currentWeek 
                        ? '0 0 20px rgba(251, 191, 36, 0.6)' 
                        : week <= completedWeeks 
                        ? '0 4px 10px rgba(16, 185, 129, 0.3)'
                        : 'none'
                    }}
                  >
                    {/* Week Number */}
                    <span 
                      className="text-sm font-medium handwritten relative z-10"
                      style={{ 
                        color: week <= currentWeek ? 'white' : 'rgba(139, 69, 19, 0.5)'
                      }}
                    >
                      {week}
                    </span>

                    {/* Checkmark for completed weeks */}
                    {week <= completedWeeks && (
                      <svg 
                        className="absolute w-4 h-4 text-white top-1 right-0.5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Current Week Glow Effect */}
                  {week === currentWeek && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, transparent 70%)',
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mt-2 px-12">
              <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-yellow-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedWeeks / totalWeeks) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs opacity-50">
                <span>已完成: {completedWeeks} 周</span>
                <span>进度: {Math.round((completedWeeks / totalWeeks) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div 
          ref={scrollContainerRef}
          className={`overflow-y-auto flex-1 px-8 py-6 scroll-container ${isScrolling ? 'is-scrolling' : ''}`}
        >
          {/* Week Detail Section (Expandable) */}
          <AnimatePresence>
            {selectedWeek && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden overflow-x-hidden border-b border-white/20 pb-6 mb-6"
              >
                <div className="pt-4">
                  <h3 className="text-xl handwritten mb-1" style={{ color: 'rgba(45, 52, 54, 0.9)' }}>
                    第 {selectedWeek} 周
                  </h3>
                  <p className="text-xs opacity-50 mb-4">{getWeekDateRange(selectedWeek)}</p>
                  
                  <h4 className="text-sm font-medium opacity-70 mb-3">关键结果:</h4>
                  
                  <div className="space-y-3">
                    {selectedWeekKRs.length === 0 ? (
                      <div className="text-center py-8 opacity-40">
                        <p className="text-sm">该周还没有设置关键结果</p>
                        <p className="text-xs mt-2">点击下方"添加 KR"按钮开始</p>
                      </div>
                    ) : (
                      selectedWeekKRs.map((kr, index) => (
                        <KRTaskCard
                          key={kr.id}
                          kr={kr}
                          index={index}
                          onUpdateKR={handleUpdateKR}
                          onDeleteKR={handleDeleteKR}
                          onCreateDailyTask={handleCreateDailyTask}
                        />
                      ))
                    )}
                    
                    {selectedWeekKRs.length < 3 && (
                      <button
                        onClick={() => handleAddKR(selectedWeek)}
                        className="w-full py-2 rounded-lg border border-dashed border-white/30 hover:border-white/50 hover:bg-white/10 transition-all text-sm opacity-60 hover:opacity-100"
                      >
                        + 添加 KR
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Today's Focus Area */}
          <div className="overflow-x-auto -mx-8 px-8">
            <div className="mb-3">
              <h3 className="text-lg font-medium opacity-70">今日聚焦</h3>
              <p className="text-xs opacity-50">
                {new Date().toLocaleDateString('zh-CN', { 
                  month: 'long', 
                  day: 'numeric', 
                  weekday: 'long' 
                })}
              </p>
            </div>
            
            <TodayFocusArea
              notes={notes}
              onAddNote={onAddNote}
              onUpdateNote={onUpdateNote}
              onDeleteNote={onDeleteNote}
              onCompleteNote={onCompleteNote}
            />
          </div>
        </div>
      </div>

      {/* Ledge shadow */}
      <div 
        className="absolute -bottom-4 left-8 right-8 h-8 opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 70%)',
          filter: 'blur(8px)'
        }}
      />
    </div>
  );
}
