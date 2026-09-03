export interface GridState {
  currentLoad: number; // MW
  gridCapacity: number; // MW
  renewablePct: number; // % (0-100)
  renewableGen: number; // MW
  conventionalGen: number; // MW
  totalGen: number; // MW
  isOverloaded: boolean;
  powerImbalance: number; // totalGen - currentLoad (MW)
  frequency: number; // Hz (nominal 50.0 Hz)
  stepIndex: number;
}

export interface NormalizedObservation {
  normLoad: number; // 0 to 1
  normCapacity: number; // 0 to 1
  renewableRatio: number; // 0 to 1
  normImbalance: number; // -1 to 1
  overloadFlag: number; // 0 or 1
}

export type ActionId = 0 | 1 | 2 | 3;

export interface ControlAction {
  id: ActionId;
  name: string;
  shortName: string;
  description: string;
  loadDelta: number; // MW change (negative means reduction)
  genDelta: number; // MW change (positive means reserve ramp)
  iconName: string;
}

export interface RewardBreakdown {
  baseStability: number;
  overloadClearedBonus: number;
  overloadPenalty: number;
  imbalancePenalty: number;
  unnecessaryActionPenalty: number;
  totalReward: number;
}

export interface RLExecutionResult {
  action: ControlAction;
  qValues: number[];
  stateBefore: GridState;
  stateAfter: GridState;
  rewardBreakdown: RewardBreakdown;
  improvementPct: number;
  timestamp: string;
}

export interface TrainingEpisodeLog {
  episode: number;
  totalReward: number;
  avgLoss: number;
  epsilon: number;
  clearedOverloads: number;
}

export interface VivaQuestion {
  id: number;
  question: string;
  answer: string;
  category: "DQN & RL" | "Smart Grid" | "Training & State Design";
}
