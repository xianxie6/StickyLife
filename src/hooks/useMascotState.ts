import { useMemo, useCallback } from 'react';

export type MascotStage = 'embryo' | 'happy' | 'anxious' | 'king';

export type MascotBaseAnimation =
  | 'float'
  | 'swim'
  | 'shake'
  | 'patrol';

export interface MascotState {
  stage: MascotStage;
  baseAnimation: MascotBaseAnimation;
  isAnxious: boolean;
  helperMessage?: string;
}

export interface UseMascotStateProps {
  currentWeek: number;
  completionRate: number; // 0 - 1
  overdueCount: number;
}

export function useMascotState({
  currentWeek,
  completionRate,
  overdueCount,
}: UseMascotStateProps): MascotState {
  const computeStage = useCallback((): MascotStage => {
    // King: 第 12 周 且 完成率 >= 0.9
    if (currentWeek === 12 && completionRate >= 0.9) {
      return 'king';
    }

    // Embryo: 第 1 周 且 完成率 < 0.1
    if (currentWeek === 1 && completionRate < 0.1) {
      return 'embryo';
    }

    // Anxious: 逾期任务较多
    if (overdueCount >= 3) {
      return 'anxious';
    }

    // 默认 Happy
    return 'happy';
  }, [completionRate, currentWeek, overdueCount]);

  return useMemo<MascotState>(() => {
    const stage = computeStage();

    if (stage === 'embryo') {
      return {
        stage,
        baseAnimation: 'float',
        isAnxious: false,
        helperMessage: '新的 12 周旅程开始了，一点点也没关系～',
      };
    }

    if (stage === 'happy') {
      return {
        stage,
        baseAnimation: 'swim',
        isAnxious: false,
        helperMessage: '保持这个节奏，Puffy 正悠闲地陪你前进。',
      };
    }

    if (stage === 'anxious') {
      return {
        stage,
        baseAnimation: 'shake',
        isAnxious: true,
        helperMessage: '我快炸了！快去完成任务！',
      };
    }

    // king
    return {
      stage: 'king',
      baseAnimation: 'patrol',
      isAnxious: false,
      helperMessage: '12 周目标达成！Puffy 为你巡游庆祝～',
    };
  }, [computeStage]);
}

