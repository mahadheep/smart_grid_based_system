import React from 'react';
import { NormalizedObservation, ControlAction, RewardBreakdown } from '../types';
import { ACTIONS } from '../simulation/gridEnvironment';
import { Cpu, CheckCircle2, TrendingDown, Zap, Layers, PauseCircle, Calculator, Info } from 'lucide-react';

interface RLControllerPanelProps {
  observation: NormalizedObservation;
  qValues: number[];
  selectedAction: ControlAction | null;
  rewardBreakdown: RewardBreakdown | null;
  onRunRL: () => void;
  isOverloaded: boolean;
}

export const RLControllerPanel: React.FC<RLControllerPanelProps> = ({
  observation,
  qValues,
  selectedAction,
  rewardBreakdown,
  onRunRL,
  isOverloaded
}) => {
  // Find highest Q-value
  const maxQ = Math.max(...qValues);
  const bestActionIdx = qValues.indexOf(maxQ);

  const getActionIcon = (id: number) => {
    switch (id) {
      case 0: return <PauseCircle className="w-4 h-4" />;
      case 1: return <TrendingDown className="w-4 h-4" />;
      case 2: return <Zap className="w-4 h-4" />;
      case 3: return <Layers className="w-4 h-4" />;
      default: return <Cpu className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Module 2: Reinforcement Learning Controller (DQN)
          </h2>
        </div>
        <button
          onClick={onRunRL}
          className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>Execute Optimal Action $a^* = \arg\max_a Q(s, a)$</span>
        </button>
      </div>

      {/* Observation State Representation Vector */}
      <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <span>State Representation Observation Vector</span>
            <span className="font-mono text-cyan-400 text-xs">s_t ∈ ℝ⁵</span>
          </span>
          <span className="text-[10px] text-slate-400">Normalized input features to Deep Q-Network</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">s[0]: Norm Load</div>
            <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">{observation.normLoad.toFixed(3)}</div>
            <div className="text-[9px] text-slate-400">L / L_max</div>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">s[1]: Norm Capacity</div>
            <div className="text-sm font-mono font-bold text-slate-200 mt-0.5">{observation.normCapacity.toFixed(3)}</div>
            <div className="text-[9px] text-slate-400">C / L_max</div>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">s[2]: Renewable Ratio</div>
            <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">{observation.renewableRatio.toFixed(3)}</div>
            <div className="text-[9px] text-slate-400">η_ren ∈ [0, 1]</div>
          </div>

          <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">s[3]: Power Imbalance</div>
            <div className={`text-sm font-mono font-bold mt-0.5 ${observation.normImbalance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {observation.normImbalance > 0 ? `+${observation.normImbalance.toFixed(3)}` : observation.normImbalance.toFixed(3)}
            </div>
            <div className="text-[9px] text-slate-400">(Gen - Load) / C</div>
          </div>

          <div className={`p-2 rounded-lg border text-center col-span-2 sm:col-span-1 ${
            observation.overloadFlag === 1.0 ? 'bg-red-950/60 border-red-700 text-red-300' : 'bg-slate-900/90 border-slate-800 text-emerald-400'
          }`}>
            <div className="text-[10px] text-slate-400">s[4]: Overload Flag</div>
            <div className="text-sm font-mono font-bold mt-0.5">{observation.overloadFlag.toFixed(1)}</div>
            <div className="text-[9px] text-slate-400">{observation.overloadFlag === 1.0 ? '1 (Overloaded)' : '0 (Normal)'}</div>
          </div>
        </div>
      </div>

      {/* Discrete Actions & Q-Values Evaluation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Action Space & Neural Network Q-Values $Q(s, a; \theta)$</span>
          <span>Target Policy: Greedy Argmax</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {ACTIONS.map((action, idx) => {
            const isBest = idx === bestActionIdx;
            const isCurrentSelected = selectedAction?.id === idx;
            const qVal = qValues[idx] || 0;

            return (
              <div
                key={action.id}
                className={`p-3 rounded-xl border transition-all ${
                  isCurrentSelected
                    ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400'
                    : isBest
                    ? 'bg-slate-950/80 border-purple-800/80'
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${
                      isCurrentSelected ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {getActionIcon(action.id)}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <span>{action.name}</span>
                        {isBest && (
                          <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-700 px-1.5 py-0.2 rounded font-semibold">
                            Optimal
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {action.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400">Q-Value</div>
                    <div className={`font-mono font-extrabold text-sm ${
                      isBest ? 'text-cyan-400' : 'text-slate-300'
                    }`}>
                      {qVal > 0 ? `+${qVal.toFixed(2)}` : qVal.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Relative Q-value bar */}
                <div className="mt-2 w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isBest ? 'bg-cyan-400' : 'bg-slate-600'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(10, ((qVal + 15) / 35) * 100))}%`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Action & Reward Breakdown */}
      {selectedAction && rewardBreakdown && (
        <div className="bg-slate-950/90 p-4 rounded-xl border border-cyan-800/60 shadow-lg mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-800 gap-2 mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs text-slate-400">Agent Dispatched Action:</span>
                <div className="text-sm font-bold text-white">{selectedAction.name}</div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Instantaneous Reward Obtained:</span>
              <div className={`text-lg font-mono font-extrabold ${
                rewardBreakdown.totalReward >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {rewardBreakdown.totalReward >= 0 ? `+${rewardBreakdown.totalReward.toFixed(2)}` : rewardBreakdown.totalReward.toFixed(2)} pts
              </div>
            </div>
          </div>

          {/* Detailed Reward Mathematics */}
          <div>
            <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reward Function Breakdown $R(s, a, s')$:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Base Stability</span>
                <span className={`font-mono font-bold ${rewardBreakdown.baseStability > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  +{rewardBreakdown.baseStability.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 block">Within capacity</span>
              </div>

              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Overload Alleviation</span>
                <span className={`font-mono font-bold ${rewardBreakdown.overloadClearedBonus > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  +{rewardBreakdown.overloadClearedBonus.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 block">Cleared critical fault</span>
              </div>

              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Overload Penalty</span>
                <span className={`font-mono font-bold ${rewardBreakdown.overloadPenalty < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                  {rewardBreakdown.overloadPenalty.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 block">Unsafe heating</span>
              </div>

              <div className="bg-slate-900 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Imbalance / Disutility</span>
                <span className={`font-mono font-bold ${
                  (rewardBreakdown.imbalancePenalty + rewardBreakdown.unnecessaryActionPenalty) < 0 ? 'text-amber-400' : 'text-slate-500'
                }`}>
                  {(rewardBreakdown.imbalancePenalty + rewardBreakdown.unnecessaryActionPenalty).toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 block">Balance error & shedding</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
