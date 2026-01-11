import { useState } from 'react';
import './WeekDot.css';

interface WeekDotProps {
  weekNumber: number;
  isSelected: boolean;
  isCurrent: boolean;
  status?: 'pending' | 'in-progress' | 'done';
  onClick: () => void;
}

export function WeekDot({ weekNumber, isSelected, isCurrent, status, onClick }: WeekDotProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
    onClick();
  };

  const isDone = status === 'done';

  return (
    <div className="week-dot-container">
      <div
        className={`week-dot ${isFlipped ? 'flipped' : ''} ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''} ${isDone ? 'done' : ''}`}
        onClick={handleClick}
      >
        <div className="week-dot-front">
          {isDone ? (
            <svg
              className="check-icon"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                fill="currentColor"
              />
            </svg>
          ) : (
            <span className="week-number">{weekNumber}</span>
          )}
        </div>
        <div className="week-dot-back">
          <span className="week-label">第{weekNumber}周</span>
        </div>
      </div>
    </div>
  );
}

