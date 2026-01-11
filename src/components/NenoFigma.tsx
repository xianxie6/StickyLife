import React from 'react';
import { motion } from 'framer-motion';
import { NenoMood } from '../types';

interface NenoProps {
  mood?: NenoMood;
  size?: 'small' | 'normal' | 'large';
  onInteract?: () => void;
}

export function Neno({ mood = 'idle', size = 'normal', onInteract }: NenoProps) {
  const sizeMap = {
    small: 'w-16 h-16',
    normal: 'w-20 h-20',
    large: 'w-32 h-32'
  };

  const getMoodAnimation = () => {
    switch (mood) {
      case 'happy':
        return { rotate: [0, -5, 5, -5, 0], scale: [1, 1.08, 1] };
      case 'working':
        return { y: [0, -5, 0], rotate: [0, 3, -3, 0] };
      case 'sleeping':
        return { scale: [1, 0.96, 1], rotate: [0, -1, 0] };
      default:
        return { rotate: [-2, 2, -2], y: [0, -2, 0] };
    }
  };

  return (
    <motion.div
      className={`${sizeMap[size]} relative cursor-pointer select-none flex items-center justify-center`}
      animate={getMoodAnimation()}
      transition={{
        duration: mood === 'sleeping' ? 3 : mood === 'working' ? 1.5 : 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      onClick={onInteract}
      whileHover={{ scale: 1.1, rotate: 0 }}
      whileTap={{ scale: 0.92 }}
      style={{
        filter: 'drop-shadow(0 4px 8px rgba(45, 52, 54, 0.2))'
      }}
    >
      {/* 使用简单的 emoji 或文本作为占位，后续可以替换为图片 */}
      <div 
        className="text-6xl"
        style={{
          fontSize: size === 'small' ? '3rem' : size === 'large' ? '6rem' : '4rem'
        }}
      >
        📝
      </div>

      {/* Mood Effects Overlay */}
      {mood === 'happy' && (
        <motion.div
          className="absolute -top-2 -right-2 text-xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0] 
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          ✨
        </motion.div>
      )}
      
      {mood === 'working' && (
        <motion.div
          className="absolute -top-3 left-1/2 -translate-x-1/2"
          animate={{ 
            y: [0, -8, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-lg">💪</span>
        </motion.div>
      )}
      
      {mood === 'sleeping' && (
        <motion.div
          className="absolute -top-2 right-0"
          animate={{ 
            opacity: [0.3, 1, 0.3],
            x: [0, 5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-sm">💤</span>
        </motion.div>
      )}
    </motion.div>
  );
}
