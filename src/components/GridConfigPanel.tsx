import React from 'react';
import { Play, Sparkles, AlertOctagon, RotateCcw, Sliders, Sun, Gauge, BarChart2 } from 'lucide-react';

interface GridConfigPanelProps {
  loadDemand: number;
  gridCapacity: number;
  renewablePct: number;
  onLoadChange: (val: number) => void;
  onCapacityChange: (val: number) => void;
  onRenewableChange: (val: number) => void;
  onRunSimulation: () => void;
  onRunRL: () => void;
  onLoadDemoScenario: () => void;
  onReset: () => void;
  isOverloaded: boolean;
  isRLExecuted: boolean;
}

export const GridConfigPanel: React.FC<GridConfigPanelProps> = ({
  loadDemand,
  gridCapacity,
  renewablePct,
  onLoadChange,
  onCapacityChange,
  onRenewableChange,
  onRunSimulation,
  onRunRL,
  onLoadDemoScenario,
  onReset,
  isOverloaded,
  isRLExecuted
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Module 1: Grid Configuration Panel
          </h2>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-slate-800/50 hover:bg-slate-800"
          title="Reset to defaults"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Predefined Scenario Quick Launcher */}
      <div className="mb-5 bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Presentation Demo Presets
          </span>
          <span className="text-[10px] bg-red-950/60 text-red-400 border border-red-800/60 px-1.5 py-0.5 rounded font-medium">
            Demo Recommended
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={onLoadDemoScenario}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-red-900/40 to-amber-900/30 hover:from-red-900/60 hover:to-amber-900/50 border border-red-700/50 text-red-200 font-semibold text-xs transition-all shadow-sm hover:shadow-red-900/20"
          >
            <AlertOctagon className="w-4 h-4 text-red-400" />
            <span>🚨 Demo Overload (168MW / 130MW)</span>
          </button>

          <button
            onClick={() => {
              onLoadChange(110);
              onCapacityChange(140);
              onRenewableChange(35);
              onRunSimulation();
            }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium text-xs transition-all"
          >
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>⚖️ Normal Baseline (110MW)</span>
          </button>
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        {/* Load Demand Slider */}
        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <label htmlFor="load-slider" className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
              1. Load Demand ($L$)
            </label>
            <span className="font-mono font-bold text-sm text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded border border-blue-900/50">
              {loadDemand.toFixed(1)} MW
            </span>
          </div>
          <input
            id="load-slider"
            type="range"
            min="50"
            max="250"
            step="1"
            value={loadDemand}
            onChange={(e) => onLoadChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>50 MW (Light)</span>
            <span className="text-slate-400 font-medium">150 MW (Avg)</span>
            <span>250 MW (Peak)</span>
          </div>
        </div>

        {/* Grid Capacity Slider */}
        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <label htmlFor="capacity-slider" className="font-semibold text-slate-300 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
              2. Grid Capacity (C_grid)
            </label>
            <span className="font-mono font-bold text-sm text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              {gridCapacity.toFixed(1)} MW
            </span>
          </div>
          <input
            id="capacity-slider"
            type="range"
            min="80"
            max="220"
            step="1"
            value={gridCapacity}
            onChange={(e) => onCapacityChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>80 MW</span>
            <span className="text-slate-400 font-medium">140 MW (Standard)</span>
            <span>220 MW</span>
          </div>
        </div>

        {/* Renewable Energy % Slider */}
        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
          <div className="flex justify-between items-center mb-1.5 text-xs">
            <label htmlFor="renewable-slider" className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-emerald-400" />
              3. Renewable Contribution (η_ren)
            </label>
            <span className="font-mono font-bold text-sm text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/50">
              {renewablePct}%
            </span>
          </div>
          <input
            id="renewable-slider"
            type="range"
            min="5"
            max="80"
            step="1"
            value={renewablePct}
            onChange={(e) => onRenewableChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>5% (Cloud/Calm)</span>
            <span className="text-slate-400 font-medium">25% (Nominal)</span>
            <span>80% (Solar Peak)</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onRunSimulation}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs sm:text-sm transition-all border border-slate-700 active:scale-[0.98]"
        >
          <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
          <span>Run Simulation</span>
        </button>

        <button
          onClick={onRunRL}
          className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-xs sm:text-sm transition-all active:scale-[0.98] ${
            isOverloaded
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/50 ring-2 ring-cyan-400/40'
              : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Run RL Controller</span>
        </button>
      </div>

      {isOverloaded && !isRLExecuted && (
        <div className="mt-3 p-2.5 rounded-lg bg-red-950/60 border border-red-800/80 text-xs text-red-200 flex items-center gap-2 animate-pulse">
          <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
          <span>Overload active! Click <b>Run RL Controller</b> to dispatch autonomous DQN mitigation.</span>
        </div>
      )}
    </div>
  );
};
