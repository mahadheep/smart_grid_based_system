import { ActionId, ControlAction, GridState, NormalizedObservation, RewardBreakdown } from '../types';

export const MAX_POSSIBLE_LOAD = 250.0; // MW

export const ACTIONS: ControlAction[] = [
  {
    id: 0,
    name: "Action 0: No Control (Maintain)",
    shortName: "No Control",
    description: "Keep existing baseline dispatch; take no intervention.",
    loadDelta: 0,
    genDelta: 0,
    iconName: "PauseCircle"
  },
  {
    id: 1,
    name: "Action 1: Reduce Load (Curtail 15 MW)",
    shortName: "Curtail -15MW",
    description: "Selective curtailment of non-critical industrial & commercial circuits.",
    loadDelta: -15,
    genDelta: 0,
    iconName: "TrendingDown"
  },
  {
    id: 2,
    name: "Action 2: Increase Generation (+20 MW Reserve)",
    shortName: "Reserve +20MW",
    description: "Dispatch fast-ramping battery energy storage (BESS) or spinning reserve.",
    loadDelta: 0,
    genDelta: 20,
    iconName: "Zap"
  },
  {
    id: 3,
    name: "Action 3: Shift / Curtail Load (Demand Response 30 MW)",
    shortName: "Demand Response -30MW",
    description: "Aggressive peak-clipping demand response via smart thermostat & EV delay.",
    loadDelta: -30,
    genDelta: 0,
    iconName: "Layers"
  }
];

export class SmartGridSimulation {
  private currentLoad: number;
  private gridCapacity: number;
  private renewablePct: number;
  private conventionalGen: number;
  private renewableGen: number;
  private totalGen: number;
  private isOverloaded: boolean;
  private stepIndex: number;

  constructor(initialLoad = 155.0, initialCapacity = 135.0, initialRenewable = 25.0) {
    this.currentLoad = initialLoad;
    this.gridCapacity = initialCapacity;
    this.renewablePct = initialRenewable;
    this.renewableGen = (this.renewablePct / 100.0) * this.gridCapacity;
    this.conventionalGen = Math.min(this.gridCapacity - this.renewableGen, this.currentLoad * 0.8);
    this.totalGen = this.conventionalGen + this.renewableGen;
    this.isOverloaded = this.currentLoad > this.gridCapacity;
    this.stepIndex = 0;
  }

  public setConfiguration(load: number, capacity: number, renewablePct: number): GridState {
    this.currentLoad = Math.max(30.0, Math.min(MAX_POSSIBLE_LOAD, load));
    this.gridCapacity = Math.max(80.0, Math.min(220.0, capacity));
    this.renewablePct = Math.max(0.0, Math.min(100.0, renewablePct));

    this.renewableGen = (this.renewablePct / 100.0) * this.gridCapacity;
    // Conventional generation tries to match demand up to remaining thermal capacity
    const headroom = Math.max(0, this.gridCapacity - this.renewableGen);
    this.conventionalGen = Math.min(headroom, Math.max(30.0, this.currentLoad - this.renewableGen));
    this.totalGen = Math.min(this.gridCapacity, this.conventionalGen + this.renewableGen);

    this.isOverloaded = this.currentLoad > this.gridCapacity;
    return this.getState();
  }

  public getState(): GridState {
    const powerImbalance = this.totalGen - this.currentLoad;
    // Nominal grid frequency is 50.0 Hz; severe deficits drop frequency, excess raises it slightly
    const freqOffset = Math.max(-1.5, Math.min(0.8, powerImbalance * 0.03));
    const frequency = Math.round((50.0 + freqOffset) * 100) / 100;

    return {
      currentLoad: Math.round(this.currentLoad * 10) / 10,
      gridCapacity: Math.round(this.gridCapacity * 10) / 10,
      renewablePct: Math.round(this.renewablePct),
      renewableGen: Math.round(this.renewableGen * 10) / 10,
      conventionalGen: Math.round(this.conventionalGen * 10) / 10,
      totalGen: Math.round(this.totalGen * 10) / 10,
      isOverloaded: this.isOverloaded,
      powerImbalance: Math.round(powerImbalance * 10) / 10,
      frequency,
      stepIndex: this.stepIndex
    };
  }

