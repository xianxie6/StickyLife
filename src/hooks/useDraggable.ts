import { useState, useRef, useCallback } from 'react';

export interface UseDraggableOptions {
  onDragStart?: () => void;
  onDragEnd?: () => void;
  disabled?: boolean;
}

export function useDraggable(options: UseDraggableOptions = {}) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementRef = useRef<HTMLElement | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // 如果点击的是可交互元素（按钮、输入框等），不触发拖拽
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('[data-no-drag]')
    ) {
      return;
    }

    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };

    options.onDragStart?.();

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStartPos.current.x,
        y: e.clientY - dragStartPos.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      options.onDragEnd?.();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position, options]);

  return {
    position,
    isDragging,
    handleMouseDown,
    setPosition,
    elementRef,
  };
}
