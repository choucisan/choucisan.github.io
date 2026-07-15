---
title: "Self in Space: Towards Self-Awareness and Spatial Cognition in Aerial Understanding"
description: "We introduce SIS-Bench to evaluate self-awareness and spatial cognition across perception, memory, and reasoning in aerial video understanding, together with SIS-Motion, a motion-aware representation that improves embodied perception, memory, and downstream UAV decision-making."
pubDate: 2026-07-10
venue: "ACM MM 2026"
authors:
  - "Zhishan Zou"

tags: ["Video Understanding", "Benchmark", "Aerial Intelligence", "Spatial Intelligence", "Self-Awareness", "Embodied Intelligence", "MLLM", "Multimedia", "CCF-A", "ACM MM", "Optical Flow"]
image: /paper-sites/sis-motion/static/img/poster.jpeg
paperSite: "sis-motion"
---

Autonomous UAV systems increasingly rely on multimodal large language models to operate in complex real-world environments. These embodied scenarios require an agent to understand the surrounding space while maintaining a coherent representation of itself.

We introduce **SIS-Bench**, a benchmark for evaluating embodied spatial intelligence in UAV scenarios through a unified self-in-space formulation. The benchmark organizes evaluation along the complementary dimensions of **space** and **self**, with a three-level hierarchy covering perception, memory, and reasoning. It contains **4,856 question-answer pairs across 13 tasks**, derived from **1,646 real-world UAV videos** through a task-conditioned construction pipeline with expert verification.

Our evaluations reveal a clear imbalance between spatial cognition and self-awareness, together with progressive performance degradation across cognitive levels. We further explore a motion-aware representation based on optical flow and visual feature fusion. Modeling agent motion consistently improves perception and memory performance in both spatial cognition and self-awareness, and transfers to downstream UAV decision-making tasks.
