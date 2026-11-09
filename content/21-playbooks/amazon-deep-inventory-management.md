---
id: amazon-deep-inventory-management
book: 21
order: "21.50"
title: "Deep Inventory Management: reinforcement learning for inventory buying by Amazon researchers"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [reinforcement-learning, inventory-management, differentiable-simulation, retail, public-record]
visuals: []
type: playbook
account: public-record
industry: "Retail supply chain (online retail)"
use_case: "Deciding how many units of each product to order from vendors in a periodic review inventory system with stochastic vendor lead times, lost sales, correlated demand and price matching"
outcome: "In a randomized real-world deployment against the production Newsvendor policy, inventory level changed by -12 ± 6 (% change in units) and revenue was statistically indistinguishable from 0; in backtest, a 23% improvement over Newsvendor"
measured_how: "Treatment and control split of 10K products over 26 weeks (dates not stated), plus a backtest on the last 19 weeks of a weekly dataset of 80,000 sampled products, scored by discounted cumulative reward normalized by an oracle (Madeka et al., Amazon, arXiv, v3 November 2022)"
prerequisites: [rl-primer, planning-mcts]
replications: []
---
> [!tldr]
> Amazon researchers trained a neural policy that sets order quantities, using historical data turned into a differentiable simulator, a method they call DirectBackprop. In a 26-week randomized deployment on 10K products against the production Newsvendor policy, the treatment group was able "to significantly reduce inventory (by ∼ 12%)", and revenue was "statistically indistinguishable from 0".

> [!note] From the public record
> Built from the paper by Amazon researchers, "Deep Inventory Management" (November 2022), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## The problem

A periodic review inventory system decides how much stock to hold for each product, balancing "the cost of meeting customer demand with the cost of holding too much inventory". Demand is random, with "seasonalities, temporal correlations, trends and spikes". Unmet demand is lost to competitors, so historical sales hide true demand. Orders arrive after a random vendor lead time, and price matching ties prices to competitors' changes. These make the problem "difficult or impossible to solve using traditional dynamic program (DP) methods".

The deployment's control group, on a Newsvendor policy, was "the current production system used by one of the largest Supply Chains in the world". The text does not name the retailer; the authors are listed with Amazon affiliations.

## Why this approach

The paper cites literature showing that base-stock policies are suboptimal with stochastic lead times and lost sales, so the policy outputs the order quantity directly, "rather than a target inventory position".

