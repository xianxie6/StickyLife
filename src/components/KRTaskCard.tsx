import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeekKR } from '../types';
import { X, Check } from 'lucide-react';
import { StarAnimation } from './StarAnimation';

interface KRTaskCardProps {
  kr: WeekKR;
  index?: number;
  onUpdateKR: (krId: string, updates: Partial<WeekKR>) => void;
  onDeleteKR: (krId: string) => void;
  onCreateDailyTask: (krId: string, krTitle: string) => void;
}

export function KRTaskCard({ kr, index = 0, onUpdateKR, onDeleteKR, onCreateDailyTask }: KRTaskCardProps) {
  const [isEditing, setIsEditing] = useState(!kr.title);
  const [showStar, setShowStar] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // 确认输入
  const handleConfirm = () => {
    if (kr.title.trim()) {
      setIsEditing(false);
    }
  };

  // 点击空白区域确认
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        if (kr.title.trim()) {
          setIsEditing(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, kr.title]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-xl p-4 mb-3 group relative overflow-hidden"
      style={{
        // iOS 控制中心风格的液态玻璃效果 - 增强版
        backdropFilter: 'blur(50px) saturate(200%) brightness(110%)',
        WebkitBackdropFilter: 'blur(50px) saturate(200%) brightness(110%)',
        background: isEditing
          ? `
            linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.25) 50%, rgba(255, 255, 255, 0.28) 100%),
            radial-gradient(circle at top left, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
            radial-gradient(circle at bottom right, rgba(240, 248, 255, 0.12) 0%, transparent 50%)
          `
          : `
            linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.23) 100%),
            radial-gradient(circle at top left, rgba(255, 255, 255, 0.12) 0%, transparent 50%),
            radial-gradient(circle at bottom right, rgba(240, 248, 255, 0.1) 0%, transparent 50%)
          `,
        backgroundBlendMode: 'overlay, normal, normal',
        border: isEditing 
          ? '1px solid rgba(255, 255, 255, 0.6)' 
          : '1px solid rgba(255, 255, 255, 0.4)',
        WebkitAppRegion: 'no-drag',
        boxShadow: isEditing
          ? `
            0 4px 16px 0 rgba(0, 0, 0, 0.08),
            0 2px 8px 0 rgba(0, 0, 0, 0.05),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.7),
            inset 0 -1px 0 0 rgba(255, 255, 255, 0.3)
          `
          : `
            0 4px 16px 0 rgba(0, 0, 0, 0.06),
            0 2px 8px 0 rgba(0, 0, 0, 0.04),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.6),
            inset 0 -1px 0 0 rgba(255, 255, 255, 0.2)
          `,
        position: 'relative',
      }}
    >
      {/* 磨砂质感层 - iOS 控制中心风格 - 增强版 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.03) 2px,
              rgba(255, 255, 255, 0.03) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(255, 255, 255, 0.02) 2px,
              rgba(255, 255, 255, 0.02) 4px
            ),
            radial-gradient(
              circle at 20% 30%,
              rgba(255, 255, 255, 0.06) 0%,
              transparent 20%
            ),
            radial-gradient(
              circle at 80% 70%,
              rgba(200, 220, 255, 0.05) 0%,
              transparent 25%
            )
          `,
          backgroundSize: '8px 8px, 8px 8px, 100% 100%, 100% 100%',
          pointerEvents: 'none',
          mixBlendMode: 'overlay',
          opacity: 0.6,
        }}
      />
      {/* 光泽层 - 增加液态玻璃的光泽感 - 增强版 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: `
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.2) 0%,
              transparent 35%,
              transparent 65%,
              rgba(255, 255, 255, 0.08) 100%
            ),
            linear-gradient(
              45deg,
              transparent 0%,
              rgba(255, 255, 255, 0.05) 50%,
              transparent 100%
            )
          `,
          pointerEvents: 'none',
          mixBlendMode: 'soft-light',
          opacity: 0.8,
        }}
      />
      {/* KR Number Badge - iOS 控制中心风格 */}
      <div className="flex items-start gap-3 relative z-10">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold relative overflow-hidden"
          style={{
            backdropFilter: 'blur(40px) saturate(200%) brightness(110%)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%) brightness(110%)',
            background: `
              linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%),
              radial-gradient(circle at top left, rgba(255, 255, 255, 0.2) 0%, transparent 60%)
            `,
            border: '1px solid rgba(255, 255, 255, 0.5)',
            boxShadow: `
              inset 0 1px 0 0 rgba(255, 255, 255, 0.7),
              0 2px 8px 0 rgba(0, 0, 0, 0.12),
              inset 0 0 15px 0 rgba(255, 255, 255, 0.1)
            `,
            color: '#2d3436',
          }}
        >
          {/* 磨砂质感 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 1px,
                  rgba(255, 255, 255, 0.04) 1px,
                  rgba(255, 255, 255, 0.04) 2px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 1px,
                  rgba(255, 255, 255, 0.03) 1px,
                  rgba(255, 255, 255, 0.03) 2px
                )
              `,
              backgroundSize: '3px 3px',
              pointerEvents: 'none',
              mixBlendMode: 'overlay',
              opacity: 0.6,
            }}
          />
          {/* 光泽层 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%)',
              pointerEvents: 'none',
              mixBlendMode: 'soft-light',
            }}
          />
          <span className="relative z-10">{index + 1}</span>
        </div>

        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <input
                ref={inputRef}
                autoFocus
                type="text"
                value={kr.title}
                onChange={(e) => onUpdateKR(kr.id, { title: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && kr.title.trim()) {
                    handleConfirm();
                  }
                  if (e.key === 'Escape') {
                    setIsEditing(false);
                  }
                }}
                placeholder="创建新的任务"
                className="kr-input-field w-full px-3 py-2 rounded-xl outline-none text-sm handwritten relative z-10"
                style={{ 
                  color: '#222',
                  backdropFilter: 'blur(40px) saturate(200%) brightness(110%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(200%) brightness(110%)',
                  background: `
                    linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%),
                    radial-gradient(circle at top left, rgba(255, 255, 255, 0.15) 0%, transparent 50%)
                  `,
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: `
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.7),
                    0 2px 8px 0 rgba(0, 0, 0, 0.1),
                    inset 0 0 20px 0 rgba(255, 255, 255, 0.05)
                  `,
                  WebkitAppRegion: 'no-drag',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.8),
                    0 0 0 1px rgba(255, 255, 255, 0.6),
                    0 0 25px rgba(255, 255, 255, 0.4),
                    0 0 50px rgba(255, 255, 255, 0.2),
                    inset 0 0 25px 0 rgba(255, 255, 255, 0.1)
                  `;
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.7)';
                  e.currentTarget.style.background = `
                    linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.3) 100%),
                    radial-gradient(circle at top left, rgba(255, 255, 255, 0.2) 0%, transparent 50%)
                  `;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = `
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.7),
                    0 2px 8px 0 rgba(0, 0, 0, 0.1),
                    inset 0 0 20px 0 rgba(255, 255, 255, 0.05)
                  `;
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.5)';
                  e.currentTarget.style.background = `
                    linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%),
                    radial-gradient(circle at top left, rgba(255, 255, 255, 0.15) 0%, transparent 50%)
                  `;
                }}
              />
              <textarea
                ref={textareaRef}
                value={kr.description}
                onChange={(e) => onUpdateKR(kr.id, { description: e.target.value })}
                placeholder="描述（可选）..."
                className="kr-textarea-field w-full px-3 py-2 rounded-xl outline-none text-xs resize-none relative z-10"
                style={{ 
                  color: '#222',
                  opacity: 1,
                  backdropFilter: 'blur(40px) saturate(200%) brightness(110%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(200%) brightness(110%)',
                  background: `
                    linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%),
                    radial-gradient(circle at top left, rgba(255, 255, 255, 0.12) 0%, transparent 50%)
                  `,
                  border: '1px solid rgba(255, 255, 255, 0.45)',
                  boxShadow: `
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.6),
                    0 2px 8px 0 rgba(0, 0, 0, 0.08),
                    inset 0 0 20px 0 rgba(255, 255, 255, 0.04)
                  `,
                  WebkitAppRegion: 'no-drag',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.7),
                    0 0 25px rgba(255, 255, 255, 0.4),
                    0 0 50px rgba(255, 255, 255, 0.2),
                    inset 0 0 25px 0 rgba(255, 255, 255, 0.08)
                  `;
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.6)';
                  e.currentTarget.style.background = `
                    linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%),
                    radial-gradient(circle at top left, rgba(255, 255, 255, 0.18) 0%, transparent 50%)
                  `;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = `
                    inset 0 1px 0 0 rgba(255, 255, 255, 0.6),
                    0 2px 8px 0 rgba(0, 0, 0, 0.08),
                    inset 0 0 20px 0 rgba(255, 255, 255, 0.04)
                  `;
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.45)';
                  e.currentTarget.style.background = `
                    linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%),
                    radial-gradient(circle at top left, rgba(255, 255, 255, 0.12) 0%, transparent 50%)
                  `;
                }}
                rows={2}
              />
            </div>
          ) : (
            <div className="space-y-1 relative z-10" onDoubleClick={() => setIsEditing(true)}>
              <h4 className="text-sm font-medium handwritten" style={{ color: '#2d3436' }}>
{kr.title}
              </h4>
              {kr.description && (
                <p className="text-xs" style={{ color: '#2d3436', opacity: 0.6 }}>{kr.description}</p>
              )}
            </div>
          )}

          {/* Progress Section */}
          <div className="mt-3 space-y-2 relative z-10">
            <div className="flex items-center justify-between text-xs relative" style={{ color: '#2d3436', opacity: 0.8 }}>
              <span>进度: {kr.progress}%</span>
              <span className="relative">
                {kr.dailyTasksCompleted} / {kr.totalDailyTasks} 日任务
                <AnimatePresence>
                  {showStar && <StarAnimation show={showStar} position="top" />}
                </AnimatePresence>
              </span>
            </div>
            
            {/* Progress Bar - iOS 控制中心风格 - 增强版 */}
            <div 
              className="h-1.5 rounded-full overflow-hidden relative"
              style={{
                backdropFilter: 'blur(30px) saturate(200%) brightness(110%)',
                WebkitBackdropFilter: 'blur(30px) saturate(200%) brightness(110%)',
                background: `
                  linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%),
                  radial-gradient(circle at left, rgba(255, 255, 255, 0.15) 0%, transparent 50%)
                `,
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: `
                  inset 0 1px 2px 0 rgba(0, 0, 0, 0.12),
                  inset 0 0 10px 0 rgba(255, 255, 255, 0.05),
                  0 1px 4px 0 rgba(0, 0, 0, 0.08)
                `,
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

            {/* Create Daily Task Button - iOS 控制中心风格 */}
            <button
              onClick={() => {
                setShowStar(true);
                onCreateDailyTask(kr.id, kr.title);
                // 1.5秒后自动隐藏星星（动画持续时间）
                setTimeout(() => setShowStar(false), 1500);
              }}
              className="w-full mt-2 py-2.5 rounded-xl border border-dashed transition-all flex items-center justify-center gap-2 text-xs relative overflow-hidden"
              style={{ 
                color: '#2d3436',
                opacity: 0.9,
                backdropFilter: 'blur(40px) saturate(200%) brightness(110%)',
                WebkitBackdropFilter: 'blur(40px) saturate(200%) brightness(110%)',
                background: `
                  linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%),
                  radial-gradient(circle at top left, rgba(255, 255, 255, 0.15) 0%, transparent 50%)
                `,
                borderColor: 'rgba(255, 255, 255, 0.5)',
                boxShadow: `
                  inset 0 1px 0 0 rgba(255, 255, 255, 0.7),
                  0 2px 8px 0 rgba(0, 0, 0, 0.1),
                  inset 0 0 20px 0 rgba(255, 255, 255, 0.05)
                `,
                WebkitAppRegion: 'no-drag',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
                e.currentTarget.style.background = `
                  linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%),
                  radial-gradient(circle at top left, rgba(255, 255, 255, 0.2) 0%, transparent 50%)
                `;
                e.currentTarget.style.boxShadow = `
                  inset 0 1px 0 0 rgba(255, 255, 255, 0.8),
                  0 4px 12px 0 rgba(0, 0, 0, 0.15),
                  inset 0 0 25px 0 rgba(255, 255, 255, 0.08)
                `;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                e.currentTarget.style.background = `
                  linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%),
                  radial-gradient(circle at top left, rgba(255, 255, 255, 0.15) 0%, transparent 50%)
                `;
                e.currentTarget.style.boxShadow = `
                  inset 0 1px 0 0 rgba(255, 255, 255, 0.7),
                  0 2px 8px 0 rgba(0, 0, 0, 0.1),
                  inset 0 0 20px 0 rgba(255, 255, 255, 0.05)
                `;
              }}
            >
              {/* 按钮磨砂质感 - 增强版 */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'inherit',
                  backgroundImage: `
                    repeating-linear-gradient(
                      0deg,
                      transparent,
                      transparent 2px,
                      rgba(255, 255, 255, 0.03) 2px,
                      rgba(255, 255, 255, 0.03) 4px
                    ),
                    repeating-linear-gradient(
                      90deg,
                      transparent,
                      transparent 2px,
                      rgba(255, 255, 255, 0.02) 2px,
                      rgba(255, 255, 255, 0.02) 4px
                    )
                  `,
                  backgroundSize: '6px 6px',
                  pointerEvents: 'none',
                  mixBlendMode: 'overlay',
                  opacity: 0.5,
                }}
              />
              {/* 按钮光泽层 */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'inherit',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
                  pointerEvents: 'none',
                  mixBlendMode: 'soft-light',
                }}
              />
              <span className="relative z-10">点击分解今日任务</span>
            </button>
          </div>
        </div>

        {/* Delete/Confirm Button */}
        {isEditing ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleConfirm();
            }}
            className="flex-shrink-0 p-1.5 rounded-full transition-all relative overflow-hidden"
            style={{
              backdropFilter: 'blur(30px) saturate(200%) brightness(110%)',
              WebkitBackdropFilter: 'blur(30px) saturate(200%) brightness(110%)',
              background: `
                linear-gradient(135deg, rgba(34, 197, 94, 0.35) 0%, rgba(34, 197, 94, 0.25) 100%),
                radial-gradient(circle at top left, rgba(34, 197, 94, 0.2) 0%, transparent 50%)
              `,
              border: '1px solid rgba(34, 197, 94, 0.6)',
              boxShadow: `
                inset 0 1px 0 0 rgba(255, 255, 255, 0.6),
                0 2px 8px 0 rgba(34, 197, 94, 0.2),
                inset 0 0 15px 0 rgba(255, 255, 255, 0.1)
              `,
              WebkitAppRegion: 'no-drag',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `
                linear-gradient(135deg, rgba(34, 197, 94, 0.45) 0%, rgba(34, 197, 94, 0.35) 100%),
                radial-gradient(circle at top left, rgba(34, 197, 94, 0.25) 0%, transparent 50%)
              `;
              e.currentTarget.style.boxShadow = `
                inset 0 1px 0 0 rgba(255, 255, 255, 0.7),
                0 4px 12px 0 rgba(34, 197, 94, 0.3),
                inset 0 0 20px 0 rgba(255, 255, 255, 0.12)
              `;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `
                linear-gradient(135deg, rgba(34, 197, 94, 0.35) 0%, rgba(34, 197, 94, 0.25) 100%),
                radial-gradient(circle at top left, rgba(34, 197, 94, 0.2) 0%, transparent 50%)
              `;
              e.currentTarget.style.boxShadow = `
                inset 0 1px 0 0 rgba(255, 255, 255, 0.6),
                0 2px 8px 0 rgba(34, 197, 94, 0.2),
                inset 0 0 15px 0 rgba(255, 255, 255, 0.1)
              `;
            }}
            title="确认提交"
          >
            {/* 磨砂质感 */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                backgroundImage: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 1px,
                    rgba(255, 255, 255, 0.03) 1px,
                    rgba(255, 255, 255, 0.03) 2px
                  )
                `,
                backgroundSize: '3px 3px',
                pointerEvents: 'none',
                mixBlendMode: 'overlay',
                opacity: 0.5,
              }}
            />
            <Check className="w-4 h-4 relative z-10" style={{ color: '#2d3436' }} />
          </button>
        ) : (
          <button
            onClick={() => onDeleteKR(kr.id)}
            className="flex-shrink-0 p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 relative overflow-hidden"
            style={{
              backdropFilter: 'blur(30px) saturate(200%) brightness(110%)',
              WebkitBackdropFilter: 'blur(30px) saturate(200%) brightness(110%)',
              background: `
                linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%),
                radial-gradient(circle at top left, rgba(255, 255, 255, 0.15) 0%, transparent 50%)
              `,
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: `
                inset 0 1px 0 0 rgba(255, 255, 255, 0.6),
                0 2px 8px 0 rgba(0, 0, 0, 0.1),
                inset 0 0 15px 0 rgba(255, 255, 255, 0.08)
              `,
              WebkitAppRegion: 'no-drag',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `
                linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.2) 100%),
                radial-gradient(circle at top left, rgba(255, 255, 255, 0.2) 0%, transparent 50%)
              `;
              e.currentTarget.style.boxShadow = `
                inset 0 1px 0 0 rgba(255, 255, 255, 0.7),
                0 4px 12px 0 rgba(0, 0, 0, 0.15),
                inset 0 0 20px 0 rgba(255, 255, 255, 0.1)
              `;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `
                linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%),
                radial-gradient(circle at top left, rgba(255, 255, 255, 0.15) 0%, transparent 50%)
              `;
              e.currentTarget.style.boxShadow = `
                inset 0 1px 0 0 rgba(255, 255, 255, 0.6),
                0 2px 8px 0 rgba(0, 0, 0, 0.1),
                inset 0 0 15px 0 rgba(255, 255, 255, 0.08)
              `;
            }}
            title="删除"
          >
            {/* 磨砂质感 */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                backgroundImage: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 1px,
                    rgba(255, 255, 255, 0.03) 1px,
                    rgba(255, 255, 255, 0.03) 2px
                  )
                `,
                backgroundSize: '3px 3px',
                pointerEvents: 'none',
                mixBlendMode: 'overlay',
                opacity: 0.5,
              }}
            />
            <X className="w-4 h-4 relative z-10" style={{ color: '#2d3436' }} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
