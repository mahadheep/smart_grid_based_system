import React from 'react';
import { Zap, Cpu, Activity, BookOpen, Code2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'training' | 'presentation' | 'code';
  setActiveTab: (tab: 'dashboard' | 'training' | 'presentation' | 'code') => void;
  isOverloaded: boolean;
  isTrained: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isOverloaded,
  isTrained
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Title and Academic Course Info */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/50">
              <Zap className="w-6 h-6 animate-pulse text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Deep Reinforcement Learning for Dynamic Load Control
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Smart Power Systems
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-slate-300">Course: MLA0303 – Reinforcement Learning</span>
                <span>•</span>
                <span className="text-cyan-400">Deep Q-Network (DQN)</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {isTrained ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Agent Ready
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3 h-3" /> Untrained
                    </span>
                  )}
                </span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800 text-xs sm:text-sm">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Grid Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('training')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'training'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>DQN Training</span>
            </button>

            <button
              onClick={() => setActiveTab('presentation')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'presentation'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400/90 hover:text-amber-300 hover:bg-amber-950/40'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Presentation & Viva Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'code'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Python Source</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
