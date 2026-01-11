import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { WeekKR } from '../types';
import { X } from 'lucide-react';

interface KRTaskCardProps {
  kr: WeekKR;
  index?: number;
  onUpdateKR: (krId: string, updates: Partial<WeekKR>) => void;
  onDeleteKR: (krId: string) => void;
  onCreateDailyTask: (krId: string, krTitle: string) => void;
}

export function KRTaskCard({ kr, index = 0, onUpdateKR, onDeleteKR, onCreateDailyTask }: KRTaskCardProps) {
  const [isEditing, setIsEditing] = useState(!kr.title);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.1 }}
      className="paper-texture rounded-lg p-4 mb-3 group relative"
      style={{
        backgroundColor: '#F7F9F9',
        boxShadow: '0 4px 12px rgba(45, 52, 54, 0.1)',
      }}
    >
      {/* KR Number Badge */}
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{
            backgroundColor: '#FFF9C4',
            color: 'rgba(45, 52, 54, 0.7)',
          }}
        >
          {index + 1}
        </div>

        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <input
                autoFocus
                type="text"
                value={kr.title}
                onChange={(e) => onUpdateKR(kr.id, { title: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && kr.title.trim()) setIsEditing(false);
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                placeholder="关键结果标题..."
                className="w-full bg-white/60 px-2 py-1 rounded outline-none text-sm handwritten"
                style={{ color: 'rgba(45, 52, 54, 0.9)' }}
              />
              <textarea
                value={kr.description}
                onChange={(e) => onUpdateKR(kr.id, { description: e.target.value })}
                placeholder="描述（可选）..."
                className="w-full bg-white/60 px-2 py-1 rounded outline-none text-xs resize-none"
                style={{ color: 'rgba(45, 52, 54, 0.6)' }}
                rows={2}
              />
            </div>
          ) : (
            <div className="space-y-1" onDoubleClick={() => setIsEditing(true)}>
              <h4 className="text-sm font-medium handwritten" style={{ color: 'rgba(45, 52, 54, 0.9)' }}>
                第{kr.week}周 - {kr.title}
              </h4>
              {kr.description && (
                <p className="text-xs opacity-60">{kr.description}</p>
              )}
            </div>
          )}

          {/* Progress Section */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs opacity-60">
              <span>进度: {kr.progress}%</span>
              <span>{kr.dailyTasksCompleted} / {kr.totalDailyTasks} 日任务</span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-yellow-400"
                initial={{ width: 0 }}
                animate={{ width: `${kr.progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Create Daily Task Button */}
            <button
              onClick={() => onCreateDailyTask(kr.id, kr.title)}
              className="w-full mt-2 py-2 rounded-lg border border-dashed border-black/10 hover:border-black/20 hover:bg-black/5 transition-all flex items-center justify-center gap-2 text-xs opacity-60 hover:opacity-100"
            >
              <span>点击分解今日任务</span>
            </button>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onDeleteKR(kr.id)}
          className="flex-shrink-0 p-1.5 rounded hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
        >
          <X className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </motion.div>
  );
}