Instead of assuming parametric forms and simulating the future, the team modifies historical data so that each historical trajectory serves as "one path from a simulation". This works because demand, prices, costs and lead times are treated as external processes that orders do not influence. As the state evolution is "both known, and differentiable", the team backpropagates the reward through the simulator, a model-based approach (see [Model-based RL and planning](#planning-mcts)). Model-free methods typically use the policy-gradient theorem (see [Policy gradients](#policy-gradient-methods)); the team sought an estimate that "has lower variance and hence may speed up the optimization".

## The approach

1. **Correct censored demand.** Sales show demand only up to the stock on hand. The team adds demand estimated from web page glance views while an item was out of stock, with a conversion rate, to get "availability corrected demand".
2. **Turn history into a simulator.** Each episode is one product's past data, and a single policy serves all products.
3. **Define state and action.** The state holds demand and glance view signals, distances to public holidays, product features, price, cost, inventory, past actions and in-flight orders. The action, an order quantity, is scaled by trailing historical demand, as products differ in demand by orders of magnitude. For the reported results, agents could not discard inventory.
4. **Set the reward.** The reward measures cash flows: sales revenue minus purchasing cost. The reported results use a terminal value of 0; a footnote reports "no substantial performance difference" with other termination options.
5. **Train with DirectBackprop.** The policy is rolled out over a mini-batch of products in the differentiable simulator, and the parameters follow the gradient of the summed discounted reward (see [Automatic differentiation](#automatic-differentiation)).

## The stack

As of November 2022: the OpenAI Gym interface for the simulator, RLlib for experiments with the RL agents, PyTorch for the differentiable simulator, and Ray (its Plasma object store and remote actors) for shared data and parallel backtests. All algorithms were trained on "an EC2 p3.16xlarge instance". The DirectBackprop policy is a Wavenet encoder with an MLP decoder. The Myopic baseline uses a quantile forecaster (see [Time series and forecasting](#time-series-forecasting)). The paper does not describe the production setup.

## Results, and how they were measured

**Backtest.** The data is "a weekly dataset of 80,000 sampled products from a single marketplace", April 2017 to August 2019: 104 weeks for training, the last 19 weeks out of sample. The metric is discounted cumulative reward, normalized so that an Oracle policy that knows the future scores 100.0.

- Starting from inventory left by a Newsvendor policy, the scores were DirectBackprop 79.27, ARS 78.06, 2.5*PHN 74.25, A3C 71.20, SAC 70.53, Newsvendor 65.48 and Myopic 56.48.
- In the paper's words, "the best RL policy (DirectBackprop) represents a 23% improvement over the baseline policy (Newsvendor)". The paper does not show the calculation.
- Starting from historical on-hand inventory, ARS scored 76.09 and DirectBackprop 74.12.
- In the plots for the Newsvendor start, DirectBackprop "outperforms all non-oracle policies despite ordering less".

**Real-world deployment.** "The deployment was for 10K products over a period of 26 weeks." Products were randomized into a DirectBackprop treatment group and a Newsvendor control group (see [Online controlled experiments](#online-experiments)). The treatment group reduced inventory "without losing any excess revenue (statistically insignificant difference from 0%)". The results table gives the inventory level change as "-12 ± 6" (% change in units).

**Not measured:** the paper does not state the deployment dates, group sizes, how products were chosen, what the "± 6" denotes or which test was used. It reports no deployment figures for cost, profit or lost sales, and does not say whether the policy was rolled out further.

## What failed

- **Gaps in the simulator.** The authors warn that "certain aspects of the reality are not simulated". Lead times were sampled from predictive distributions, vendor fill rates were assumed to be 100%, and orders had no quantity or interval constraints. "However, all policies operate under these same conditions."
- **Relative gains at risk.** A footnote warns that "systematic deviations of the Gym from reality may render relative improvements moot", for example where real fill rates favor a policy that simply holds more buffer inventory.
- **Simplified scope.** Cross-product volume, unit and capital constraints are formulated in an appendix but left out of the main formulation. The formulation assumes linear costs, so "there is no bulk discounting in this formulation".

## What the team would do differently

The paper states no regrets. It says the risk from Gym deviations "can be mitigated by constantly calibrating the Gym against reality", and it names as future work "learning a model for the transition dynamics or the incorporation of cross-product constraints". Its conclusion from the deployment: "we believe RL is a promising line of research for inventory control in the real world".

The wiki's reading: the method rests on one stated assumption, that demand, prices, costs and lead times do not respond to the agent's orders. That sets it apart from most [offline RL](#imitation-offline-rl) problems, and it is also where simulation and reality can part. The backtest and the deployment use different metrics, so the 23% and the inventory result are not the same claim.

## Disclosure

None.

## Sources

- Dhruv Madeka (Amazon), Kari Torkkola (Amazon), Carson Eisenach (Amazon), Anna Luo (Pinterest, work done while at Amazon), Dean P. Foster (Amazon) and Sham M. Kakade (Amazon, Harvard University), [“Deep Inventory Management”](https://arxiv.org/abs/2210.03137), arXiv:2210.03137 (cs.LG, math.OC), v1 6 October 2022, v3 (used here) 28 November 2022.

## Related

- [About playbooks](#about-playbooks)
- [Reinforcement learning primer](#rl-primer)
- [Model-based RL, planning and Monte Carlo tree search](#planning-mcts)
- [Imitation learning and offline RL](#imitation-offline-rl)
- [Online controlled experiments for AI features](#online-experiments)
