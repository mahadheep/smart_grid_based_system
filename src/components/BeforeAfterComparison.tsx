import React, { useState } from 'react';
import { RLExecutionResult } from '../types';
import {
  ArrowRight, CheckCircle2, ShieldAlert, TrendingDown,
  Award, Zap, BarChart3, Download, FileJson, Check, Copy, ChevronDown, ChevronUp
} from 'lucide-react';

interface BeforeAfterComparisonProps {
  result: RLExecutionResult | null;
}

export const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({ result }) => {
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [showJsonPreview, setShowJsonPreview] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!result) {
    return (
      <div className="results-container bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl text-center py-8">
        <BarChart3 className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-pulse" />
        <h3 className="text-sm font-semibold text-slate-300">Results & Control Impact Comparison</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Adjust grid load or capacity, then click <b className="text-cyan-400">Run RL Controller</b> to generate a side-by-side Before vs After dynamic control evaluation.
        </p>
      </div>
    );
  }

  const { stateBefore, stateAfter, action, rewardBreakdown, improvementPct } = result;
  const loadRelief = Math.max(0, stateBefore.currentLoad - stateAfter.currentLoad);

  // Serialized JSON representation of current result object
  const jsonString = JSON.stringify(result, null, 2);

  const handleDownloadReport = () => {
    if (!result) return;
    try {
      const serializedJson = JSON.stringify(result, null, 2);
      const blob = new Blob([serializedJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'smart_grid_analysis.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (err) {
      console.error("Failed to download report JSON", err);
    }
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="results-container bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Module 3: Results & Dynamic Load Control Impact</span>
          </h2>
          <p className="text-xs text-slate-400">
            Direct comparison of smart power grid state prior to and following deep reinforcement learning intervention.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-bold">
            <span>Improvement:</span>
            <span className="font-mono text-sm">{improvementPct}%</span>
          </div>

          <button
            id="download-report-btn"
            onClick={handleDownloadReport}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 ${
              downloaded
                ? 'bg-emerald-600 text-white border border-emerald-500'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-500/50'
            }`}
            title="Download full results as formatted JSON (smart_grid_analysis.json)"
          >
            {downloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid Status Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: BEFORE RL CONTROL */}
        <div
          id="results-state-before-card"
          className={`p-4 rounded-xl border ${
            stateBefore.isOverloaded
              ? 'bg-red-950/40 border-red-800/80'
              : 'bg-slate-950/70 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">1. State Before Action</span>
            {stateBefore.isOverloaded ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-900/80 text-red-200 px-2 py-0.5 rounded">
                <ShieldAlert className="w-3 h-3" /> Overloaded
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3" /> Normal
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Load Demand:</span>
              <span className={`font-mono font-bold ${stateBefore.isOverloaded ? 'text-red-400' : 'text-slate-200'}`}>
                {stateBefore.currentLoad.toFixed(1)} MW
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Grid Capacity:</span>
              <span className="font-mono font-bold text-slate-200">{stateBefore.gridCapacity.toFixed(1)} MW</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Thermal Exceedance:</span>
              <span className="font-mono font-bold text-red-400">
                {stateBefore.isOverloaded ? `+${(stateBefore.currentLoad - stateBefore.gridCapacity).toFixed(1)} MW` : 'None (0 MW)'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Power Imbalance:</span>
              <span className={`font-mono font-bold ${stateBefore.powerImbalance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {stateBefore.powerImbalance > 0 ? `+${stateBefore.powerImbalance.toFixed(1)}` : stateBefore.powerImbalance.toFixed(1)} MW
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400">Frequency:</span>
              <span className="font-mono font-bold text-purple-300">{stateBefore.frequency.toFixed(2)} Hz</span>
            </div>
          </div>
        </div>

        {/* Card 2: RL AGENT INTERVENTION */}
        <div
          id="results-dispatched-action-card"
          className="p-4 rounded-xl border border-cyan-800/80 bg-slate-950/90 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">2. Dispatched Action</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700 px-1.5 py-0.5 rounded font-mono">
                Policy a*
              </span>
            </div>

            <div className="p-3 bg-cyan-950/40 rounded-lg border border-cyan-900/60 my-2">
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-300 shrink-0" />
                <span>{action.name}</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                {action.description}
              </p>
            </div>

            <div className="space-y-1.5 text-xs mt-3">
              <div className="flex justify-between text-slate-300">
                <span>Load Adjustment:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {action.loadDelta !== 0 ? `${action.loadDelta} MW` : '0 MW (None)'}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Reserve Dispatch:</span>
                <span className="font-mono font-bold text-blue-400">
                  {action.genDelta !== 0 ? `+${action.genDelta} MW` : '0 MW'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Reward Score:</span>
              <span className={`font-mono font-extrabold text-sm ${rewardBreakdown.totalReward >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {rewardBreakdown.totalReward > 0 ? `+${rewardBreakdown.totalReward.toFixed(2)}` : rewardBreakdown.totalReward.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: AFTER RL CONTROL */}
        <div
          id="results-state-after-card"
          className={`p-4 rounded-xl border ${
            stateAfter.isOverloaded
              ? 'bg-amber-950/30 border-amber-800/80'
              : 'bg-emerald-950/40 border-emerald-700/80 shadow-lg shadow-emerald-950/30'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">3. State After Action</span>
            {!stateAfter.isOverloaded ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-900/90 text-emerald-200 px-2 py-0.5 rounded shadow">
                <CheckCircle2 className="w-3 h-3" /> Stabilized
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-900/80 text-amber-200 px-2 py-0.5 rounded">
                Partial Relief
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Final Load:</span>
              <span className="font-mono font-bold text-slate-100">{stateAfter.currentLoad.toFixed(1)} MW</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Load Relief Achieved:</span>
              <span className="font-mono font-bold text-emerald-400">
                {loadRelief > 0 ? `-${loadRelief.toFixed(1)} MW` : '0 MW'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Final Thermal Status:</span>
              <span className={`font-mono font-bold ${stateAfter.isOverloaded ? 'text-amber-400' : 'text-emerald-400'}`}>
                {stateAfter.isOverloaded ? 'Overload Persists' : 'SAFE / RESOLVED'}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Final Power Balance:</span>
              <span className={`font-mono font-bold ${stateAfter.powerImbalance < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {stateAfter.powerImbalance > 0 ? `+${stateAfter.powerImbalance.toFixed(1)}` : stateAfter.powerImbalance.toFixed(1)} MW
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400">Final Frequency:</span>
              <span className="font-mono font-bold text-purple-300">{stateAfter.frequency.toFixed(2)} Hz</span>
            </div>
          </div>
        </div>
      </div>

      {/* JSON Report Export & Documentation Panel */}
      <div
        id="results-documentation-export-panel"
        className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-xs space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="font-bold text-slate-200">Academic Project Documentation Export</span>
              <p className="text-[11px] text-slate-400">
                Download structured JSON report containing state vectors, action parameters, reward signals, and relief statistics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="toggle-json-preview-btn"
              onClick={() => setShowJsonPreview(!showJsonPreview)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              <span>{showJsonPreview ? 'Hide JSON' : 'Preview JSON'}</span>
              {showJsonPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              id="copy-json-report-btn"
              onClick={handleCopyJSON}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              id="download-json-footer-btn"
              onClick={handleDownloadReport}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        {/* Collapsible JSON Preview */}
        {showJsonPreview && (
          <div className="mt-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
              <span>File: <span className="font-mono text-cyan-400">smart_grid_analysis.json</span></span>
              <span>Size: ~{Math.round(jsonString.length / 1024 * 10) / 10} KB</span>
            </div>
            <div className="bg-slate-900/90 rounded-lg p-3 border border-slate-800 max-h-60 overflow-y-auto font-mono text-[11px] text-slate-300">
              <pre><code>{jsonString}</code></pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
