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
        {/* Center/Bottom: Merged 12-Week + Today's Focus */}
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
