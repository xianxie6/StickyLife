import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TodayFocusArea } from './TodayFocusArea';
import { KRTaskCard } from './KRTaskCard';
import { StickyNote, WeekKR } from '../types';
import { Plus, X, Check } from 'lucide-react';
import { useStore } from '../store/useStore';

// 用于跟踪鼠标是否在卡片区域内
let isMouseOverCard = false;

interface MergedFocusCardProps {
  notes: StickyNote[];
  currentWeek: number;
  completedWeeks: number;
  onAddNote: (note: Omit<StickyNote, 'id' | 'createdAt'>) => void;
  onUpdateNote: (id: string, updates: Partial<StickyNote>) => void;
  onDeleteNote: (id: string) => void;
  onCompleteNote: (id: string) => void;
}

export function MergedFocusCard({
  notes,
  currentWeek,
  completedWeeks,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onCompleteNote,
}: MergedFocusCardProps) {
  const { weeks: storedWeeks, isLoading: storeLoading, updateWeeks } = useStore();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayFocusRef = useRef<HTMLDivElement>(null);
  
  // 将存储的 weeks 数组转换为 Record<number, WeekKR[]> 格式
  const [weekKRs, setWeekKRs] = useState<Record<number, WeekKR[]>>({});

  // 从 store 加载 weekKRs
  useEffect(() => {
    if (!storeLoading) {
      const weekKRsMap: Record<number, WeekKR[]> = {};
      storedWeeks.forEach(kr => {
        if (!weekKRsMap[kr.week]) {
          weekKRsMap[kr.week] = [];
        }
        weekKRsMap[kr.week].push(kr);
      });
      setWeekKRs(weekKRsMap);
    }
  }, [storedWeeks, storeLoading]);

  // 保存 weekKRs 到 store
  const saveWeekKRs = useCallback((newWeekKRs: Record<number, WeekKR[]>) => {
    const weeksArray = Object.values(newWeekKRs).flat();
    updateWeeks(weeksArray);
  }, [updateWeeks]);

  // 处理任务完成，同步到周计划
  const handleCompleteNote = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    // 调用原始的完成处理
    onCompleteNote(id);

    // 如果任务关联了周计划，更新 KR 数据
    if (note.parentKRId) {
      setWeekKRs(prev => {
        const updated = { ...prev };
        let updatedKR: WeekKR | null = null;

        // 找到对应的 KR
        for (const week in updated) {
          const weekKRList = updated[week];
          const krIndex = weekKRList.findIndex(kr => kr.id === note.parentKRId);
          if (krIndex !== -1) {
            updatedKR = { ...weekKRList[krIndex] };
            
            // 增加已完成任务数
            updatedKR.dailyTasksCompleted += 1;
            
            // 计算进度百分比
            if (updatedKR.totalDailyTasks > 0) {
              updatedKR.progress = Math.min(100, Math.round((updatedKR.dailyTasksCompleted / updatedKR.totalDailyTasks) * 100));
            }
            
            updated[week] = [
              ...weekKRList.slice(0, krIndex),
              updatedKR,
              ...weekKRList.slice(krIndex + 1)
            ];
            break;
          }
        }

        if (updatedKR) {
          saveWeekKRs(updated);
        }
        return updated;
      });
    }
  }, [notes, onCompleteNote, saveWeekKRs]);

  const totalWeeks = 12;

  const handleWeekClick = useCallback((week: number) => {
    // 直接更新状态，React 会自动优化渲染
    if (selectedWeek === week) {
      setSelectedWeek(null);
    } else {
      setSelectedWeek(week);
    }
  }, [selectedWeek]);

  // 动态调整窗口大小 - 延迟调整，避免与渲染冲突
  useEffect(() => {
    if (!window.electronAPI?.resizeWindow) return;
    
    // 使用更长的延迟，确保 DOM 完全渲染后再调整窗口
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const cardElement = document.querySelector('.glass-surface');
          if (cardElement) {
            const rect = cardElement.getBoundingClientRect();
            const cardHeight = rect.height;
            
            // 如果卡片展开了，增加窗口高度以适应内容
            if (selectedWeek !== null) {
              // 展开时，窗口高度基于实际内容，但限制在 800-1200px 之间
              const targetHeight = Math.min(1200, Math.max(800, cardHeight + 20));
              window.electronAPI.resizeWindow(450, targetHeight).catch(console.error);
            } else {
              // 收起时，恢复到初始高度
              window.electronAPI.resizeWindow(450, 600).catch(console.error);
            }
          }
        });
      });
    }, selectedWeek !== null ? 100 : 50); // 减少延迟，但使用双重 requestAnimationFrame
    
    return () => clearTimeout(timeoutId);
  }, [selectedWeek]);

  const handleAddKR = (week: number) => {
    const newKR: WeekKR = {
      id: `kr-${Date.now()}`,
      week,
      title: '',
      description: '',
      progress: 0,
      dailyTasksCompleted: 0,
      totalDailyTasks: 0
    };
    
    setWeekKRs(prev => {
      const updated = {
        ...prev,
        [week]: [...(prev[week] || []), newKR]
      };
      saveWeekKRs(updated);
      return updated;
    });
  };

  const handleUpdateKR = (krId: string, updates: Partial<WeekKR>) => {
    setWeekKRs(prev => {
      const updated = { ...prev };
      for (const week in updated) {
        const weekKRList = updated[week];
        const krIndex = weekKRList.findIndex(kr => kr.id === krId);
        if (krIndex !== -1) {
          updated[week] = [
            ...weekKRList.slice(0, krIndex),
            { ...weekKRList[krIndex], ...updates },
            ...weekKRList.slice(krIndex + 1)
          ];
          break;
        }
      }
      saveWeekKRs(updated);
      return updated;
    });
  };

  const handleDeleteKR = (krId: string) => {
    setWeekKRs(prev => {
      const updated = { ...prev };
      for (const week in updated) {
        updated[week] = updated[week].filter(kr => kr.id !== krId);
      }
      saveWeekKRs(updated);
      return updated;
    });
  };

  const handleCreateDailyTask = (krId: string, krTitle: string) => {
    const today = new Date().toISOString().split('T')[0];
    onAddNote({
      content: `${krTitle} - 今日子任务`,
      layer: 'daily',
      date: today,
      color: '#FFF9C4',
      parentKRId: krId
    });
    
    // Update KR task count
    setWeekKRs(prev => {
      const updated = { ...prev };
      for (const week in updated) {
        const weekKRList = updated[week];
        const krIndex = weekKRList.findIndex(kr => kr.id === krId);
        if (krIndex !== -1) {
          const kr = { ...weekKRList[krIndex] };
          kr.totalDailyTasks += 1;
          updated[week] = [
            ...weekKRList.slice(0, krIndex),
            kr,
            ...weekKRList.slice(krIndex + 1)
          ];
          break;
        }
      }
      saveWeekKRs(updated);
      return updated;
    });

    // 滚动到今日聚焦区域
    setTimeout(() => {
      if (todayFocusRef.current && scrollContainerRef.current) {
        const scrollContainer = scrollContainerRef.current;
        const focusElement = todayFocusRef.current;
        const containerRect = scrollContainer.getBoundingClientRect();
        const focusRect = focusElement.getBoundingClientRect();
        const scrollTop = scrollContainer.scrollTop;
        const targetScrollTop = scrollTop + (focusRect.top - containerRect.top) - 20; // 20px 偏移
        
        scrollContainer.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const selectedWeekKRs = selectedWeek ? (weekKRs[selectedWeek] || []) : [];
  const todayNotes = notes.filter(note => note.date === new Date().toISOString().split('T')[0]);

  // 检测是否有正在编辑的周计划（有未完成的 KR 或空标题的 KR）
  const hasUnsavedChanges = selectedWeek !== null && selectedWeekKRs.some(kr => !kr.title || kr.title.trim() === '');

  // 检查某个周是否完成（该周所有 KR 的进度都 >= 100%）
  const isWeekCompleted = (week: number): boolean => {
    const weekKRList = weekKRs[week] || [];
    // 如果该周有 KR 且所有 KR 的进度都 >= 100%，则认为该周完成
    return weekKRList.length > 0 && weekKRList.every(kr => kr.progress >= 100);
  };

  // 检查某个周是否有计划（有 KR，即使未完成）
  const hasWeekPlan = (week: number): boolean => {
    const weekKRList = weekKRs[week] || [];
    return weekKRList.length > 0 && weekKRList.some(kr => kr.title && kr.title.trim() !== '');
  };

  const getWeekColor = (week: number) => {
    // 优先检查该周是否完成（基于实际的 weekKRs 数据）
    if (isWeekCompleted(week)) {
      return '#10b981'; // Green for completed
    } else if (week <= completedWeeks) {
      return '#10b981'; // Green for completed (fallback to completedWeeks)
    } else if (week === currentWeek || hasWeekPlan(week)) {
      return '#fbbf24'; // Yellow for current week or weeks with plans
    }
    return 'transparent';
  };

  const handleClose = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      if (window.electronAPI && window.electronAPI.hideWindow) {
        // 先取消点击穿透，确保窗口可以接收事件
        await window.electronAPI.setIgnoreCursorEvents(false);
        // 然后隐藏窗口
        await window.electronAPI.hideWindow();
      } else {
        // 如果不是 Electron 环境，可以添加其他关闭逻辑
        console.log('Close button clicked (not in Electron environment)');
      }
    } catch (error) {
      console.error('Error closing window:', error);
    }
  };

  // 当卡片打开/关闭时，动态设置窗口的点击穿透
  useEffect(() => {
    const updateClickThrough = async () => {
      if (!window.electronAPI) return;
      
      if (selectedWeek !== null) {
        // 卡片打开时，如果鼠标不在卡片上，设置点击穿透
        // 使用 requestIdleCallback 或更短的延迟，减少卡顿
        const timeoutId = setTimeout(async () => {
          if (!isMouseOverCard && window.electronAPI) {
            await window.electronAPI.setIgnoreCursorEvents(true);
          }
        }, 50); // 减少延迟从 100ms 到 50ms
        
        return () => clearTimeout(timeoutId);
      } else {
        // 卡片关闭时，立即恢复正常的鼠标事件处理
        window.electronAPI.setIgnoreCursorEvents(false);
        isMouseOverCard = false;
      }
    };

    updateClickThrough();
  }, [selectedWeek]);

  // 处理鼠标进入卡片区域
  const handleMouseEnterCard = useCallback(async () => {
    isMouseOverCard = true;
    // 当鼠标在卡片上时，需要接收鼠标事件，取消点击穿透
    if (window.electronAPI) {
      await window.electronAPI.setIgnoreCursorEvents(false);
    }
  }, []);

  // 处理鼠标离开卡片区域
  const handleMouseLeaveCard = useCallback(async (e: React.MouseEvent) => {
    // 检查鼠标是否真的离开了卡片（可能移到了按钮上）
    const relatedTarget = e.relatedTarget as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;
    
    // 如果鼠标移到了按钮上，不设置点击穿透
    if (relatedTarget && currentTarget.contains(relatedTarget)) {
      return;
    }
    
    isMouseOverCard = false;
    // 当鼠标离开卡片时，如果卡片是打开状态，恢复点击穿透
    if (window.electronAPI && selectedWeek !== null) {
      // 延迟一小段时间，确保鼠标完全离开卡片
      setTimeout(async () => {
        if (!isMouseOverCard && selectedWeek !== null && window.electronAPI) {
          await window.electronAPI.setIgnoreCursorEvents(true);
        }
      }, 100);
    }
  }, [selectedWeek]);

  // 确认/保存周计划
  const handleConfirmWeek = () => {
    if (selectedWeek === null) return;
    
    // 移除所有空标题的 KR（未完成的编辑）
    setWeekKRs(prev => {
      const updated = { ...prev };
      if (updated[selectedWeek]) {
        updated[selectedWeek] = updated[selectedWeek].filter(kr => kr.title && kr.title.trim() !== '');
        // 如果该周没有有效的 KR，保留空数组
        if (updated[selectedWeek].length === 0) {
          delete updated[selectedWeek];
        }
        saveWeekKRs(updated);
      }
      return updated;
    });
    
    // 收起周详情（可选，或者保持展开状态）
    // setSelectedWeek(null);
  };

  return (
    <div className="relative">
      <div 
        className="glass-surface rounded-2xl shadow-2xl flex flex-col"
        onMouseEnter={handleMouseEnterCard}
        onMouseLeave={handleMouseLeaveCard}
        style={{
          width: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          // iOS Control Center 风格的液态玻璃效果 - 实时模糊卡片底部背景
          // backdrop-filter 会自动捕获并模糊卡片下方的桌面背景，无论壁纸是什么
          // 增强模糊强度，让背景更加模糊
          backdropFilter: 'blur(80px) saturate(180%)',
          WebkitBackdropFilter: 'blur(80px) saturate(180%)',
          // 白色半透明背景，提高不透明度以增强模糊效果，同时确保黑色文字清晰可见
          background: 'rgba(255, 255, 255, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: `
            0 4px 16px 0 rgba(0, 0, 0, 0.06),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.8),
            inset 0 -1px 0 0 rgba(0, 0, 0, 0.03)
          `,
          color: '#1a1a1a', // 深色文字，确保在白色背景上清晰可见
          WebkitAppRegion: 'drag', // 整个卡片都可以拖拽窗口
          cursor: 'move',
          position: 'relative',
          pointerEvents: 'auto', // 确保卡片本身可以接收鼠标事件
        }}
      >
        {/* iOS 风格的磨砂质感层 - 轻微纹理增强液态玻璃效果 */}
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
                rgba(255, 255, 255, 0.02) 1px,
                rgba(255, 255, 255, 0.02) 2px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 1px,
                rgba(255, 255, 255, 0.015) 1px,
                rgba(255, 255, 255, 0.015) 2px
              )
            `,
            backgroundSize: '4px 4px, 4px 4px',
            pointerEvents: 'none',
            opacity: 0.6,
          }}
        />
        {/* 光泽层 - 增加液态玻璃的光泽感 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            background: `
              linear-gradient(
                135deg,
                rgba(255, 255, 255, 0.1) 0%,
                transparent 30%,
                transparent 70%,
                rgba(255, 255, 255, 0.05) 100%
              )
            `,
            pointerEvents: 'none',
            mixBlendMode: 'soft-light',
          }}
        />
        {/* 右上角按钮 - 根据状态显示关闭或确认 */}
        {hasUnsavedChanges ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleConfirmWeek();
            }}
            className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-green-500/20 hover:bg-green-500/40 transition-all backdrop-blur-sm border border-green-500/30"
            style={{
              pointerEvents: 'auto',
              WebkitAppRegion: 'no-drag', // 按钮区域不可拖拽
              cursor: 'pointer',
              zIndex: 1000,
            }}
            title="确认并保存周计划"
            type="button"
          >
            <Check className="w-4 h-4" style={{ color: '#2d3436' }} />
          </button>
        ) : (
          <button
            onClick={handleClose}
            onMouseEnter={async () => {
              // 确保按钮区域可以接收鼠标事件
              if (window.electronAPI) {
                await window.electronAPI.setIgnoreCursorEvents(false);
              }
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200/50 hover:bg-gray-300/70 active:bg-gray-400/80 transition-all backdrop-blur-sm border border-gray-300/50"
            style={{
              pointerEvents: 'auto',
              WebkitAppRegion: 'no-drag', // 按钮区域不可拖拽
              cursor: 'pointer',
              zIndex: 1000,
              touchAction: 'manipulation', // 优化触摸事件
            }}
            title="关闭窗口（隐藏到 Dock）"
            type="button"
          >
            <X className="w-4 h-4" style={{ color: '#2d3436', pointerEvents: 'none' }} />
          </button>
        )}
        {/* 12 Week Progress Circles - Fixed Header */}
        <div 
          className={`px-8 py-6 flex-shrink-0 ${selectedWeek !== null ? 'border-b border-gray-300/30' : ''}`}
        >
          {/* Sprint Title */}
          <div className="mb-4 text-center">
            <h2 
              className="text-2xl mb-1"
              style={{ 
                fontFamily: "'Caveat', cursive",
                fontWeight: 600,
                color: '#2d3436',
                opacity: 0.9
              }}
            >
              Sprint 1
            </h2>
            <p className="text-sm" style={{ color: '#2d3436', opacity: 0.7 }}>
              第 {selectedWeek !== null ? selectedWeek : currentWeek} 周 / 共 {totalWeeks} 周
            </p>
          </div>

            <div className="flex flex-col gap-4">
              {/* Row 1: Weeks 1-6 */}
            <div className="flex gap-3 justify-center">
              {[1, 2, 3, 4, 5, 6].map((week) => (
                <motion.div
                  key={week}
                  className="relative cursor-pointer"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: week === selectedWeek ? 1.15 : 1, 
                    opacity: 1 
                  }}
                  transition={{ 
                    delay: week * 0.05,
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    mass: 0.5
                  }}
                  onClick={() => handleWeekClick(week)}
                  whileHover={{ scale: week === selectedWeek ? 1.15 : 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ WebkitAppRegion: 'no-drag' }}
                >
                  {/* Week Circle */}
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      transition-all duration-300 relative
                      ${week === currentWeek ? 'ring-4 ring-yellow-200' : ''}
                      ${week === selectedWeek && !hasWeekPlan(week) ? 'ring-4 ring-yellow-400' : ''}
                    `}
                    style={{
                      backgroundColor: getWeekColor(week),
                      border: week === selectedWeek && !hasWeekPlan(week)
                        ? '2px dashed #fbbf24' // 选中但未创建计划时，黄色虚线
                        : week > currentWeek && !hasWeekPlan(week)
                        ? '2px dashed rgba(139, 69, 19, 0.3)' // 未创建计划的未来周，棕色虚线
                        : 'none',
                      boxShadow: week === currentWeek 
                        ? '0 0 20px rgba(251, 191, 36, 0.6)' 
                        : (isWeekCompleted(week) || week <= completedWeeks)
                        ? '0 0 20px rgba(16, 185, 129, 0.07)' // 绿色光晕，不透明度7%
                        : week === selectedWeek && !hasWeekPlan(week)
                        ? '0 0 15px rgba(251, 191, 36, 0.4)' // 选中但未创建计划时的光晕
                        : 'none'
                    }}
                  >
                    {/* Week Number */}
                        <span 
                          className="font-medium handwritten relative z-10"
                          style={{ 
                            color: '#2d3436',
                            fontSize: '20px'
                          }}
                        >
                          {week}
                        </span>

                    {/* Checkmark for completed weeks */}
                    {(isWeekCompleted(week) || week <= completedWeeks) && (
                      <svg 
                        className="absolute w-4 h-4 text-white top-1 right-0.5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Current Week Glow Effect */}
                  {week === currentWeek && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, transparent 70%)',
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Row 2: Weeks 7-12 */}
            <div className="flex gap-3 justify-center">
              {[7, 8, 9, 10, 11, 12].map((week) => (
                <motion.div
                  key={week}
                  className="relative cursor-pointer"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: week === selectedWeek ? 1.15 : 1, 
                    opacity: 1 
                  }}
                  transition={{ 
                    delay: week * 0.05,
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    mass: 0.5
                  }}
                  onClick={() => handleWeekClick(week)}
                  whileHover={{ scale: week === selectedWeek ? 1.15 : 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ WebkitAppRegion: 'no-drag' }}
                >
                  {/* Week Circle */}
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      transition-all duration-300 relative
                      ${week === currentWeek ? 'ring-4 ring-yellow-200' : ''}
                      ${week === selectedWeek && !hasWeekPlan(week) ? 'ring-4 ring-yellow-400' : ''}
                    `}
                    style={{
                      backgroundColor: getWeekColor(week),
                      border: week === selectedWeek && !hasWeekPlan(week)
                        ? '2px dashed #fbbf24' // 选中但未创建计划时，黄色虚线
                        : week > currentWeek && !hasWeekPlan(week)
                        ? '2px dashed rgba(139, 69, 19, 0.3)' // 未创建计划的未来周，棕色虚线
                        : 'none',
                      boxShadow: week === currentWeek 
                        ? '0 0 20px rgba(251, 191, 36, 0.6)' 
                        : (isWeekCompleted(week) || week <= completedWeeks)
                        ? '0 0 20px rgba(16, 185, 129, 0.07)' // 绿色光晕，不透明度7%
                        : week === selectedWeek && !hasWeekPlan(week)
                        ? '0 0 15px rgba(251, 191, 36, 0.4)' // 选中但未创建计划时的光晕
                        : 'none'
                    }}
                  >
                    {/* Week Number */}
                        <span 
                          className="font-medium handwritten relative z-10"
                          style={{ 
                            color: '#2d3436',
                            fontSize: '20px'
                          }}
                        >
                          {week}
                        </span>

                    {/* Checkmark for completed weeks */}
                    {(isWeekCompleted(week) || week <= completedWeeks) && (
                      <svg 
                        className="absolute w-4 h-4 text-white top-1 right-0.5" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Current Week Glow Effect */}
                  {week === currentWeek && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      style={{
                        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.6) 0%, transparent 70%)',
                      }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

                {/* 引导提示：初始状态引导用户点击周圆圈 */}
                {selectedWeek === null && (
                  <div className="mt-4 text-center text-xs" style={{ color: '#2d3436', opacity: 0.65 }}>
                    点击上方任意圆形周计划，开始设置你的 12 周关键结果
                  </div>
                )}

            {/* Progress Bar */}
            <div className="mt-2 px-12">
              <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-yellow-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedWeeks / totalWeeks) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs" style={{ color: '#2d3436', opacity: 0.7 }}>
                <span>已完成: {completedWeeks} 周</span>
                <span>进度: {Math.round((completedWeeks / totalWeeks) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area：仅在选择某一周后展开 */}
        {selectedWeek !== null && (
          <div 
            ref={scrollContainerRef}
            className="overflow-y-auto flex-1 px-8 py-6"
            style={{
              WebkitAppRegion: 'no-drag',
              minHeight: 0, // 允许 flex 子元素缩小
              willChange: 'scroll-position', // GPU 加速
            }}
          >
            {/* Week Detail Section (Expandable) - 使用简单的 CSS transition 替代 Framer Motion */}
            <div
              className="pb-6 mb-6"
              style={{
                animation: 'fadeIn 0.2s ease-out',
              }}
            >
                <div className="pt-2">
                  <h3 className="text-xl handwritten mb-4" style={{ color: '#2d3436' }}>
                    第 {selectedWeek} 周计划
                  </h3>
                  
                  <div className="space-y-3">
                    {selectedWeekKRs.length === 0 ? (
                      <>
                        <div className="text-center py-6" style={{ color: '#2d3436', opacity: 0.6 }}>
                          <p className="text-sm mb-1">该周还没有设置关键结果</p>
                          <p className="text-xs">点击下方按钮开始创建</p>
                        </div>
                        {/* 空状态时显示更明显的添加按钮 */}
                        <button
                          onClick={() => handleAddKR(selectedWeek)}
                          className="w-full py-3 rounded-lg border-2 border-dashed border-white/40 hover:border-white/60 hover:bg白色/15 transition-all text-sm font-medium"
                            style={{ 
                              color: '#2d3436', 
                              opacity: 0.9,
                              WebkitAppRegion: 'no-drag',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                          }}
                        >
                          + 添加关键结果 (KR)
                        </button>
                      </>
                    ) : (
                      <>
                        {selectedWeekKRs.map((kr, index) => (
                          <KRTaskCard
                            key={kr.id}
                            kr={kr}
                            index={index}
                            onUpdateKR={handleUpdateKR}
                            onDeleteKR={handleDeleteKR}
                            onCreateDailyTask={handleCreateDailyTask}
                          />
                        ))}
                        
                        {selectedWeekKRs.length < 3 && (
                          <button
                            onClick={() => handleAddKR(selectedWeek)}
                            className="w-full py-2 rounded-lg border border-dashed border白色/30 hover:border-white/50 hover:bg白色/10 transition-all text-sm"
                            style={{ color: '#2d3436', opacity: 0.8, WebkitAppRegion: 'no-drag' }}
                          >
                            + 添加 KR
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
            </div>

            {/* Today's Focus Area */}
            <div ref={todayFocusRef} className="overflow-x-auto -mx-8 px-8">
              <div className="mb-3 relative flex items-center gap-2">
                {/* Focus State Indicator - Subtle Ambient Presence */}
                {(() => {
                  const todayNotes = notes.filter(note => note.date === new Date().toISOString().split('T')[0]);
                  const hasTodayTasks = todayNotes.length > 0;
                  const focusState = {
                    breathingOpacity: hasTodayTasks ? [0.6, 1, 0.6] : [0.4, 0.8, 0.4],
                    coreGradient: hasTodayTasks 
                      ? 'radial-gradient(circle, rgba(218, 165, 32, 0.9) 0%, rgba(218, 165, 32, 0.45) 60%, transparent 100%)'
                      : 'radial-gradient(circle, rgba(139, 92, 46, 0.75) 0%, rgba(139, 92, 46, 0.35) 60%, transparent 100%)',
                    shadowBlur: hasTodayTasks ? 12 : 8,
                    shadowOpacity: hasTodayTasks ? 0.6 : 0.4,
                    pulseOpacity: hasTodayTasks ? 0.5 : 0.35,
                    pulseGradient: hasTodayTasks
                      ? 'radial-gradient(circle, rgba(218, 165, 32, 0.6) 0%, transparent 80%)'
                      : 'radial-gradient(circle, rgba(139, 92, 46, 0.45) 0%, transparent 80%)'
                  };

                  return (
                    <motion.div
                      className="relative w-4 h-4 flex-shrink-0"
                      animate={{
                        opacity: focusState.breathingOpacity,
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {/* Gentle Core */}
                      <div 
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: focusState.coreGradient,
                          boxShadow: `0 0 ${focusState.shadowBlur}px rgba(139, 92, 46, ${focusState.shadowOpacity})`
                        }}
                      />
                      
                      {/* Quiet Pulse */}
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [focusState.pulseOpacity, 0, focusState.pulseOpacity],
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{
                          background: focusState.pulseGradient,
                        }}
                      />
                    </motion.div>
                  );
                })()}

                <div>
                  <h3 className="text-lg font-medium" style={{ color: '#2d3436', opacity: 0.9 }}>今日聚焦</h3>
                  <p className="text-xs" style={{ color: '#2d3436', opacity: 0.7 }}>
                    {new Date().toLocaleDateString('zh-CN', { 
                      month: 'long', 
                      day: 'numeric', 
                      weekday: 'long' 
                    })}
                  </p>
                </div>
              </div>

              <TodayFocusArea
                notes={notes}
                onAddNote={onAddNote}
                onUpdateNote={onUpdateNote}
                onDeleteNote={onDeleteNote}
                onCompleteNote={handleCompleteNote}
              />
            </div>
          </div>
        )}
      </div>

      {/* Ledge shadow - 只在有内容展开时显示 */}
      {selectedWeek !== null && (
        <div 
          className="absolute -bottom-4 left-8 right-8 h-8 opacity-20"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.3) 0%, transparent 70%)',
            filter: 'blur(8px)'
          }}
        />
      )}
    </div>
  );
}
