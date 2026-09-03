import React from 'react';
import { GridState } from '../types';
import { Activity, AlertTriangle, CheckCircle, Flame, ShieldAlert, Zap, BatteryCharging, Gauge } from 'lucide-react';

interface CurrentGridStatusProps {
  state: GridState;
  isRLStabilized?: boolean;
}

export const CurrentGridStatus: React.FC<CurrentGridStatusProps> = ({
  state,
  isRLStabilized
}) => {
  const {
    currentLoad,
    gridCapacity,
    renewablePct,
    renewableGen,
    conventionalGen,
    totalGen,
    isOverloaded,
    powerImbalance,
    frequency
  } = state;

  const loadPctOfCapacity = Math.round((currentLoad / gridCapacity) * 100);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Current Grid Telemetry & Stability Status</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time power balance across generation bus, distribution substation, and aggregate feeder loads.
          </p>
        </div>

        {/* Status Badge */}
        <div>
          {isOverloaded ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/90 border border-red-600 text-red-300 text-xs font-bold shadow-lg shadow-red-950/50 animate-pulse">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>OVERLOAD CONDITION ({loadPctOfCapacity}% of Capacity)</span>
            </div>
          ) : isRLStabilized ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 text-xs font-bold shadow-lg shadow-cyan-950/50">
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              <span>STABILIZED BY DEEP RL ({loadPctOfCapacity}%)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-bold shadow-lg shadow-emerald-950/50">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>GRID STABLE / NORMAL ({loadPctOfCapacity}%)</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Load Demand */}
        <div className={`p-3 rounded-lg border transition-all ${
          isOverloaded
            ? 'bg-red-950/40 border-red-700/60 shadow-inner'
            : 'bg-slate-950/60 border-slate-800'
        }`}>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Load Demand</span>
            <Zap className={`w-3.5 h-3.5 ${isOverloaded ? 'text-red-400' : 'text-blue-400'}`} />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-xl font-extrabold font-mono ${isOverloaded ? 'text-red-400' : 'text-slate-100'}`}>
              {currentLoad.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">MW</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {loadPctOfCapacity}% rating
          </div>
        </div>

        {/* Grid Capacity */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Grid Capacity</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-extrabold font-mono text-slate-100">
              {gridCapacity.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">MW</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Thermal safety limit
          </div>
        </div>

        {/* Total Generation */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Total Generation</span>
            <BatteryCharging className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-extrabold font-mono text-cyan-400">
              {totalGen.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">MW</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Conv: {conventionalGen.toFixed(0)} | Ren: {renewableGen.toFixed(0)}
          </div>
        </div>

        {/* Renewable Contribution */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Renewables</span>
            <span className="text-[10px] text-emerald-400 font-bold">{renewablePct}%</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-extrabold font-mono text-emerald-400">
              {renewableGen.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">MW</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Solar PV & Wind clean
          </div>
        </div>

        {/* Power Balance */}
        <div className={`p-3 rounded-lg border ${
          powerImbalance < -5
            ? 'bg-red-950/30 border-red-800/50'
            : powerImbalance > 5
            ? 'bg-amber-950/20 border-amber-800/40'
            : 'bg-emerald-950/30 border-emerald-800/40'
        }`}>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Power Balance</span>
            <span className="text-[10px] text-slate-400">Gen - Load</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-xl font-extrabold font-mono ${
              powerImbalance < 0 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {powerImbalance > 0 ? `+${powerImbalance.toFixed(1)}` : powerImbalance.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400">MW</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {powerImbalance < 0 ? 'Deficit (Strain)' : 'Equilibrium'}
          </div>
        </div>

        {/* Grid Frequency & Stability */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Grid Frequency</span>
            <Gauge className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className={`text-xl font-extrabold font-mono ${
              Math.abs(frequency - 50.0) > 0.4 ? 'text-red-400' : 'text-purple-300'
            }`}>
              {frequency.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">Hz</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Nominal 50.00 Hz
          </div>
        </div>
      </div>

      {/* Load vs Capacity Visual Gauge Bar */}
      <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="font-semibold text-slate-300">Substation Thermal Loading:</span>
            <span className="font-mono text-slate-200">{currentLoad.toFixed(1)} / {gridCapacity.toFixed(1)} MW</span>
          </span>
          <span className={`font-mono font-bold ${isOverloaded ? 'text-red-400' : 'text-emerald-400'}`}>
            {loadPctOfCapacity}% {isOverloaded ? 'CRITICAL EXCEEDED' : 'SAFE'}
          </span>
        </div>
        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden relative">
          {/* Capacity threshold tick at 100% relative point */}
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isOverloaded
                ? 'bg-gradient-to-r from-amber-500 to-red-600'
                : loadPctOfCapacity > 85
                ? 'bg-gradient-to-r from-cyan-500 to-amber-500'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
            }`}
            style={{ width: `${Math.min(100, loadPctOfCapacity)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
