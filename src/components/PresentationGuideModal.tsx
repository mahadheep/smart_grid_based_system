import React, { useState } from 'react';
import { BookOpen, CheckCircle2, HelpCircle, Lightbulb, Play, Terminal, ArrowRight, ShieldCheck } from 'lucide-react';
import { VivaQuestion } from '../types';

export const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    id: 1,
    category: "DQN & RL",
    question: "What is Deep Q-Learning (DQN) and why is it used here instead of tabular Q-learning?",
    answer: "Tabular Q-learning requires a discrete lookup table of size |S| × |A|. Because power grid states (load in MW, capacity, renewable %) are continuous real numbers, tabular methods suffer from the curse of dimensionality. DQN uses a deep neural network as a function approximator to generalize across infinite continuous grid states."
  },
  {
    id: 2,
    category: "DQN & RL",
    question: "What are the roles of Experience Replay and the Target Network in DQN?",
    answer: "Experience Replay stores past transitions (s, a, r, s', done) and samples mini-batches uniformly, breaking temporal correlations in sequential time-series data. The Target Network provides a temporarily frozen set of weights to compute Bellman target values, preventing moving-target divergence and gradient explosion."
  },
  {
    id: 3,
    category: "Training & State Design",
    question: "How is the state space designed for this smart power grid?",
    answer: "The state vector s is 5-dimensional and normalized: [Norm Load (L/L_max), Norm Capacity (C/L_max), Renewable Penetration (0 to 1), Power Imbalance ((Gen - Load)/C), and Overload Binary Indicator (1 if L > C else 0)]. Normalization guarantees stable gradient propagation through ReLU activations."
  },
  {
    id: 4,
    category: "Training & State Design",
    question: "What discrete actions can the agent take?",
    answer: "The agent selects from 4 actions: a0: No Control (maintain current dispatch), a1: Reduce Load (curtail non-critical 15 MW), a2: Increase Generation (dispatch 20 MW fast-ramping spinning reserve/battery), and a3: Demand Response (aggressive 30 MW peak clipping)."
  },
  {
    id: 5,
    category: "Training & State Design",
    question: "Explain the mathematical formulation of your reward function.",
    answer: "R(s, a, s') awards +10 pts for maintaining normal safe operation, +8 pts bonus for clearing an active overload, penalties of -15 to -25 pts for allowing an overload to persist, and a -5 pt penalty for unnecessary load shedding during normal operations. This balances grid security with consumer utility."
  },
  {
    id: 6,
    category: "Smart Grid",
    question: "How does this project specifically relate to real-world Smart Grids?",
    answer: "Modern smart grids feature high penetration of intermittent solar/wind power and volatile consumer loads (e.g. EV fast charging). Smart grids deploy automated AMI (Advanced Metering Infrastructure) and demand-response switches. Our DQN controller acts as the autonomous distribution management brain at the substation level."
  },
  {
    id: 7,
    category: "Smart Grid",
    question: "Why is Reinforcement Learning superior to traditional rule-based or PID control for dynamic load control?",
    answer: "Rule-based/heuristic systems rely on fixed static thresholds (e.g., 'if load > 90%, cut 20%'). They cannot anticipate renewable fluctuations, fail under compound conditions, and either over-curtail or respond too late. RL learns proactive multi-step policies that adapt dynamically to volatile distributions without rigid manual tuning."
  },
  {
    id: 8,
    category: "DQN & RL",
    question: "What is the difference between training mode and inference (evaluation) mode?",
    answer: "During training, the agent uses an ε-greedy policy (starting with ε=1.0 down to ε=0.02) to explore different grid actions and updates neural network weights via backpropagation. During inference (presentation demo), ε=0 (greedy policy), where the agent instantaneously selects the optimal action a* = argmax Q(s, a) in <1 millisecond."
  },
  {
    id: 9,
    category: "Training & State Design",
    question: "What is an 'Episode' in your simulation?",
    answer: "An episode is a discrete simulated dispatch period (e.g., 24 time-steps or 12 control cycles) where the agent interacts with changing weather, renewable generation, and customer load demand until terminal criteria are reached."
  },
  {
    id: 10,
    category: "Smart Grid",
    question: "What are the limitations of this implementation and how would you extend it in the future?",
    answer: "Limitations include a discrete 4-action space and a single-bus equivalent model. Future extensions would utilize continuous action actor-critic methods (like DDPG or PPO) and multi-agent reinforcement learning (MARL) for complex multi-bus IEEE 14/39 bus distribution networks with AC power flow constraints."
  }
];

