import React, { useMemo } from 'react';
import { MergedFocusCard } from './MergedFocusCard';
import { StickyNote } from '../types';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

interface DesktopWidgetProps {
  notes: StickyNote[];
  completedNotes: StickyNote[];
  onAddNote: (note: Omit<StickyNote, 'id' | 'createdAt'>) => void;
  onUpdateNote: (id: string, updates: Partial<StickyNote>) => void;
  onDeleteNote: (id: string) => void;
  onCompleteNote: (id: string) => void;
  onMigrateNote: (id: string, newLayer: 'daily' | 'weekly' | 'yearly', newDate?: string) => void;
}

export function DesktopWidget({
  notes,
  completedNotes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onCompleteNote,
  onMigrateNote
}: DesktopWidgetProps) {
  const { userSettings, weeks } = useStore();
  
  // 计算当前周（从用户设置或默认第1周）
  const currentWeek = userSettings.currentWeek || 1;
  
  // 计算已完成的周数（该周所有 KR 的进度都 >= 100%）
  const completedWeeks = useMemo(() => {
    if (weeks.length === 0) return 0;
    
    // 获取所有唯一的周数
    const uniqueWeeks = new Set(weeks.map(kr => kr.week));
    let completedCount = 0;
    
    // 检查每一周是否完成
    uniqueWeeks.forEach(week => {
      const weekKRs = weeks.filter(k => k.week === week);
      // 如果该周有 KR 且所有 KR 的进度都 >= 100%，则认为该周完成
      if (weekKRs.length > 0 && weekKRs.every(k => k.progress >= 100)) {
        completedCount++;
      }
    });
    
    return completedCount;
  }, [weeks]);

  const dailyNotes = notes.filter(n => n.layer === 'daily');


  return (
    <div 
      className="w-full h-full flex items-center justify-center overflow-hidden" 
      style={{ 
        pointerEvents: 'none' // 背景区域设置为点击穿透
      }}
    >
      {/* 卡片容器 */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full h-full flex items-center justify-center"
        style={{ 
          pointerEvents: 'auto' // 卡片区域可以接收鼠标事件
        }}
      >
        <MergedFocusCard
          notes={dailyNotes}
          currentWeek={currentWeek}
          completedWeeks={completedWeeks}
          onAddNote={onAddNote}
          onUpdateNote={onUpdateNote}
          onDeleteNote={onDeleteNote}
          onCompleteNote={onCompleteNote}
        />
      </motion.div>
    </div>
  );
}
