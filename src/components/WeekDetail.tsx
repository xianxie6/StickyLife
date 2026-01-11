import { WeekPlan, KeyResult } from '../types';
import './WeekDetail.css';

interface WeekDetailProps {
  week: WeekPlan;
  onKeyResultClick: (keyResult: KeyResult, weekId: string) => void;
}

export function WeekDetail({ week, onKeyResultClick }: WeekDetailProps) {
  return (
    <div className="week-detail">
      <div className="week-detail-header">
        <h3 className="week-detail-title">第 {week.weekNumber} 周</h3>
        <p className="week-detail-dates">
          {week.startDate} ~ {week.endDate}
        </p>
      </div>

      <div className="week-detail-content">
        <h4 className="key-results-title">关键结果：</h4>
        <div className="key-results-list">
          {week.keyResults.map((kr, index) => (
            <div
              key={kr.id}
              className={`key-result-item ${kr.completed ? 'completed' : ''}`}
              onClick={() => onKeyResultClick(kr, week.id)}
            >
              <div className="key-result-header">
                <span className="key-result-index">{index + 1}</span>
                <span className="key-result-title">{kr.title}</span>
              </div>
              {kr.description && (
                <p className="key-result-description">{kr.description}</p>
              )}
              <div className="key-result-progress">
                <span className="progress-text">
                  进度: {kr.current} / {kr.target} {kr.unit || ''}
                </span>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min((kr.current / kr.target) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div className="key-result-hint">点击分发到今日聚焦</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

