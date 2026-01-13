import React, { useRef, useEffect } from 'react';
import { MergedFocusCard } from './MergedFocusCard';
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
  const cardRef = useRef<HTMLDivElement>(null);

  const dailyNotes = notes.filter(n => n.layer === 'daily');

  // 拖拽功能
  const { position: dragPosition, handleMouseDown, setPosition } = useDraggable();


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
          />
        </motion.div>

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

    </div>
  );
}
