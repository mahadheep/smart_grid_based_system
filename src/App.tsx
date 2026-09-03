import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { GridConfigPanel } from './components/GridConfigPanel';
import { CurrentGridStatus } from './components/CurrentGridStatus';
import { GridTopologyDiagram } from './components/GridTopologyDiagram';
import { RLControllerPanel } from './components/RLControllerPanel';
import { BeforeAfterComparison } from './components/BeforeAfterComparison';
import { Visualizations } from './components/Visualizations';
import { TrainingSection } from './components/TrainingSection';
import { PresentationGuideModal } from './components/PresentationGuideModal';
import { SourceCodeViewer } from './components/SourceCodeViewer';
import { SmartGridSimulation } from './simulation/gridEnvironment';
import { DeepQAgent } from './simulation/dqnAgent';
import { GridState, RLExecutionResult, ControlAction, RewardBreakdown } from './types';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'training' | 'presentation' | 'code'>('dashboard');

  // Core Simulation & RL Agent instances (stabilized across renders)
  const simulation = useMemo(() => new SmartGridSimulation(155.0, 135.0, 25.0), []);
  const agent = useMemo(() => new DeepQAgent(), []);

  // Configuration Sliders State
  const [loadDemand, setLoadDemand] = useState<number>(155.0);
  const [gridCapacity, setGridCapacity] = useState<number>(135.0);
  const [renewablePct, setRenewablePct] = useState<number>(25.0);

  // Live Grid State
  const [gridState, setGridState] = useState<GridState>(() => simulation.getState());
  const [qValues, setQValues] = useState<number[]>(() => agent.getQValues(simulation.getObservationArray()));
  const [selectedAction, setSelectedAction] = useState<ControlAction | null>(null);
  const [rewardBreakdown, setRewardBreakdown] = useState<RewardBreakdown | null>(null);
  const [rlResult, setRlResult] = useState<RLExecutionResult | null>(null);
  const [isRLStabilized, setIsRLStabilized] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'alert' | 'info' } | null>(null);

  // Sync state whenever slider values change
  const handleConfigUpdate = (newLoad: number, newCap: number, newRenew: number) => {
    setLoadDemand(newLoad);
    setGridCapacity(newCap);
    setRenewablePct(newRenew);

    const updatedState = simulation.setConfiguration(newLoad, newCap, newRenew);
    setGridState(updatedState);

    const obsArray = simulation.getObservationArray();
    const currentQ = agent.getQValues(obsArray);
    setQValues(currentQ);

    // If load changed, reset prior single-action execution state until Run RL is clicked
    setSelectedAction(null);
    setRewardBreakdown(null);
    setIsRLStabilized(false);
  };

  // Run Simulation Button
  const handleRunSimulation = () => {
    const updatedState = simulation.setConfiguration(loadDemand, gridCapacity, renewablePct);
    setGridState(updatedState);
    const currentQ = agent.getQValues(simulation.getObservationArray());
    setQValues(currentQ);

    if (updatedState.isOverloaded) {
      setNotification({
        message: `🚨 Grid Overloaded! Demand (${updatedState.currentLoad}MW) exceeds thermal capacity (${updatedState.gridCapacity}MW).`,
        type: 'alert'
      });
    } else {
      setNotification({
        message: `✅ Simulation updated. Grid operates stably within capacity.`,
        type: 'success'
      });
    }
  };

  // Execute RL Controller Decision
  const handleRunRL = () => {
    const stateArray = simulation.getObservationArray();
    const { action: bestActionId, qValues: calculatedQ } = agent.selectAction(stateArray, false);

    const execution = simulation.executeAction(bestActionId);

    setSelectedAction(execution.action);
    setRewardBreakdown(execution.rewardBreakdown);
    setGridState(execution.stateAfter);
    setLoadDemand(execution.stateAfter.currentLoad);

    const newResult: RLExecutionResult = {
      action: execution.action,
      qValues: calculatedQ,
      stateBefore: execution.stateBefore,
      stateAfter: execution.stateAfter,
      rewardBreakdown: execution.rewardBreakdown,
      improvementPct: execution.improvementPct,
      timestamp: new Date().toLocaleTimeString()
    };

    setRlResult(newResult);

    if (execution.stateBefore.isOverloaded && !execution.stateAfter.isOverloaded) {
      setIsRLStabilized(true);
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#06b6d4', '#10b981', '#3b82f6']
      });
      setNotification({
        message: `🎉 Overload Successfully Cleared! Agent dispatched '${execution.action.name}'. Load reduced by ${Math.round(execution.stateBefore.currentLoad - execution.stateAfter.currentLoad)} MW. (+${execution.rewardBreakdown.totalReward} pts)`,
        type: 'success'
      });
    } else if (execution.stateAfter.isOverloaded) {
      setNotification({
        message: `⚠️ Action '${execution.action.name}' applied, but high demand persists.`,
        type: 'alert'
      });
    } else {
      setNotification({
        message: `⚡ Agent evaluated state: '${execution.action.name}' maintained optimal power stability. (+${execution.rewardBreakdown.totalReward} pts)`,
        type: 'info'
      });
    }
  };

  // Predefined Demo Overload Scenario
  const handleLoadDemoScenario = () => {
    const demoLoad = 168.0;
    const demoCap = 130.0;
    const demoRenew = 18.0;

    handleConfigUpdate(demoLoad, demoCap, demoRenew);
    setNotification({
      message: `🚨 Predefined Academic Demo Scenario Loaded! Substation Capacity: 130 MW, Peak Demand: 168 MW (+38 MW Overload), Renewables: 18%.`,
      type: 'alert'
    });
  };

  // Reset to Baseline
  const handleReset = () => {
    handleConfigUpdate(110.0, 140.0, 30.0);
    setRlResult(null);
    setNotification({
      message: `🔄 Grid reset to standard nominal baseline (110 MW / 140 MW).`,
      type: 'info'
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOverloaded={gridState.isOverloaded}
        isTrained={agent.isTrained}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Floating Notification Banner if present */}
        {notification && (
          <div
            className={`p-3 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between shadow-lg transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
              notification.type === 'alert'
                ? 'bg-red-950/80 border-red-700 text-red-200'
                : notification.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                : 'bg-cyan-950/80 border-cyan-700 text-cyan-200'
            }`}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-xs opacity-70 hover:opacity-100 px-2 py-0.5 rounded bg-black/20"
            >
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: MAIN GRID DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Row: Grid Config Panel & Real-time Grid Status */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5">
                <GridConfigPanel
                  loadDemand={loadDemand}
                  gridCapacity={gridCapacity}
                  renewablePct={renewablePct}
                  onLoadChange={(val) => handleConfigUpdate(val, gridCapacity, renewablePct)}
                  onCapacityChange={(val) => handleConfigUpdate(loadDemand, val, renewablePct)}
                  onRenewableChange={(val) => handleConfigUpdate(loadDemand, gridCapacity, val)}
                  onRunSimulation={handleRunSimulation}
                  onRunRL={handleRunRL}
                  onLoadDemoScenario={handleLoadDemoScenario}
                  onReset={handleReset}
                  isOverloaded={gridState.isOverloaded}
                  isRLExecuted={selectedAction !== null}
                />
              </div>

              <div className="lg:col-span-7">
                <CurrentGridStatus
                  state={gridState}
                  isRLStabilized={isRLStabilized}
                />
              </div>
            </div>

            {/* Smart Grid Single-Line Power Flow Topology */}
            <GridTopologyDiagram
              state={gridState}
              selectedActionName={selectedAction?.name}
            />

            {/* Module 2: RL Controller Panel */}
            <RLControllerPanel
              observation={simulation.getObservation()}
              qValues={qValues}
              selectedAction={selectedAction}
              rewardBreakdown={rewardBreakdown}
              onRunRL={handleRunRL}
              isOverloaded={gridState.isOverloaded}
            />

            {/* Visualizations: Charts */}
            <Visualizations
              state={gridState}
              rlResult={rlResult}
            />

            {/* Module 3: Before vs After RL Control Results */}
            <BeforeAfterComparison
              result={rlResult}
            />
          </div>
        )}

        {/* TAB 2: DQN TRAINING SECTION */}
        {activeTab === 'training' && (
          <TrainingSection
            agent={agent}
            onTrainingComplete={() => {
              setNotification({
                message: "🎉 DQN Agent training successfully converged! Q-network weights updated and saved.",
                type: "success"
              });
            }}
          />
        )}

        {/* TAB 3: PRESENTATION & VIVA GUIDE */}
        {activeTab === 'presentation' && (
          <PresentationGuideModal />
        )}

        {/* TAB 4: PYTHON SOURCE CODE EXPLORER */}
        {activeTab === 'code' && (
          <SourceCodeViewer />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            <b>MLA0303 – Reinforcement Learning Final Academic Project</b> | Deep Reinforcement Learning for Dynamic Load Control
          </div>
          <div className="flex items-center gap-3">
            <span>Algorithm: Deep Q-Network (DQN)</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('presentation')}
              className="text-cyan-400 hover:text-cyan-300 underline font-medium"
            >
              Open 2–3 Min Demo Guide
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
