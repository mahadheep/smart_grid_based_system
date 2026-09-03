"""
Training Script for Smart Grid DQN Agent
Course: MLA0303 - Reinforcement Learning

Usage:
    python train.py --episodes 150 --save_path models/trained_model.pt
"""

import os
import argparse
import numpy as np
from environment import SmartGridEnv
from dqn_agent import DQNAgent, TORCH_AVAILABLE


def train(episodes=150, save_path="models/trained_model.pt", seed=42):
    print("=" * 65)
    print(" Smart Grid Dynamic Load Control - Deep Q-Network Training")
    print(" Course: MLA0303 - Reinforcement Learning")
    print("=" * 65)

    if not TORCH_AVAILABLE:
        print("[WARNING] PyTorch not detected. Training will run in fallback mode.")
    else:
        print("[INFO] PyTorch detected. Training Deep Q-Network on CPU...")

    env = SmartGridEnv(seed=seed)
    agent = DQNAgent(state_dim=env.state_dim, action_dim=env.action_dim, seed=seed)

    rewards_history = []
    losses_history = []
    overload_cleared_count = 0
    total_overloads = 0

    print(f"\n[INFO] Starting training across {episodes} episodes...")
    print(f"{'Episode':<10}{'Total Reward':<16}{'Avg (Last 10)':<16}{'Epsilon':<12}{'Loss':<10}")
    print("-" * 65)

    for ep in range(1, episodes + 1):
        state = env.reset()
        episode_reward = 0.0
        episode_losses = []

        done = False
        while not done:
            action = agent.select_action(state, evaluate=False)
            next_state, reward, done, info = env.step(action)

            # Store transition in replay buffer
            agent.memory.push(state, action, reward, next_state, float(done))

            # Train network
            loss = agent.train_step()
            if loss > 0:
                episode_losses.append(loss)

            if info.get("initial_overloaded"):
                total_overloads += 1
                if not info.get("final_overloaded"):
                    overload_cleared_count += 1

            state = next_state
            episode_reward += reward

        agent.decay_epsilon()
        rewards_history.append(episode_reward)
        avg_loss = float(np.mean(episode_losses)) if episode_losses else 0.0
        losses_history.append(avg_loss)

        if ep % 10 == 0 or ep == 1 or ep == episodes:
            avg_10 = float(np.mean(rewards_history[-10:]))
            print(f"{ep:<10}{episode_reward:<16.2f}{avg_10:<16.2f}{agent.epsilon:<12.3f}{avg_loss:<10.4f}")

    print("-" * 65)
    clearance_rate = (overload_cleared_count / max(1, total_overloads)) * 100.0
    print(f"[SUCCESS] Training complete!")
    print(f" - Final 10-Episode Average Reward: {np.mean(rewards_history[-10:]):.2f}")
    print(f" - Overload Mitigation Success Rate: {clearance_rate:.1f}%")

    agent.save(save_path)
    print(f"[SAVED] Trained model checkpoint saved to: {save_path}\n")

    return rewards_history, losses_history


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train DQN for Smart Grid Load Control")
    parser.add_argument("--episodes", type=int, default=150, help="Number of training episodes")
    parser.add_argument("--save_path", type=str, default="models/trained_model.pt", help="Path to save model")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    args = parser.parse_args()

    train(episodes=args.episodes, save_path=args.save_path, seed=args.seed)