export const PresentationGuideModal: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'script' | 'viva' | 'concepts'>('script');
  const [expandedViva, setExpandedViva] = useState<number | null>(1);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Final Academic Presentation & Viva Examination Guide
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Course: <b className="text-slate-200">MLA0303 – Reinforcement Learning</b> | Topic: Deep Reinforcement Learning for Dynamic Load Control
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSection('script')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeSection === 'script' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2–3 Min Demo Script
          </button>
          <button
            onClick={() => setActiveSection('viva')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeSection === 'viva' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            10 Viva Q&A
          </button>
          <button
            onClick={() => setActiveSection('concepts')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeSection === 'concepts' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Core Concepts Explained
          </button>
        </div>
      </div>

      {/* SECTION 1: 2-3 MINUTE LIVE DEMO PROCEDURE */}
      {activeSection === 'script' && (
        <div className="space-y-4">
          <div className="bg-amber-950/30 border border-amber-800/60 p-3.5 rounded-xl text-xs text-amber-200">
            <h3 className="font-bold flex items-center gap-2 text-amber-300 text-sm mb-1">
              <Play className="w-4 h-4 fill-amber-300" />
              Live 2–3 Minute Presentation Walkthrough Procedure
            </h3>
            <p className="text-slate-300">
              Follow these exact button clicks and spoken talking points during your presentation to deliver a confident, high-scoring final demonstration.
            </p>
          </div>

          <div className="space-y-3">
            {/* Step 1 */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 1 (0:00 – 0:35): Problem Intro & Grid Baseline</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">Click: "⚖️ Normal Baseline"</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <b>What to say:</b> <i>"Respected evaluators, modern smart power grids face high volatility from renewable solar/wind generation and surging peak demands. In Module 1, our environment simulates a substation bus with 140 MW capacity and dynamic consumer loads. Currently at 110 MW load, the grid is operating safely within limits with 50 Hz nominal frequency."</i>
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-red-900/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Step 2 (0:35 – 1:15): Induce Predefined Overload</span>
                <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded font-mono font-bold">Click: "🚨 Load Demo Overload Scenario"</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <b>What to say:</b> <i>"Now let us inject a critical peak stress event. Notice that consumer demand surges to 168 MW, while substation thermal limit is only 130 MW, causing a +38 MW overload! Renewable generation dropped to 18%. The telemetry dashboard immediately alerts us of critical line heating and frequency degradation. Without intervention, this would trigger cascading blackout."</i>
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-cyan-900/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 3 (1:15 – 2:00): Execute Deep RL Controller</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono font-bold">Click: "Run RL Controller"</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <b>What to say:</b> <i>"In Module 2, our Deep Q-Network evaluates the 5-dimensional normalized state vector. Looking at the action values, Action 3 (Demand Response 30 MW Curtailment) has the highest Q-value of +21.4. Upon dispatch, load reduces from 168 MW down to 138 MW, completely alleviating the thermal emergency. Module 3 shows an instantaneous positive reward of +18.2 pts, eliminating the -15 pt overload penalty."</i>
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-purple-900/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Step 4 (2:00 – 2:30): Show Training Convergence & Conclusion</span>
                <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-850 px-2 py-0.5 rounded font-mono">Switch to: "DQN Training Tab"</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <b>What to say:</b> <i>"In the DQN Training tab, our convergence curves prove that the agent learned this policy over 100 episodes using Bellman updates and Experience Replay. The loss decays from 2.5 down to 0.15 while average reward climbs steadily from -40 to +75. Thus, Deep RL provides an autonomous, real-time solution for smart grid stability. Thank you, I welcome your questions."</i>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: 10 VIVA QUESTIONS & ANSWERS */}
      {activeSection === 'viva' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 mb-2">
            Click on any question to review the concise, high-impact academic answer:
          </p>

          <div className="space-y-2">
            {VIVA_QUESTIONS.map((viva) => {
              const isExpanded = expandedViva === viva.id;
              return (
                <div
                  key={viva.id}
                  className={`rounded-xl border transition-all ${
                    isExpanded ? 'bg-slate-950 border-cyan-800' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => setExpandedViva(isExpanded ? null : viva.id)}
                    className="w-full text-left p-3.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                        Q{viva.id}
                      </span>
                      <span className="font-semibold text-slate-200">{viva.question}</span>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded shrink-0">
                      {viva.category}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 bg-slate-900/40 rounded-b-xl">
                      <p className="pl-8 border-l-2 border-cyan-500 py-1 text-slate-200">
                        <b>Answer:</b> {viva.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 3: CORE CONCEPTS EXPLAINED SIMPLY */}
      {activeSection === 'concepts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-cyan-400 mb-1">1. Deep Q-Network (DQN)</h4>
            <p className="text-slate-300 leading-relaxed">
              A reinforcement learning algorithm that uses a Deep Artificial Neural Network to predict the expected future cumulative reward $Q(s, a)$ for taking action $a$ in state $s$.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-cyan-400 mb-1">2. State ($s$)</h4>
            <p className="text-slate-300 leading-relaxed">
              A snapshot of the power grid at a given instant: normalized current load, substation capacity, renewable energy percentage, net balance, and overload flag.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-cyan-400 mb-1">3. Action ($a$)</h4>
            <p className="text-slate-300 leading-relaxed">
              The control decision issued by the agent: maintaining status quo, dispatching battery reserve generation (+20 MW), or curtailing controllable customer loads (-15 or -30 MW).
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-cyan-400 mb-1">4. Reward ($R$)</h4>
            <p className="text-slate-300 leading-relaxed">
              The scalar teaching signal: positive rewards (+10) for maintaining safe frequency and power balance, and heavy penalties (-15 to -20) for permitting overloads.
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-cyan-400 mb-1">5. Training vs Inference</h4>
            <p className="text-slate-300 leading-relaxed">
              <b>Training:</b> The agent explores through trial-and-error, storing transitions in memory and updating weights via gradient descent. <br/>
              <b>Inference:</b> The trained neural network acts as an instantaneous real-time dispatcher ($\arg\max Q(s, a)$).
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
            <h4 className="font-bold text-cyan-400 mb-1">6. Why RL Beats Static Rules</h4>
            <p className="text-slate-300 leading-relaxed">
              Static rules (e.g. fixed threshold shedding) are brittle under renewable volatility. RL learns adaptive, multi-step optimal trade-offs between reserve dispatch cost and customer comfort.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
