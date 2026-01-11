import { TodayFocusTask, WeekPlan } from '../types';
import './TodayFocus.css';

interface TodayFocusProps {
  tasks: TodayFocusTask[];
  weeks: WeekPlan[];
  onToggleTask: (taskId: string) => void;
  onRemoveTask: (taskId: string) => void;
}

export function TodayFocus({ tasks, weeks, onToggleTask, onRemoveTask }: TodayFocusProps) {
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  // 获取周序号
  const getWeekNumber = (weekId: string): number => {
    const week = weeks.find(w => w.id === weekId);
    return week?.weekNumber || 0;
  };

  return (
    <div className="today-focus">
      <div className="today-focus-header">
        <h3 className="today-focus-title">今日聚焦</h3>
        <span className="today-focus-count">
          {completedCount} / {totalCount}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="today-focus-empty">
          <p>暂无聚焦任务</p>
          <p className="hint">从周计划中点击关键结果来分发任务</p>
        </div>
      ) : (
        <div className="today-focus-list">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`today-focus-item ${task.completed ? 'completed' : ''}`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleTask(task.id)}
                className="task-checkbox"
              />
              <div className="task-content">
                <div className="task-title">{task.title}</div>
                {task.description && (
                  <div className="task-description">{task.description}</div>
                )}
                <div className="task-meta">
                  <span className="task-week">第{getWeekNumber(task.weekId)}周</span>
                </div>
              </div>
              <button
                className="task-remove"
                onClick={() => onRemoveTask(task.id)}
                title="移除"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