  public getObservation(): NormalizedObservation {
    return {
      normLoad: Math.min(1.0, Math.max(0.0, this.currentLoad / MAX_POSSIBLE_LOAD)),
      normCapacity: Math.min(1.0, Math.max(0.0, this.gridCapacity / MAX_POSSIBLE_LOAD)),
      renewableRatio: Math.min(1.0, Math.max(0.0, this.renewablePct / 100.0)),
      normImbalance: Math.min(1.0, Math.max(-1.0, (this.totalGen - this.currentLoad) / this.gridCapacity)),
      overloadFlag: this.isOverloaded ? 1.0 : 0.0
    };
  }

  public getObservationArray(): number[] {
    const obs = this.getObservation();
    return [obs.normLoad, obs.normCapacity, obs.renewableRatio, obs.normImbalance, obs.overloadFlag];
  }

  public executeAction(actionId: ActionId): {
    stateBefore: GridState;
    stateAfter: GridState;
    action: ControlAction;
    rewardBreakdown: RewardBreakdown;
    improvementPct: number;
  } {
    const stateBefore = this.getState();
    const action = ACTIONS[actionId];
    this.stepIndex += 1;

    // Apply load reduction if any
    const initialLoad = this.currentLoad;
    const initialOverloaded = initialLoad > this.gridCapacity;

    if (action.loadDelta < 0) {
      this.currentLoad = Math.max(30.0, this.currentLoad + action.loadDelta);
    }

    // Apply generation boost if any
    if (action.genDelta > 0) {
      this.conventionalGen = Math.min(
        this.gridCapacity - this.renewableGen,
        this.conventionalGen + action.genDelta
      );
      this.totalGen = Math.min(this.gridCapacity, this.conventionalGen + this.renewableGen);
    }

    this.isOverloaded = this.currentLoad > this.gridCapacity;
    const stateAfter = this.getState();

    // Reward computation
    let baseStability = 0;
    let overloadClearedBonus = 0;
    let overloadPenalty = 0;
    let unnecessaryActionPenalty = 0;

    if (!stateAfter.isOverloaded) {
      baseStability = 10.0;
      if (initialOverloaded) {
        overloadClearedBonus = 8.0;
      }
    } else {
      const overloadMW = stateAfter.currentLoad - stateAfter.gridCapacity;
      overloadPenalty = -(15.0 + 0.3 * overloadMW);
    }

    const imbalancePenalty = -(2.0 * Math.abs(stateAfter.powerImbalance) / stateAfter.gridCapacity);

    // Penalize load curtailment when grid wasn't overloaded
    if ((actionId === 1 || actionId === 3) && !initialOverloaded) {
      unnecessaryActionPenalty = -5.0;
    }

    if (actionId === 0 && initialOverloaded) {
      overloadPenalty -= 6.0; // penalty for inaction during crisis
    }

    const totalReward = Math.round(
      (baseStability + overloadClearedBonus + overloadPenalty + imbalancePenalty + unnecessaryActionPenalty) * 100
    ) / 100;

    const rewardBreakdown: RewardBreakdown = {
      baseStability: Math.round(baseStability * 10) / 10,
      overloadClearedBonus: Math.round(overloadClearedBonus * 10) / 10,
      overloadPenalty: Math.round(overloadPenalty * 10) / 10,
      imbalancePenalty: Math.round(imbalancePenalty * 10) / 10,
      unnecessaryActionPenalty: Math.round(unnecessaryActionPenalty * 10) / 10,
      totalReward
    };

    // Calculate percentage improvement
    let improvementPct = 0;
    if (initialOverloaded) {
      const initialOverloadMW = initialLoad - stateBefore.gridCapacity;
      const finalOverloadMW = Math.max(0, stateAfter.currentLoad - stateAfter.gridCapacity);
      improvementPct = Math.round(Math.max(0, (initialOverloadMW - finalOverloadMW) / initialOverloadMW) * 100);
    } else {
      improvementPct = 100;
    }

    return {
      stateBefore,
      stateAfter,
      action,
      rewardBreakdown,
      improvementPct
    };
  }
}
