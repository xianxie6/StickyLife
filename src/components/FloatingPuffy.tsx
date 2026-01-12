import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { MascotContainer } from './MascotContainer';

interface FloatingPuffyProps {
  cardPosition: { x: number; y: number };
  cardSize: { width: number; height: number };
  mascotData: {
    currentWeek: number;
    completionRate: number;
    overdueCount: number;
  };
  onDock: () => void;
}

export function FloatingPuffy({
  cardPosition,
  cardSize,
  mascotData,
  onDock,
}: FloatingPuffyProps) {
  // 初始位置：屏幕右上角（如果卡片位置还没计算好）
  const initialX = cardPosition.x > 0 ? cardPosition.x - 280 : window.innerWidth - 300;
  const initialY = cardPosition.y > 0 ? cardPosition.y - 20 : 20;
  
  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);
  const lastClickTime = useRef(0);

  // 使用 spring 动画实现跟随效果（带延迟）
  const springX = useSpring(x, { stiffness: 100, damping: 20 });
  const springY = useSpring(y, { stiffness: 100, damping: 20 });

  useEffect(() => {
    // 更新目标位置（卡片右上角外侧）
    if (cardPosition.x > 0 && cardPosition.y > 0) {
      x.set(cardPosition.x - 280);
      y.set(cardPosition.y - 20);
    }
  }, [cardPosition, x, y]);

  const handleDoubleClick = () => {
    const now = Date.now();
    if (now - lastClickTime.current < 300) {
      onDock();
    }
    lastClickTime.current = now;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onDock();
  };

  return (
    <motion.div
      style={{
        position: 'fixed',
        x: springX,
        y: springY,
        width: '280px',
        height: '280px',
        pointerEvents: 'auto',
        zIndex: 1000,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6 }}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      whileHover={{ scale: 1.05 }}
    >
      <MascotContainer
        currentWeek={mascotData.currentWeek}
        completionRate={mascotData.completionRate}
        overdueCount={mascotData.overdueCount}
        className="w-full h-full"
      />
    </motion.div>
  );
}
