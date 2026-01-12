import React, { useMemo, useState, useRef, useEffect } from 'react';
import { MergedFocusCard } from './MergedFocusCard';
import { FloatingPuffy } from './FloatingPuffy';
import { MascotDebugPanel } from './MascotDebugPanel';
import { ErrorBoundary } from './ErrorBoundary';
import { StickyNote } from '../types';
import { motion } from 'framer-motion';
import { useDraggable } from '../hooks/useDraggable';

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
  const currentWeek = 4;
  const completedWeeks = 3;
  const [isDocked, setIsDocked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardPosition, setCardPosition] = useState({ 
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, 
    y: typeof window !== 'undefined' ? window.innerHeight - 400 : 0 
  });
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });

  const dailyNotes = notes.filter(n => n.layer === 'daily');

  // 拖拽功能
  const { position: dragPosition, handleMouseDown, setPosition } = useDraggable({
    onDragStart: () => {
      // 拖拽开始时记录卡片位置
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setCardSize({ width: rect.width, height: rect.height });
      }
    },
  });

  // 监听卡片位置变化，更新 Puffy 跟随位置
  useEffect(() => {
    if (cardRef.current && !isDocked) {
      const updatePosition = () => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (rect) {
          setCardPosition({
            x: rect.left + rect.width,
            y: rect.top,
          });
        }
      };
      updatePosition();
      const interval = setInterval(updatePosition, 100);
      return () => clearInterval(interval);
    }
  }, [dragPosition, isDocked]);

  // 初始位置：居中底部（延迟设置，确保 DOM 已渲染）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setPosition({
          x: window.innerWidth / 2 - rect.width / 2,
          y: window.innerHeight - rect.height - 64,
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [setPosition]);

  // 计算 Mascot 所需的数据
  const mascotData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // 合并所有任务（包括已完成的和未完成的）
    const allTasks = [...notes, ...completedNotes];
    
    // 计算完成率：已完成的任务 / 总任务
    // 注意：completedNotes 中的任务都是已完成的
    const totalTasks = allTasks.length;
    const completedTasksCount = completedNotes.length + notes.filter(n => n.completed === true).length;
    const completionRate = totalTasks > 0 
      ? completedTasksCount / totalTasks 
      : 0;

    // 计算逾期任务数：日期已过但未完成的任务（只在 notes 中查找，completedNotes 不算逾期）
    const overdueCount = notes.filter(note => {
      if (note.completed) return false;
      if (!note.date) return false;
      return note.date < today;
    }).length;

    // 调试日志
    if (process.env.NODE_ENV === 'development') {
      console.log('[Mascot Data]', {
        currentWeek,
        completionRate: `${(completionRate * 100).toFixed(1)}%`,
        overdueCount,
        totalTasks,
        completedTasks: completedTasksCount,
        activeNotes: notes.length,
        completedNotes: completedNotes.length,
      });
    }

    return {
      currentWeek,
      completionRate,
      overdueCount,
    };
  }, [notes, completedNotes, currentWeek]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Desktop Wallpaper Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1597434429739-2574d7e06807?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBtb3VudGFpbiUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3Njc2ODI5ODh8MA&ixlib=rb-4.1.0&q=80&w=1080)',
        }}
      />

      {/* Frameless Transparent Glass Layer Container */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Center/Bottom: Merged 12-Week + Today's Focus - 可拖拽 */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 40 }}
          animate={{
            opacity: 1,
            x: dragPosition.x,
            y: dragPosition.y,
          }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
          onMouseDown={handleMouseDown}
          className="absolute pointer-events-auto cursor-move"
          style={{
            left: 0,
            top: 0,
            userSelect: 'none',
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <MergedFocusCard
            notes={dailyNotes}
            currentWeek={currentWeek}
            completedWeeks={completedWeeks}
            onAddNote={onAddNote}
            onUpdateNote={onUpdateNote}
            onDeleteNote={onDeleteNote}
            onCompleteNote={onCompleteNote}
            isDocked={isDocked}
            onDockChange={setIsDocked}
            mascotData={mascotData}
          />
        </motion.div>

        {/* Puffy Mascot - 跟随卡片或停靠 */}
        {!isDocked && (
          <ErrorBoundary>
            <FloatingPuffy
              cardPosition={cardPosition}
              cardSize={cardSize}
              mascotData={mascotData}
              onDock={() => setIsDocked(true)}
            />
          </ErrorBoundary>
        )}

        {/* Ambient light effects */}
        <div 
          className="absolute top-0 left-0 w-96 h-96 opacity-30 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,249,196,0.3) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
        <div 
          className="absolute bottom-0 right-0 w-96 h-96 opacity-20 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 70% 70%, rgba(224,201,166,0.2) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
      </div>

      {/* 调试面板（仅开发环境） */}
      <MascotDebugPanel />
    </div>
  );
}
