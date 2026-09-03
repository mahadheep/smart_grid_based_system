import React from 'react';
import { GridState, RLExecutionResult } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import { BarChart2, PieChart, Activity } from 'lucide-react';

interface VisualizationsProps {
  state: GridState;
  rlResult: RLExecutionResult | null;
}

export const Visualizations: React.FC<VisualizationsProps> = ({ state, rlResult }) => {
  // Data for Load vs Capacity & Generation
  const barData = [
    {
      name: 'Current Load',
      value: state.currentLoad,
      color: state.isOverloaded ? '#ef4444' : '#3b82f6',
      type: 'Demand'
    },
    {
      name: 'Grid Capacity',
      value: state.gridCapacity,
      color: '#94a3b8',
      type: 'Limit'
    },
    {
      name: 'Total Generation',
      value: state.totalGen,
      color: '#06b6d4',
      type: 'Supply'
    },
    {
      name: 'Renewable Gen',
      value: state.renewableGen,
      color: '#10b981',
      type: 'Supply'
    }
  ];

  // Supply vs Demand Comparison data
  const supplyDemandData = [
    {
      category: 'Power Flow',
      Demand: state.currentLoad,
      Conventional: state.conventionalGen,
      Renewable: state.renewableGen
    }
  ];

  // Before vs After Comparison Data if RL was executed
  const comparisonData = rlResult ? [
    {
      metric: 'Load Demand (MW)',
      Before: rlResult.stateBefore.currentLoad,
      After: rlResult.stateAfter.currentLoad,
      Limit: state.gridCapacity
    },
    {
      metric: 'Generation (MW)',
      Before: rlResult.stateBefore.totalGen,
      After: rlResult.stateAfter.totalGen,
      Limit: state.gridCapacity
    }
  ] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Chart 1: Load vs Capacity & Generation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Load vs Grid Capacity & Generation</h3>
          </div>
          <span className="text-xs text-slate-400">Power in Megawatts (MW)</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 260]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#f1f5f9' }}
                formatter={(val: any) => [`${Number(val).toFixed(1)} MW`, 'Power']}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex justify-around text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Demand</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>Capacity Limit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span>Total Supply</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Renewables</span>
          </div>
        </div>
      </div>

      {/* Chart 2: Supply vs Demand Breakdown OR Before/After Comparison */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              {comparisonData ? 'Before vs After RL Control Impact' : 'Generation Mix vs Load Demand'}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {comparisonData ? 'Mitigation Delta' : 'Energy Dispatch (MW)'}
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {comparisonData ? (
              <BarChart data={comparisonData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="metric" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 240]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#f1f5f9' }}
                  formatter={(val: any) => [`${Number(val).toFixed(1)} MW`]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Before" fill="#ef4444" radius={[4, 4, 0, 0]} name="Before RL" />
                <Bar dataKey="After" fill="#10b981" radius={[4, 4, 0, 0]} name="After RL" />
                <Bar dataKey="Limit" fill="#64748b" radius={[4, 4, 0, 0]} name="Substation Limit" />
              </BarChart>
            ) : (
              <BarChart data={supplyDemandData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 250]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#f1f5f9' }}
                  formatter={(val: any) => [`${Number(val).toFixed(1)} MW`]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Demand" fill={state.isOverloaded ? '#ef4444' : '#3b82f6'} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Renewable" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Conventional" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80 flex justify-between items-center">
          <span>Net Discrepancy: <b className={state.powerImbalance < 0 ? 'text-red-400' : 'text-emerald-400'}>{state.powerImbalance.toFixed(1)} MW</b></span>
          <span>Grid Frequency: <b className="text-purple-300">{state.frequency.toFixed(2)} Hz</b></span>
        </div>
      </div>
    </div>
  );
};
