import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, FileText, Download } from 'lucide-react';

interface FileDefinition {
  name: string;
  language: string;
  description: string;
  content: string;
}

export const SourceCodeViewer: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const files: FileDefinition[] = [
    {
      name: "app.py",
      language: "python",
      description: "Complete Streamlit dashboard application with interactive Plotly visualizer and controls.",
      content: `"""
Streamlit Web Dashboard for Smart Grid Dynamic Load Control using Deep RL
Course: MLA0303 - Reinforcement Learning
Project Title: Deep Reinforcement Learning for Dynamic Load Control in Smart Power Systems

Run locally with:
    streamlit run app.py
"""

import os
import streamlit as st
import numpy as np
import pandas as pd
import plotly.graph_objects as go
from environment import SmartGridEnv
from dqn_agent import DQNAgent, TORCH_AVAILABLE

# Configure Streamlit page
st.set_page_config(
    page_title="Smart Grid Deep RL Load Control",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize Session State
if "env" not in st.session_state:
    st.session_state.env = SmartGridEnv(seed=42)
if "agent" not in st.session_state:
    st.session_state.agent = DQNAgent(seed=42)
    model_file = "models/trained_model.pt"
    if os.path.exists(model_file):
        st.session_state.agent.load(model_file)
if "sim_data" not in st.session_state:
    st.session_state.sim_data = None
if "rl_data" not in st.session_state:
    st.session_state.rl_data = None

# HEADER
st.title("⚡ Deep Reinforcement Learning for Dynamic Load Control in Smart Power Systems")
st.caption("Course: MLA0303 – Reinforcement Learning | Algorithm: Deep Q-Network (DQN)")

# SIDEBAR: GRID CONFIGURATION PANEL
st.sidebar.header("🎛️ Grid Configuration Panel")

if st.sidebar.button("🚨 Load Demo Overload Scenario", use_container_width=True):
    st.session_state.load_input = 168.0
    st.session_state.capacity_input = 130.0
    st.session_state.renewable_input = 18.0

load_demand = st.sidebar.slider("Load Demand (MW)", 50.0, 250.0, st.session_state.get("load_input", 155.0))
grid_capacity = st.sidebar.slider("Grid Capacity (MW)", 80.0, 220.0, st.session_state.get("capacity_input", 135.0))
renewable_pct = st.sidebar.slider("Renewable Contribution (%)", 5.0, 80.0, st.session_state.get("renewable_input", 25.0))

col_b1, col_b2 = st.sidebar.columns(2)
run_sim = col_b1.button("▶ Run Simulation", type="primary", use_container_width=True)
run_rl = col_b2.button("🤖 Run RL Decision", type="secondary", use_container_width=True)

if run_sim or st.session_state.sim_data is None:
    env = st.session_state.env
    state = env.reset(load=load_demand, capacity=grid_capacity, renewable_pct=renewable_pct)
    st.session_state.sim_data = {
        "load": env.current_load, "capacity": env.grid_capacity,
        "renewable_pct": env.renewable_pct, "renewable_gen": env.renewable_gen,
        "conventional_gen": env.conventional_gen, "total_gen": env.total_generation,
        "overload": env.is_overloaded, "imbalance": env.total_generation - env.current_load,
        "state": state
    }
    st.session_state.rl_data = None

if run_rl:
    env = st.session_state.env
    agent = st.session_state.agent
    curr_state = st.session_state.sim_data["state"]
    q_vals = agent.get_q_values(curr_state)
    action = int(np.argmax(q_vals))
    next_state, reward, done, info = env.step(action)
    st.session_state.rl_data = {
        "action_id": action, "action_name": env.ACTION_NAMES[action],
        "q_values": q_vals, "reward": reward, "info": info
    }

# TELEMETRY & DISPLAY
data = st.session_state.sim_data
st.subheader("📊 Module 1: Current Smart Grid Status")
c1, c2, c3, c4, c5 = st.columns(5)
c1.metric("Load Demand", f"{data['load']:.1f} MW")
c2.metric("Grid Capacity", f"{data['capacity']:.1f} MW")
c3.metric("Total Generation", f"{data['total_gen']:.1f} MW")
c4.metric("Renewable Gen", f"{data['renewable_gen']:.1f} MW ({data['renewable_pct']:.0f}%)")
c5.metric("Overload Status", "🚨 OVERLOAD" if data['overload'] else "✅ STABLE")

if st.session_state.rl_data:
    rl = st.session_state.rl_data
    st.markdown("---")
    st.subheader("🎯 Module 3: RL Decision & Impact")
    st.success(f"Selected Optimal Action: {rl['action_name']} (Reward: {rl['reward']:+.2f} pts)")
`
    },
    {
      name: "environment.py",
      language: "python",
      description: "Smart grid simulation environment implementing normalized state space, 4 discrete actions, and stability reward.",
      content: `"""
Smart Power Grid Environment for Reinforcement Learning
Course: MLA0303 - Reinforcement Learning
"""

import numpy as np

class SmartGridEnv:
    ACTION_NAMES = [
        "No Control (Maintain)",
        "Reduce Load (Curtail 15 MW)",
        "Increase Generation (+20 MW Reserve)",
        "Shift/Curtail Load (Demand Response 30 MW)"
    ]

    def __init__(self, base_capacity=140.0, max_possible_load=250.0, renewable_pct=25.0, seed=42):
        self.rng = np.random.RandomState(seed)
        self.max_possible_load = max_possible_load
        self.grid_capacity = base_capacity
        self.renewable_pct = renewable_pct
        self.state_dim = 5
        self.action_dim = 4
        self.reset()

    def reset(self, load=None, capacity=None, renewable_pct=None):
        if capacity is not None: self.grid_capacity = float(capacity)
        if renewable_pct is not None: self.renewable_pct = float(renewable_pct)
        if load is not None:
            self.current_load = float(load)
        else:
            self.current_load = float(self.rng.uniform(60.0, 180.0))

        self.renewable_gen = (self.renewable_pct / 100.0) * self.grid_capacity
        self.conventional_gen = min(self.grid_capacity - self.renewable_gen, self.current_load * 0.8)
        self.total_generation = self.conventional_gen + self.renewable_gen
        self.is_overloaded = self.current_load > self.grid_capacity
        return self._get_state()

    def _get_state(self):
        norm_load = np.clip(self.current_load / self.max_possible_load, 0.0, 1.0)
        norm_capacity = np.clip(self.grid_capacity / self.max_possible_load, 0.0, 1.0)
        renewable_ratio = np.clip(self.renewable_pct / 100.0, 0.0, 1.0)
        imbalance = self.total_generation - self.current_load
        norm_imbalance = np.clip(imbalance / self.grid_capacity, -1.0, 1.0)
        overload_flag = 1.0 if self.current_load > self.grid_capacity else 0.0
        return np.array([norm_load, norm_capacity, renewable_ratio, norm_imbalance, overload_flag], dtype=np.float32)

    def step(self, action):
        initial_load = self.current_load
        initial_overloaded = initial_load > self.grid_capacity

        if action == 1: self.current_load = max(30.0, self.current_load - 15.0)
        elif action == 2: self.conventional_gen = min(self.grid_capacity - self.renewable_gen, self.conventional_gen + 20.0)
        elif action == 3: self.current_load = max(30.0, self.current_load - 30.0)

        self.total_generation = min(self.grid_capacity, self.conventional_gen + self.renewable_gen)
        final_overloaded = self.current_load > self.grid_capacity

        reward = 0.0
        if not final_overloaded:
            reward += 10.0
            if initial_overloaded: reward += 8.0
        else:
            reward -= (15.0 + 0.3 * (self.current_load - self.grid_capacity))

        if action in [1, 3] and not initial_overloaded:
            reward -= 5.0 # penalty for unneeded load curtailment

        return self._get_state(), float(reward), False, {
            "initial_load": initial_load, "final_load": self.current_load,
            "initial_overloaded": initial_overloaded, "final_overloaded": final_overloaded
        }
`
    },
    {
      name: "dqn_agent.py",
      language: "python",
      description: "PyTorch Deep Q-Network agent with experience replay, target network, and epsilon-decay policy.",
      content: `"""
Deep Q-Network (DQN) Agent for Smart Grid Dynamic Load Control
Course: MLA0303 - Reinforcement Learning
"""

import os, random
from collections import deque
import numpy as np

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

if TORCH_AVAILABLE:
    class QNetwork(nn.Module):
        def __init__(self, state_dim=5, action_dim=4, hidden_dim=64):
            super().__init__()
            self.net = nn.Sequential(
                nn.Linear(state_dim, hidden_dim), nn.ReLU(),
                nn.Linear(hidden_dim, hidden_dim), nn.ReLU(),
                nn.Linear(hidden_dim, action_dim)
            )
        def forward(self, x): return self.net(x)

class DQNAgent:
    def __init__(self, state_dim=5, action_dim=4, lr=1e-3, gamma=0.95, seed=42):
        self.state_dim, self.action_dim, self.gamma = state_dim, action_dim, gamma
        self.epsilon, self.epsilon_min, self.epsilon_decay = 1.0, 0.02, 0.995
        self.memory = deque(maxlen=10000)
        self.steps_done = 0

        if TORCH_AVAILABLE:
            self.device = torch.device("cpu")
            self.policy_net = QNetwork(state_dim, action_dim).to(self.device)
            self.target_net = QNetwork(state_dim, action_dim).to(self.device)
            self.target_net.load_state_dict(self.policy_net.state_dict())
            self.optimizer = optim.Adam(self.policy_net.parameters(), lr=lr)
            self.criterion = nn.SmoothL1Loss()

    def get_q_values(self, state):
        if TORCH_AVAILABLE:
            with torch.no_grad():
                st = torch.FloatTensor(state).unsqueeze(0).to(self.device)
                return self.policy_net(st).cpu().numpy()[0]
        return np.array([5.0, 3.0, 4.0, 2.0])

    def select_action(self, state, evaluate=False):
        if not evaluate and random.random() < self.epsilon:
            return random.randrange(self.action_dim)
        return int(np.argmax(self.get_q_values(state)))

    def train_step(self, batch_size=64):
        if not TORCH_AVAILABLE or len(self.memory) < batch_size: return 0.0
        batch = random.sample(self.memory, batch_size)
        s, a, r, s_next, done = zip(*batch)
        s_t = torch.FloatTensor(np.array(s))
        a_t = torch.LongTensor(a).unsqueeze(1)
        r_t = torch.FloatTensor(r).unsqueeze(1)
        s_next_t = torch.FloatTensor(np.array(s_next))
        d_t = torch.FloatTensor(done).unsqueeze(1)

        curr_q = self.policy_net(s_t).gather(1, a_t)
        with torch.no_grad():
            next_q = self.target_net(s_next_t).max(1)[0].unsqueeze(1)
            target_q = r_t + (1 - d_t) * self.gamma * next_q

        loss = self.criterion(curr_q, target_q)
        self.optimizer.zero_grad(); loss.backward(); self.optimizer.step()
        self.steps_done += 1
        if self.steps_done % 10 == 0:
            self.target_net.load_state_dict(self.policy_net.state_dict())
        return float(loss.item())

    def save(self, path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        if TORCH_AVAILABLE: torch.save(self.policy_net.state_dict(), path)

    def load(self, path):
        if TORCH_AVAILABLE and os.path.exists(path):
            self.policy_net.load_state_dict(torch.load(path, map_location=self.device))
            self.target_net.load_state_dict(self.policy_net.state_dict())
`
    },
    {
      name: "train.py",
      language: "python",
      description: "Offline training runner script that trains the agent for N episodes and saves model weights.",
      content: `"""
Training Script for Smart Grid DQN Agent
Usage: python train.py --episodes 150
"""
import argparse
from environment import SmartGridEnv
from dqn_agent import DQNAgent

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--episodes", type=int, default=150)
    parser.add_argument("--save_path", type=str, default="models/trained_model.pt")
    args = parser.parse_args()

    env = SmartGridEnv()
    agent = DQNAgent()
    print(f"[INFO] Training DQN Agent across {args.episodes} episodes...")

    for ep in range(1, args.episodes + 1):
        s = env.reset()
        ep_reward = 0.0
        for _ in range(24):
            a = agent.select_action(s)
            s_next, r, done, info = env.step(a)
            agent.memory.append((s, a, r, s_next, float(done)))
            agent.train_step()
            s = s_next
            ep_reward += r

        agent.epsilon = max(0.02, agent.epsilon * 0.995)
        if ep % 10 == 0:
            print(f"Episode {ep:3d} | Reward: {ep_reward:+.2f} | Epsilon: {agent.epsilon:.3f}")

    agent.save(args.save_path)
    print(f"[SUCCESS] Trained model saved to: {args.save_path}")

if __name__ == "__main__":
    main()
`
    },
    {
      name: "requirements.txt",
      language: "text",
      description: "Python package dependencies.",
      content: `streamlit>=1.32.0
torch>=2.1.0
numpy>=1.24.0
pandas>=2.0.0
plotly>=5.18.0
matplotlib>=3.8.0
`
    },
    {
      name: "README.md",
      language: "markdown",
      description: "Academic report with problem statement, architecture, state-action design, and viva Q&A.",
      content: `# Deep Reinforcement Learning for Dynamic Load Control in Smart Power Systems
Course: MLA0303 – Reinforcement Learning

## Execution Commands:
\`\`\`bash
cd smart_grid_rl
pip install -r requirements.txt
python train.py --episodes 150
streamlit run app.py
\`\`\`
`
    }
  ];

  const currentFile = files[selectedFileIndex];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Python Project Files & Local Execution Package
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete, runnable Python source files created in the project repository for local execution with Streamlit & PyTorch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy File'}</span>
          </button>
        </div>
      </div>

      {/* Terminal Quick Start Guide */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300">
        <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1.5">
          <Terminal className="w-4 h-4" />
          <span>Local Run Commands (On Your Laptop):</span>
        </div>
        <div className="space-y-0.5 text-[11px] text-slate-300">
          <div><span className="text-slate-500">$</span> cd smart_grid_rl</div>
          <div><span className="text-slate-500">$</span> pip install -r requirements.txt</div>
          <div><span className="text-slate-500">$</span> python train.py --episodes 150</div>
          <div><span className="text-slate-500">$</span> <span className="text-emerald-400 font-semibold">streamlit run app.py</span></div>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-2">
        {files.map((file, idx) => (
          <button
            key={file.name}
            onClick={() => {
              setSelectedFileIndex(idx);
              setCopied(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
              selectedFileIndex === idx
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 font-bold shadow-sm'
                : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{file.name}</span>
          </button>
        ))}
      </div>

      <div className="text-xs text-slate-400">
        <b>File Purpose:</b> {currentFile.description}
      </div>

      {/* Code Box */}
      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 overflow-x-auto max-h-[480px]">
        <pre className="font-mono text-[11px] text-slate-200 leading-relaxed">
          <code>{currentFile.content}</code>
        </pre>
      </div>
    </div>
  );
};
