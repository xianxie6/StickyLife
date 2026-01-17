import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface StarAnimationProps {
  show: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function StarAnimation({ show, position = 'top' }: StarAnimationProps) {
  // 生成唯一的 ID 以避免 SVG 冲突
  const uniqueId = useMemo(() => `star-${Math.random().toString(36).substr(2, 9)}`, []);

  if (!show) return null;

  // 金色星星样式
  const starStyle = {
    position: 'absolute' as const,
    width: '24px',
    height: '24px',
    pointerEvents: 'none' as const,
    filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))',
  };

  // 根据位置调整偏移
  const positionMap = {
    top: { top: '-12px', left: '50%', transform: 'translateX(-50%)' },
    bottom: { bottom: '-12px', left: '50%', transform: 'translateX(-50%)' },
    left: { left: '-12px', top: '50%', transform: 'translateY(-50%)' },
    right: { right: '-12px', top: '50%', transform: 'translateY(-50%)' },
  };

  const starPath = 'M12 2L14.09 8.26L20 9.27L15 13.14L16.18 19.02L12 15.77L7.82 19.02L9 13.14L4 9.27L9.91 8.26L12 2Z';

  return (
    <motion.div
      style={{
        ...starStyle,
        ...positionMap[position],
        zIndex: 1000,
      }}
      initial={{ scale: 0, opacity: 0, rotate: 0 }}
      animate={{
        scale: [0, 1.2, 1],
        opacity: [0, 1, 1, 0],
        rotate: [0, 180, 360],
      }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        duration: 1.5,
        times: [0, 0.3, 0.7, 1],
        ease: 'easeOut',
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`starGradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
            <stop offset="50%" stopColor="#FFA500" stopOpacity="1" />
            <stop offset="100%" stopColor="#FF8C00" stopOpacity="0.8" />
          </linearGradient>
          <filter id={`glow-${uniqueId}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.path
          d={starPath}
          fill={`url(#starGradient-${uniqueId})`}
          filter={`url(#glow-${uniqueId})`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [1, 0.9, 1],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse' as const,
          }}
        />
      </svg>
    </motion.div>
  );
}
