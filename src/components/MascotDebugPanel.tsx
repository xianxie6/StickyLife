import { useState } from 'react';
import { MascotContainer } from './MascotContainer';

/**
 * Mascot 调试面板 - 用于快速测试不同状态
 * 仅在开发环境显示
 */
export function MascotDebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [testWeek, setTestWeek] = useState(4);
  const [testCompletionRate, setTestCompletionRate] = useState(0.6);
  const [testOverdueCount, setTestOverdueCount] = useState(0);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* 触发按钮 */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors"
        title="打开 Puffy 测试面板"
      >
        🐡 测试 Puffy
      </button>

      {/* 调试面板 */}
      {isVisible && (
        <div className="fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 w-96 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">Puffy 状态测试</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-slate-400 hover:text-slate-600 text-xl"
            >
              ×
            </button>
          </div>

          {/* 快速场景 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              快速场景
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setTestWeek(1);
                  setTestCompletionRate(0.05);
                  setTestOverdueCount(0);
                }}
                className="px-3 py-2 bg-pink-100 hover:bg-pink-200 rounded-lg text-xs font-medium text-pink-700 transition-colors"
              >
                初生期
              </button>
              <button
                onClick={() => {
                  setTestWeek(4);
                  setTestCompletionRate(0.6);
                  setTestOverdueCount(1);
                }}
                className="px-3 py-2 bg-orange-100 hover:bg-orange-200 rounded-lg text-xs font-medium text-orange-700 transition-colors"
              >
                成长期
              </button>
              <button
                onClick={() => {
                  setTestWeek(5);
                  setTestCompletionRate(0.4);
                  setTestOverdueCount(5);
                }}
                className="px-3 py-2 bg-amber-800/20 hover:bg-amber-800/30 rounded-lg text-xs font-medium text-amber-800 transition-colors"
              >
                焦虑期
              </button>
              <button
                onClick={() => {
                  setTestWeek(12);
                  setTestCompletionRate(0.95);
                  setTestOverdueCount(0);
                }}
                className="px-3 py-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg text-xs font-medium text-yellow-700 transition-colors"
              >
                完全体
              </button>
            </div>
          </div>

          {/* 手动调整 */}
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                当前周数: {testWeek} / 12
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={testWeek}
                onChange={(e) => setTestWeek(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                完成率: {Math.round(testCompletionRate * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={testCompletionRate * 100}
                onChange={(e) => setTestCompletionRate(Number(e.target.value) / 100)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                逾期任务数: {testOverdueCount}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={testOverdueCount}
                onChange={(e) => setTestOverdueCount(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* 预览区域 */}
          <div className="border-t border-slate-200 pt-4">
            <div className="h-64 rounded-lg overflow-hidden bg-slate-50">
              <MascotContainer
                currentWeek={testWeek}
                completionRate={testCompletionRate}
                overdueCount={testOverdueCount}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
