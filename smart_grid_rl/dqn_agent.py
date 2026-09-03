"""
Deep Q-Network (DQN) Agent for Smart Grid Dynamic Load Control
Course: MLA0303 - Reinforcement Learning

Components:
- Q-Network (Multi-Layer Perceptron)
- Experience Replay Memory
- Target Q-Network for Training Stability
- Epsilon-Greedy Action Selection Policy
- Bellman Optimality Update via Adam Optimizer
"""

import os
import random
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
        """Deep Neural Network approximating the optimal Action-Value function Q*(s, a)."""
        def __init__(self, state_dim=5, action_dim=4, hidden_dim=64):
            super(QNetwork, self).__init__()
            self.net = nn.Sequential(
                nn.Linear(state_dim, hidden_dim),
                nn.ReLU(),
                nn.Linear(hidden_dim, hidden_dim),
                nn.ReLU(),
                nn.Linear(hidden_dim, action_dim)
            )

        def forward(self, state):
            return self.net(state)


class ReplayBuffer:
    """Experience Replay Buffer to break temporal correlations between sequential transitions."""
    def __init__(self, capacity=10000):
        self.buffer = deque(maxlen=capacity)

    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size):
        batch = random.sample(self.buffer, batch_size)
        state, action, reward, next_state, done = zip(*batch)
        return (
            np.array(state, dtype=np.float32),
            np.array(action, dtype=np.int64),
            np.array(reward, dtype=np.float32),
            np.array(next_state, dtype=np.float32),
            np.array(done, dtype=np.float32)
        )

    def __len__(self):
        return len(self.buffer)


class DQNAgent:
    """
    DQN Agent capable of training, evaluating, saving, and loading Q-networks.
    Includes CPU-friendly execution and transparent Q-value inspection.
    """
    def __init__(
        self,
        state_dim=5,
        action_dim=4,
        learning_rate=1e-3,
        gamma=0.95,
        epsilon_start=1.0,
        epsilon_end=0.02,
        epsilon_decay=0.995,
        buffer_size=10000,
        batch_size=64,
        target_update_freq=10,
        seed=42
    ):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.gamma = gamma
        self.epsilon = epsilon_start
        self.epsilon_min = epsilon_end
        self.epsilon_decay = epsilon_decay
        self.batch_size = batch_size
        self.target_update_freq = target_update_freq
        self.steps_done = 0

        # Set random seeds
        random.seed(seed)
        np.random.seed(seed)

        self.memory = ReplayBuffer(capacity=buffer_size)

        if TORCH_AVAILABLE:
            torch.manual_seed(seed)
            self.device = torch.device("cpu")  # Designed to run smoothly on any student laptop
            self.policy_net = QNetwork(state_dim, action_dim).to(self.device)
            self.target_net = QNetwork(state_dim, action_dim).to(self.device)
            self.target_net.load_state_dict(self.policy_net.state_dict())
            self.target_net.eval()
            self.optimizer = optim.Adam(self.policy_net.parameters(), lr=learning_rate)
            self.criterion = nn.SmoothL1Loss()  # Huber loss for gradient clipping robustness
        else:
            # Fallback lightweight weights in case torch is not yet installed
            self.device = None
            self.weights = {
                "w1": np.random.randn(state_dim, 32) * 0.1,
                "b1": np.zeros(32),
                "w2": np.random.randn(32, action_dim) * 0.1,
                "b2": np.zeros(action_dim)
            }

    def select_action(self, state, evaluate=False):
        """
        Epsilon-greedy action selection.
        If evaluate=True, takes greedy argmax action without random exploration.
        """
        if not evaluate and random.random() < self.epsilon:
            return random.randrange(self.action_dim)

        q_values = self.get_q_values(state)
        return int(np.argmax(q_values))

    def get_q_values(self, state):
        """Inspect predicted Q-values for each action given current state."""
        if TORCH_AVAILABLE:
            with torch.no_grad():
                state_t = torch.FloatTensor(state).unsqueeze(0).to(self.device)
                q_vals = self.policy_net(state_t).cpu().numpy()[0]
                return q_vals
        else:
            h = np.maximum(0, np.dot(state, self.weights["w1"]) + self.weights["b1"])
            q = np.dot(h, self.weights["w2"]) + self.weights["b2"]
            return q

    def train_step(self):
        """Sample mini-batch from replay buffer and perform single gradient descent update."""
        if not TORCH_AVAILABLE or len(self.memory) < self.batch_size:
            return 0.0

        states, actions, rewards, next_states, dones = self.memory.sample(self.batch_size)

        states_t = torch.FloatTensor(states).to(self.device)
        actions_t = torch.LongTensor(actions).unsqueeze(1).to(self.device)
        rewards_t = torch.FloatTensor(rewards).unsqueeze(1).to(self.device)
        next_states_t = torch.FloatTensor(next_states).to(self.device)
        dones_t = torch.FloatTensor(dones).unsqueeze(1).to(self.device)

        # Current Q-values: Q(s, a)
        current_q = self.policy_net(states_t).gather(1, actions_t)

        # Target Q-values: r + gamma * max_a' Q_target(s', a') * (1 - done)
        with torch.no_grad():
            max_next_q = self.target_net(next_states_t).max(1)[0].unsqueeze(1)
            target_q = rewards_t + (1 - dones_t) * self.gamma * max_next_q

        loss = self.criterion(current_q, target_q)

        self.optimizer.zero_grad()
        loss.backward()
        # Gradient clipping to prevent exploding gradients
        torch.nn.utils.clip_grad_norm_(self.policy_net.parameters(), max_norm=5.0)
        self.optimizer.step()

        self.steps_done += 1
        if self.steps_done % self.target_update_freq == 0:
            self.target_net.load_state_dict(self.policy_net.state_dict())

        return float(loss.item())

    def decay_epsilon(self):
        """Gradually reduce exploration rate epsilon after each training episode."""
        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)

    def save(self, filepath):
        """Save trained weights to disk."""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        if TORCH_AVAILABLE:
            torch.save({
                'policy_net': self.policy_net.state_dict(),
                'epsilon': self.epsilon,
                'steps_done': self.steps_done
            }, filepath)
        else:
            np.savez(filepath, **self.weights)

    def load(self, filepath):
        """Load trained weights from disk."""
        if not os.path.exists(filepath):
            return False

        if TORCH_AVAILABLE:
            checkpoint = torch.load(filepath, map_location=self.device)
            if isinstance(checkpoint, dict) and 'policy_net' in checkpoint:
                self.policy_net.load_state_dict(checkpoint['policy_net'])
                self.target_net.load_state_dict(checkpoint['policy_net'])
                self.epsilon = checkpoint.get('epsilon', self.epsilon_min)
            else:
                self.policy_net.load_state_dict(checkpoint)
                self.target_net.load_state_dict(checkpoint)
            self.policy_net.eval()
            self.target_net.eval()
            return True
        else:
            data = np.load(filepath)
            self.weights = {k: data[k] for k in data.files}
            return True
