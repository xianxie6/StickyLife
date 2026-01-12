import { motion } from 'framer-motion';
import { MascotContainer } from './MascotContainer';

interface DockedPuffyProps {
  mascotData: {
    currentWeek: number;
    completionRate: number;
    overdueCount: number;
  };
  onWakeUp: () => void;
}

export function DockedPuffy({ mascotData, onWakeUp }: DockedPuffyProps) {
  return (
    <motion.div
      className="absolute -bottom-8 -left-12 z-20 cursor-pointer"
      initial={{ scale: 0, opacity: 0, x: -50, y: 50 }}
      animate={{ scale: 0.4, opacity: 1, x: 0, y: 0 }}
      exit={{ scale: 0, opacity: 0, x: -50, y: 50 }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        duration: 0.6,
      }}
      onClick={onWakeUp}
      whileHover={{ scale: 0.45 }}
      whileTap={{ scale: 0.38 }}
    >
      <div style={{ width: '120px', height: '120px' }}>
        <MascotContainer
          currentWeek={mascotData.currentWeek}
          completionRate={mascotData.completionRate}
          overdueCount={mascotData.overdueCount}
          className="w-full h-full"
          isDocked={true}
        />
      </div>
    </motion.div>
  );
}
