import React from 'react';
import { MergedFocusCard } from './MergedFocusCard';
import { StickyNote } from '../types';
import { motion } from 'framer-motion';

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

  const dailyNotes = notes.filter(n => n.layer === 'daily');


  return (
    <div className="fixed inset-0 overflow-hidden bg-transparent">
      {/* 只显示卡片，无背景 */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-auto"
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
