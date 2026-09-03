"""
Smart Power Grid Environment for Reinforcement Learning
Course: MLA0303 - Reinforcement Learning
Project: Deep Reinforcement Learning for Dynamic Load Control in Smart Power Systems

This module simulates an electrical power distribution grid with:
- Dynamic electricity load demand
- Base conventional generation capacity
- Variable renewable energy penetration (Solar / Wind)
- Substation thermal / transformer capacity limits
- Overload detection and mitigation mechanisms
"""

import numpy as np


class SmartGridEnv:
    """
    Gym-like Environment for Smart Grid Dynamic Load Control.

    State Space (5 continuous features, normalized to [0, 1] or [-1, 1]):
        0: Normalized Load Demand (current_load / max_possible_load)
        1: Normalized Grid Capacity (grid_capacity / max_possible_load)
        2: Renewable Generation Percentage (0.0 to 1.0)
        3: Normalized Power Balance ((Total Generation - Load) / grid_capacity)
        4: Overload Indicator (1.0 if load > capacity, else 0.0)

    Action Space (Discrete 4 actions):
        0: No control (Do nothing, let baseline operation continue)
        1: Reduce load (Curtailed non-critical load by 15 MW)
        2: Increase generation / supply response (Dispatch spinning reserve / battery: +20 MW)
        3: Shift / curtail load (Demand response peak clipping: -30 MW load reduction)
    """

    ACTION_NAMES = [
        "No Control (Maintain)",
        "Reduce Load (Curtail 15 MW)",
        "Increase Generation (+20 MW Reserve)",
        "Shift/Curtail Load (Demand Response 30 MW)"
    ]

    def __init__(
        self,
        base_capacity=140.0,
        max_possible_load=250.0,
        renewable_pct=25.0,
        seed=42
    ):
        self.rng = np.random.RandomState(seed)
        self.max_possible_load = max_possible_load
        self.base_capacity = base_capacity
        self.grid_capacity = base_capacity
        self.renewable_pct = renewable_pct

        # Initial default state
        self.current_load = 120.0
        self.conventional_gen = 100.0
        self.renewable_gen = (self.renewable_pct / 100.0) * self.grid_capacity
        self.total_generation = self.conventional_gen + self.renewable_gen
        self.is_overloaded = False
        self.current_step = 0
        self.max_steps = 24  # 24-hour simulation window

        self.state_dim = 5
        self.action_dim = 4

    def reset(self, load=None, capacity=None, renewable_pct=None):
        """Reset the environment to start a new episode or custom scenario."""
        self.current_step = 0

        if capacity is not None:
            self.grid_capacity = float(capacity)
        else:
            self.grid_capacity = float(self.rng.uniform(110.0, 160.0))

        if renewable_pct is not None:
            self.renewable_pct = float(renewable_pct)
        else:
            self.renewable_pct = float(self.rng.uniform(10.0, 50.0))

        if load is not None:
            self.current_load = float(load)
        else:
            # 40% chance of an initial overload condition to encourage learning
            if self.rng.rand() < 0.45:
                self.current_load = float(self.rng.uniform(self.grid_capacity + 5.0, min(self.max_possible_load, self.grid_capacity + 50.0)))
            else:
                self.current_load = float(self.rng.uniform(60.0, self.grid_capacity - 5.0))

        # Update renewable & conventional generation
        self.renewable_gen = (self.renewable_pct / 100.0) * self.grid_capacity
        self.conventional_gen = min(self.grid_capacity - self.renewable_gen, self.current_load * 0.8)
        self.total_generation = self.conventional_gen + self.renewable_gen

        self.is_overloaded = self.current_load > self.grid_capacity

        return self._get_state()

    def _get_state(self):
        """Construct normalized 5-dimensional observation vector."""
        norm_load = np.clip(self.current_load / self.max_possible_load, 0.0, 1.0)
        norm_capacity = np.clip(self.grid_capacity / self.max_possible_load, 0.0, 1.0)
        renewable_ratio = np.clip(self.renewable_pct / 100.0, 0.0, 1.0)

        # Power balance = (Total Generation - Load)
        imbalance = self.total_generation - self.current_load
        norm_imbalance = np.clip(imbalance / self.grid_capacity, -1.0, 1.0)

        overload_flag = 1.0 if self.current_load > self.grid_capacity else 0.0

        return np.array(
            [norm_load, norm_capacity, renewable_ratio, norm_imbalance, overload_flag],
            dtype=np.float32
        )

    def step(self, action):
        """
        Execute one control action in the smart grid environment.

        Returns:
            next_state (np.ndarray): 5-dimensional observation
            reward (float): scalar feedback signal
            done (bool): whether episode terminated
            info (dict): diagnostic information
        """
        self.current_step += 1
        initial_load = self.current_load
        initial_overloaded = initial_load > self.grid_capacity

        load_curtailment = 0.0
        reserve_generation_boost = 0.0

        # Apply action dynamics
        if action == 0:
            # Action 0: No control
            load_curtailment = 0.0
            reserve_generation_boost = 0.0
        elif action == 1:
            # Action 1: Reduce load (emergency load curtailment)
            load_curtailment = 15.0
        elif action == 2:
            # Action 2: Increase generation / fast-spinning reserve response
            reserve_generation_boost = 20.0
        elif action == 3:
            # Action 3: Shift / curtail load (aggressive demand-side response)
            load_curtailment = 30.0
        else:
            raise ValueError(f"Invalid action: {action}")

        # Update environment dynamics
        self.current_load = max(30.0, self.current_load - load_curtailment)

        # Natural dynamic load fluctuation for next step (+- 5 MW noise)
        load_noise = float(self.rng.normal(0, 2.5))
        self.current_load = np.clip(self.current_load + load_noise, 30.0, self.max_possible_load)

        # Update generation with reserve response
        self.renewable_gen = (self.renewable_pct / 100.0) * self.grid_capacity
        self.conventional_gen = min(
            self.grid_capacity - self.renewable_gen,
            self.conventional_gen + reserve_generation_boost
        )
        self.total_generation = min(self.grid_capacity, self.conventional_gen + self.renewable_gen)

        final_overloaded = self.current_load > self.grid_capacity
        self.is_overloaded = final_overloaded

        power_imbalance = self.total_generation - self.current_load

        # --- REWARD CALCULATION ---
        # 1. Base stability reward: +10 if grid is balanced & not overloaded
        # 2. Positive reward for successfully clearing an overload: +8
        # 3. Severe penalty for remaining overloaded: -18
        # 4. Imbalance penalty: proportional to power discrepancy
        # 5. Operational cost: minor penalty for shedding load unless strictly necessary
        reward = 0.0

        if not final_overloaded:
            # Grid is safe and operating within capacity
            reward += 10.0

            if initial_overloaded:
                # Successfully alleviated overload!
                reward += 8.0

            # Reward tight power balance
            imbalance_penalty = 2.0 * abs(power_imbalance) / self.grid_capacity
            reward -= imbalance_penalty
        else:
            # Grid is overloaded! Threatens blackout / transformer heating
            overload_magnitude = self.current_load - self.grid_capacity
            reward -= 15.0 + 0.3 * overload_magnitude

        # Penalize unnecessary load curtailment (user disutility)
        if action in [1, 3] and not initial_overloaded:
            reward -= 5.0  # Penalize unnecessary shedding of consumer load

        if action == 0 and initial_overloaded:
            reward -= 8.0  # Extra penalty for doing nothing during overload

        done = self.current_step >= self.max_steps

        info = {
            "initial_load": initial_load,
            "final_load": self.current_load,
            "initial_overloaded": initial_overloaded,
            "final_overloaded": final_overloaded,
            "power_imbalance": power_imbalance,
            "grid_capacity": self.grid_capacity,
            "renewable_pct": self.renewable_pct,
            "total_generation": self.total_generation,
            "action_taken": self.ACTION_NAMES[action],
            "reward_components": {
                "base_stability": 10.0 if not final_overloaded else 0.0,
                "overload_cleared_bonus": 8.0 if (initial_overloaded and not final_overloaded) else 0.0,
                "overload_penalty": -15.0 if final_overloaded else 0.0,
                "unnecessary_action_penalty": -5.0 if (action in [1, 3] and not initial_overloaded) else 0.0
            }
        }

        return self._get_state(), float(reward), done, info
