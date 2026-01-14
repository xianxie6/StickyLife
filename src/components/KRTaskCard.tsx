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
        // iOS 液态玻璃效果 - 20% 透明度
        backdropFilter: 'blur(50px) saturate(250%) brightness(110%)',
        WebkitBackdropFilter: 'blur(50px) saturate(250%) brightness(110%)',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.18) 50%, rgba(255, 255, 255, 0.2) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        WebkitAppRegion: 'no-drag',
        boxShadow: `
          0 12px 40px 0 rgba(0, 0, 0, 0.06),
          0 4px 16px 0 rgba(255, 255, 255, 0.1),
          inset 0 2px 0 0 rgba(255, 255, 255, 0.7),
          inset 0 -1px 0 0 rgba(255, 255, 255, 0.4),
          inset 0 0 20px 0 rgba(255, 255, 255, 0.05)
        `,
      }}
    >
      {/* KR Number Badge */}
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.7)',
            color: '#ffffff',
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
                className="w-full px-2 py-1 rounded outline-none text-sm handwritten"
                style={{ 
                  color: '#ffffff',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
                  WebkitAppRegion: 'no-drag',
                }}
              />
              <textarea
                value={kr.description}
                onChange={(e) => onUpdateKR(kr.id, { description: e.target.value })}
                placeholder="描述（可选）..."
                className="w-full px-2 py-1 rounded outline-none text-xs resize-none"
                style={{ 
                  color: '#ffffff',
                  opacity: 0.9,
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
                  WebkitAppRegion: 'no-drag',
                }}
                rows={2}
              />
            </div>
          ) : (
            <div className="space-y-1" onDoubleClick={() => setIsEditing(true)}>
              <h4 className="text-sm font-medium handwritten" style={{ color: '#ffffff' }}>
                第{kr.week}周 - {kr.title}
              </h4>
              {kr.description && (
                <p className="text-xs" style={{ color: '#ffffff', opacity: 0.7 }}>{kr.description}</p>
              )}
            </div>
          )}

          {/* Progress Section */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs" style={{ color: '#ffffff', opacity: 0.8 }}>
              <span>进度: {kr.progress}%</span>
              <span>{kr.dailyTasksCompleted} / {kr.totalDailyTasks} 日任务</span>
            </div>
            
            {/* Progress Bar */}
            <div 
              className="h-1.5 rounded-full overflow-hidden"
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-yellow-400"
                initial={{ width: 0 }}
                animate={{ width: `${kr.progress}%` }}
                transition={{ duration: 0.5 }}
                style={{
                  boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)',
                }}
              />
            </div>

            {/* Create Daily Task Button */}
            <button
              onClick={() => onCreateDailyTask(kr.id, kr.title)}
              className="w-full mt-2 py-2 rounded-lg border border-dashed transition-all flex items-center justify-center gap-2 text-xs"
              style={{ 
                color: '#ffffff',
                opacity: 0.8,
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
                WebkitAppRegion: 'no-drag',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)';
              }}
            >
              <span>点击分解今日任务</span>
            </button>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onDeleteKR(kr.id)}
          className="flex-shrink-0 p-1.5 rounded transition-all opacity-0 group-hover:opacity-100"
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            WebkitAppRegion: 'no-drag',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.15) 100%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)';
          }}
        >
          <X className="w-4 h-4" style={{ color: '#ffffff' }} />
        </button>
      </div>
    </motion.div>
  );
}
