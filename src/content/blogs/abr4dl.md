---
title: "LLMs Can't Jump and Abductive Reasoning"
description: "A reflection on abductive reasoning, subjective experience, and why language models can extend existing explanations yet still struggle to make genuine scientific conceptual leaps."
pubDate: 2026-07-29
category: "Research Notes"
tags: ["Abductive Reasoning", "LLM", "AI for Science", "Scientific Discovery", "Philosophy of AI"]
image: /assets/blogs/abr4dl/ai-discovery.jpeg
---

A few days ago, I came across Tom Zahavy's [**LLMs Can't Jump**](https://philsci-archive.pitt.edu/28024/), and it immediately brought me back to a set of notes I made last summer.

I had just finished a biography of Einstein and become deeply interested in a form of reasoning that receives much less attention than deduction or induction: **abductive reasoning**. I began tracing how abduction had been used in deep learning and eventually organized the material into an introduction titled *Abductive Reasoning in Deep Learning*.

Looking back a year later, the question that interests me is no longer simply how to add an abductive module to a model. It is more fundamental:

> If language models can write papers, prove theorems, and use tools, why might they still fail to make a genuine scientific discovery?

To me, "can't jump" does not mean that a model cannot move forward at all. Modern LLMs are remarkably good at moving through an existing space of language and concepts. What remains difficult is changing the representation of the problem itself: proposing an explanatory framework that was not previously obvious and may, at first, even appear wrong.

That kind of jump is precisely what abductive reasoning tries to describe.

## What Is Abductive Reasoning?

Deduction, induction, and abduction begin with different information and pursue different goals.

| Form of reasoning | Given | Goal |
| --- | --- | --- |
| Deduction | A rule and a case | A necessary consequence |
| Induction | Repeated cases and outcomes | A general rule |
| Abduction | An observation and background knowledge | A plausible explanation |

The classical form of abduction is simple. We observe a surprising fact, `O`. If a hypothesis, `H`, were true, then `O` would no longer be surprising. We therefore treat `H` as an explanation worth testing.

The important words are not *true* or *proven*, but **plausible** and **worth testing**. Abduction does not guarantee truth. The same observation can support many hypotheses, so a good abductive process must continue through prediction, experiment, and attempted falsification.

![A single falling apple can lead to explanations at very different levels.](/assets/blogs/abr4dl/history.jpeg)

## 1. Past, Present, and Future: Must Reasoning Be Sequential?

> The distinction between the past, the present and the future is only a stubbornly persistent illusion.
>
> - Albert Einstein, letter to the family of Michele Besso, 1955

This sentence is often asked to carry far more philosophical weight than its physical context can support. For me, it is better treated as an opening for thought than as evidence that time does not exist: **Can later evidence change what an earlier event means?**

We often describe intelligence as a forward-moving chain. The past supplies conditions, the present performs a computation, and the future becomes its result. Conditional probability is frequently narrated this way. Next-token prediction follows the same apparent direction: given a prefix, predict the most likely continuation, append it to the context, and move forward again.

Human understanding does not always behave like that.

A later piece of evidence can completely change our interpretation of an earlier event. A new experience can reorganize an old memory. Memory is not an untouched recording retrieved from storage; it is reconstructed under our present state, beliefs, and purposes. The philosophy of history makes a related point: every age writes a history that reveals not only the past, but also the questions and values of the age doing the writing.

This is what I take from the phrase **"Memory evolves with the future in mind."**

Abduction is therefore not simply inference played backward. When a new observation arrives, it asks what account of the past can make the present coherent. Future evidence participates in the construction of past meaning; the past is no longer an immutable prefix.

Here lies one gap between next-token prediction and understanding. Prediction extends a sequence. Understanding sometimes has to return to the sequence and revise what it was about.

## 2. The Brain as an Abduction Machine

> The brain is an **abduction machine**, continuously trying to prove abductively that the observables in its environment **constitute a coherent situation**.
>
> - [Jerry R. Hobbs, ACL 2013 Lifetime Achievement Award](https://aclanthology.org/J13-4001/)

This statement points directly to explanation.

Human beings do not passively receive a fully interpreted world. We continually organize fragments of sensation, memory, and background knowledge into situations that make sense. We hear an impact, notice that a cup is missing from the table, and find broken pieces on the floor. We infer that the cup fell. The inference could be wrong, but it turns otherwise separate observations into a single event.

Scientific research works in much the same way. Scientists are rarely handed a perfectly specified problem with a known answer. They face observations that do not yet form a theory.

### Galileo: From Falling Bodies to a Law of Motion

Galileo's studies of falling bodies transformed a vague question - why do objects fall? - into a measurable one: how does velocity change over time? Through idealization, experiment, and mathematical description, free fall could be modeled, in the absence of air resistance, as approximately uniformly accelerated motion.

![Galileo: from observations of falling bodies to uniformly accelerated motion.](/assets/blogs/abr4dl/galileo.jpeg)

The important step was not merely arriving at `v = at`. It was proposing a new level of explanation in which natural motion could be described through mathematical relations among time, distance, and velocity.

### Newton: From an Apple on Earth to Universal Gravitation

Newton pushed the question further. Could the same influence that pulls an apple toward Earth also govern the Moon and the planets? The apple story may contain an element of legend, but it captures a genuine conceptual leap: terrestrial falling and celestial motion were placed inside one explanatory framework.

![Newton: from a falling apple to universal gravitation.](/assets/blogs/abr4dl/newton.jpeg)

The power of the hypothesis was not that it restated what had already been observed. It made previously separate phenomena coherent and produced new predictions that could be tested.

### Einstein: From Equivalent Masses to the Geometry of Spacetime

Einstein took the remarkable equivalence of inertial and gravitational mass seriously and elevated it into the equivalence principle. Gravity could then be reconceived, not merely as an ordinary force acting between bodies, but as an expression of spacetime geometry.

![Einstein: from the equivalence principle to general relativity.](/assets/blogs/abr4dl/einstein.jpeg)

General relativity was not obtained by mechanically extending Newton's second law. It required a new account of the relationship among force, motion, reference frames, and geometry. A discovery of this kind does not simply add the next symbol to an old equation; it changes which concepts belong in the equation at all.

The same broad phenomenon - falling - received explanations at very different levels across scientific history. Abduction preserves the openness required to move from observation to hypothesis and then return from hypothesis to the world.

## 3. Why Abduction Is a High-Entropy Process

There is no unique explanatory path from one observation to the next. Theory, common sense, analogy, imagination, and even mistaken intuition can all generate candidate hypotheses. In this sense, the **hypothesis-generation stage of abduction is high entropy**: it must preserve alternatives rather than compress uncertainty into a single answer too early.

Science, however, cannot remain at high entropy. Candidate hypotheses must be checked for consistency, used to derive predictions, tested experimentally, and exposed to counterevidence. A complete abductive process therefore contains two opposing movements:

1. **Divergence:** generate multiple explanations for an observation.
2. **Convergence:** use new evidence to eliminate explanations and update the current world model.

Language models can easily create the impression that explanation is already complete. They fluently use constructions such as "not X, but Y," "essentially," and "ultimately," compressing an ambiguous problem into a confident narrative. Low entropy in language is not the same as certainty in knowledge, and neither is the same as experimental support.

The problem should not be reduced to next-token prediction alone. A predictive objective can learn rich regularities and generate unexpected combinations. The deeper issue is what happens after a model proposes a hypothesis. Does it actively seek evidence that could make the hypothesis fail? Can it design an experiment that distinguishes competing explanations? Will feedback from the world produce a persistent revision of its memory and concepts?

Without these steps, a hypothesis can remain only a plausible paragraph.

## 4. Subjective Experience: Perception as Hypothesis

> I experienced the "subjective experience" of pink elephants floating before me. Those pink elephants are a hypothesis about the external world - a hypothesis that accounts for my present internal state. The peculiarity of subjective experience lies not in some mysterious substance, but in its hypothetical nature.
>
> - [Geoffrey Hinton, 2024 Nobel Prize lecture](https://www.nobelprize.org/prizes/physics/2024/hinton/lecture/)

Hinton describes subjective experience as a hypothesis about the external world. We do not first receive an absolute, interpretation-free reality and only then reason about it. What we "see" already contains the brain's attempt to explain sensory signals.

Pink elephants need not exist in the external world, yet they can still describe a real internal state. Perception is therefore not a transparent window onto facts. It is an abductive interpretation constrained by sensory input.

This helps explain why scientific discovery cannot take place entirely inside language. A model circulating among texts can recombine explanations that people have already written, but it does not necessarily have a stable perception-action loop through which it can produce genuinely new observations. A vision-language model may begin to "see something," but a camera stream alone does not amount to subjective experience or scientific discovery. The central questions are whether a system can:

- distinguish an observation from its interpretation;
- recognize that an existing explanation does not cover an anomaly;
- generate genuinely competing hypotheses;
- act to obtain new evidence;
- revise its memory and world model when evidence conflicts with expectation.

Grounding is not merely attaching another sensor to a language model. It means placing the model's hypotheses in contact with an external world that is free to prove them wrong.

## 5. Why Can't an LLM "Jump"?

![Curiosity, imagination, and creativity: from falling apples to general relativity.](/assets/blogs/abr4dl/curiosity.jpeg)

LLMs can certainly generate new sentences, and they can combine ideas in ways that never appeared verbatim in their training data. "Can't jump" should therefore not be read as a claim that models can only copy.

A more precise interpretation may be that current LLMs are strongly optimized for **moving within an existing representation**, but not equally optimized for **reconstructing the representation itself**. A model can generate ten explanations without having to bear the consequences when any of them fails. It can simulate doubt without maintaining a world model that remains disturbed by an unresolved anomaly.

A scientific jump involves at least four operations:

1. Notice an anomaly that the current theory cannot explain easily.
2. Propose a hypothesis that changes the structure of the problem.
3. Derive a prediction that distinguishes the new explanation from its competitors.
4. Allow reality to decide which explanation survives.

Language models have already become powerful assistants for the second operation and can contribute to the third. The first requires long-term, active contact with the world. The fourth requires experiments, tools, memory, and a reliable feedback loop. Without those two ends, a model remains closer to an extraordinarily knowledgeable generator of explanations than to an independent scientific discoverer.

## 6. Abductive Reasoning in Deep Learning

Abduction is not only a philosophical topic. It can become an explicit computational stage in a deep learning system. Instead of predicting a label alone, a model searches for latent hypotheses that jointly explain its data, constraints, and background knowledge.

One representative formulation is Zhou's [abductive learning framework](https://doi.org/10.1007/s11432-018-9801-4), which connects machine learning with logical reasoning: a learning model handles perception from data, while logical abduction revises candidate interpretations under domain knowledge. The two components improve through their disagreements rather than operating as isolated stages.

Several research directions naturally fit this view:

- **Weak supervision and label revision:** infer latent labels that best reconcile noisy observations with domain rules.
- **Neuro-symbolic learning:** use neural models for perception and symbolic systems for generating and testing explanations, allowing constraints and errors to update both.
- **Anomaly and fault diagnosis:** infer possible causes from observed symptoms and choose additional tests that distinguish them.
- **Causal and scientific discovery:** propose candidate mechanisms from correlated observations, then evaluate them through interventions or experiments.
- **Vision and embodied intelligence:** infer scene states, intentions, and unobserved events from incomplete views, then act to collect evidence.
- **Agent planning:** when an action fails, infer why it failed and revise the task model rather than merely sampling another action.

These directions share a common shift. Learning is no longer only a mapping from `x -> y`; it is also a search for a hypothesis, `H`, under which observations, prior knowledge, and later evidence form the most coherent whole.

Coherence, however, is still not truth. A powerful abductive system may produce a sophisticated hallucination. Abduction must therefore be tied to counterfactual prediction, active experimentation, causal intervention, and calibrated uncertainty. Otherwise, we have merely renamed a language model's ability to rationalize.

## From Answering to Discovering

![Could an AI rediscover general relativity from a falling apple?](/assets/blogs/abr4dl/ai-discovery.jpeg)

Galileo, Newton, and Einstein did not reach general relativity by predicting one more word after another. Between them were repeated changes in observation, mathematical language, and explanatory framework.

This is what makes abductive reasoning so compelling to me. It allows an unproven, and possibly wrong, explanation to appear before demanding that the explanation return to the world for judgment. Much of human civilization has grown out of this disciplined uncertainty.

A future AI capable of participating in scientific discovery may therefore need more than a longer context window, a larger parameter count, or more fluent chain-of-thought. It will need a loop:

> **Observe an anomaly, generate hypotheses, derive predictions, run experiments, accept refutation, and rewrite memory.**

Next-token prediction can be an important component of that loop, but it is not the loop itself.

The real jump may begin when a model stops asking only, "What is the most likely next statement?" and starts asking: **What if the way we have been explaining the world is itself wrong?**

## References

1. Zahavy, Tom. ["LLMs Can't Jump."](https://philsci-archive.pitt.edu/28024/) PhilSci-Archive, 2026.
2. Douven, Igor. ["Abduction."](https://plato.stanford.edu/entries/abduction/) *The Stanford Encyclopedia of Philosophy*, 2021.
3. Harman, Gilbert H. ["The Inference to the Best Explanation."](https://doi.org/10.2307/2183532) *The Philosophical Review*, 74(1), 1965, pp. 88-95.
4. Hobbs, Jerry R. ["ACL Lifetime Achievement Award: Influences and Inferences."](https://aclanthology.org/J13-4001/) *Computational Linguistics*, 39(4), 2013, pp. 781-798.
5. Zhou, Zhi-Hua. ["Abductive Learning: Towards Bridging Machine Learning and Logical Reasoning."](https://doi.org/10.1007/s11432-018-9801-4) *Science China Information Sciences*, 62, 2019.
6. Einstein, Albert. Letter to the family of Michele Besso, 21 March 1955. See the [Digital Einstein Papers](https://einsteinpapers.press.princeton.edu/) archive.
7. Hinton, Geoffrey. ["Boltzmann Machines."](https://www.nobelprize.org/prizes/physics/2024/hinton/lecture/) Nobel Lecture, 8 December 2024.
