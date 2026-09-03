import React from 'react';
import { GridState } from '../types';
import { Sun, Wind, Factory, Building2, Car, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface GridTopologyDiagramProps {
  state: GridState;
  selectedActionName?: string;
}

export const GridTopologyDiagram: React.FC<GridTopologyDiagramProps> = ({
  state,
  selectedActionName
}) => {
  const {
    currentLoad,
    gridCapacity,
    renewableGen,
    conventionalGen,
    totalGen,
    isOverloaded
  } = state;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 mb-4 gap-2">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          Single-Line Smart Grid Power Flow Topology
        </h3>
        {selectedActionName && (
          <span className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-2.5 py-1 rounded-full font-medium">
            Active RL Dispatch: {selectedActionName}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Node 1: Renewable Sources */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-emerald-900/60 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Renewable Gen</span>
            <div className="flex gap-1 text-emerald-400">
              <Sun className="w-4 h-4 animate-spin" style={{ animationDuration: '18s' }} />
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-mono font-bold text-slate-100">{renewableGen.toFixed(1)} <span className="text-xs text-slate-400 font-normal">MW</span></div>
          <p className="text-[10px] text-slate-400 mt-1">Solar PV + Wind Array ({state.renewablePct}%)</p>
          <div className="mt-2 text-[10px] text-emerald-400/90 font-mono bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-900/40 inline-block">
            Priority Dispatch
          </div>
        </div>

        {/* Node 2: Conventional & Fast Reserve */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-blue-900/60 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Base & Reserve</span>
            <Factory className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-mono font-bold text-slate-100">{conventionalGen.toFixed(1)} <span className="text-xs text-slate-400 font-normal">MW</span></div>
          <p className="text-[10px] text-slate-400 mt-1">Thermal / Hydro / BESS Storage</p>
          <div className="mt-2 text-[10px] text-blue-400/90 font-mono bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-900/40 inline-block">
            Fast Ramping Reserve
          </div>
        </div>

        {/* Node 3: Central Substation Bus (The Bottleneck) */}
        <div className={`p-3.5 rounded-xl border shadow-md relative transition-all ${
          isOverloaded
            ? 'bg-red-950/50 border-red-600 shadow-red-950/60 ring-2 ring-red-500/40'
            : 'bg-slate-950/80 border-slate-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Substation Bus</span>
            {isOverloaded ? (
              <ShieldAlert className="w-4 h-4 text-red-400 animate-bounce" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="text-lg font-mono font-bold text-slate-100">
            {totalGen.toFixed(1)} <span className="text-xs text-slate-400 font-normal">MW flow</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Capacity Limit:</span>
            <span className="font-mono font-semibold text-slate-200">{gridCapacity.toFixed(1)} MW</span>
          </div>
          <div className="mt-2">
            {isOverloaded ? (
              <span className="text-[10px] text-red-300 font-bold bg-red-900/60 px-2 py-0.5 rounded border border-red-700 block text-center">
                THERMAL OVERLOAD (+{(currentLoad - gridCapacity).toFixed(1)} MW)
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800 block text-center">
                Operating within Limits
              </span>
            )}
          </div>
        </div>

        {/* Node 4: Dynamic Consumer Loads */}
        <div className={`p-3.5 rounded-xl border shadow-md ${
          isOverloaded
            ? 'bg-red-950/30 border-red-700/60'
            : 'bg-slate-950/70 border-cyan-900/60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Dynamic Load</span>
            <div className="flex gap-1 text-cyan-400">
              <Building2 className="w-4 h-4" />
              <Car className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-lg font-mono font-bold ${isOverloaded ? 'text-red-400' : 'text-slate-100'}`}>
            {currentLoad.toFixed(1)} <span className="text-xs text-slate-400 font-normal">MW</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Residential, Industry & EV Fast Chargers</p>
          <div className="mt-2 text-[10px] text-cyan-400/90 font-mono bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-900/40 inline-block">
            Controllable Demand Response
          </div>
        </div>
      </div>

      {/* Dynamic Power Flow Summary Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-300 font-medium">Generation Mix:</span>
          <span className="text-emerald-400 font-mono font-semibold">{((renewableGen / totalGen) * 100).toFixed(0)}% Renewable</span>
          <span>+</span>
          <span className="text-blue-400 font-mono font-semibold">{((conventionalGen / totalGen) * 100).toFixed(0)}% Conventional</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-300 font-medium">Net Grid Balance:</span>
          <span className={`font-mono font-bold ${state.powerImbalance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {state.powerImbalance > 0 ? `+${state.powerImbalance.toFixed(1)}` : state.powerImbalance.toFixed(1)} MW
          </span>
          <span>({state.powerImbalance < 0 ? 'Strain / Deficit' : 'Balanced'})</span>
        </div>
      </div>
    </div>
  );
};
