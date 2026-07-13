---
title: "We Need an Align Mode"
description: "Before agents plan the work, they need to understand the vision"
date: "2026-07-13T00:00:00.000Z"
snippet: "Most AI planning modes are good at turning a request into a list of tasks. They are much worse at confirming that the agent and the person asking share the same vision. Before plan mode, we need an align mode."
tags: post
layout: layouts/post.njk
---

Most AI planning modes are good at turning a request into a list of tasks. They are much worse at confirming that the agent and the person asking share the same vision.

A plan might say:

- Update the layout
- Add the new endpoint
- Handle loading and error states
- Add tests

That can be a perfectly sensible plan while still describing the wrong thing. The hierarchy might be wrong. The endpoint might encode the wrong workflow. The tests might prove behaviour nobody wanted.

A task list is not a shared understanding.

Before plan mode, we need an align mode.

## Functional Is a Low Bar

AI makes it cheap to produce something polished and functional. That polish can create false confidence. Typed code, passing tests, and a clean interface make an implementation look resolved even when it has misunderstood the product.

Verification helps, but it only scales so far. If an agent produces five times as much code, deeply reviewing five times as much code is not an efficient answer. Existing checks are narrow too. They can tell us the application builds or that a known scenario passes. They cannot tell us whether the result matches the vision we had in our head.

The higher-leverage move happens before implementation: improve alignment so the first handoff is closer to right.

## Align Before You Plan

Align mode would not rush from a vague request to a confident checklist. It would keep asking questions wherever it finds a glaring assumption.

It would ask what "simple" means here. It would compare two possible interpretations instead of silently choosing one. It would turn fuzzy requirements into concrete examples and awkward edge cases. When necessary, it would inspect the existing system and build a shared model of its users, states, constraints, and conventions.

This does not need to become a giant specification or an approval gate for every small decision. The goal is not to eliminate every implementation detail the agent might decide for itself. The goal is to stop treating important product assumptions as implementation details.

Plan mode answers: **How will I build this?**

Align mode answers first: **Do we mean the same thing?**

Only then should the agent turn that understanding into an implementation plan.

## This Could Just Be a Skill

None of this necessarily requires a new model or a complicated product feature. The models are already capable of asking useful questions, exploring a codebase, finding contradictions, and explaining a system back to us. They usually just need to be pushed in that direction.

Align mode could be a default built-in skill, activated and adjusted by a small contract in `AGENTS.md`:

- Do not silently resolve important ambiguity
- Ask questions until the intended experience is clear
- Use concrete examples to confirm fuzzy requirements
- Inspect the existing system before proposing how it should change
- Plan only after alignment

The important part is making this the default behaviour, not another prompt the user has to remember. Agents are strongly encouraged to start building. They need equal pressure to understand first.

## From Handoff to Ownership

The usual agent workflow resembles handing a ticket to a contractor. The agent fills in the gaps, returns something that functions, and leaves the user to discover where its interpretation diverged from the intended result.

Better alignment changes what the agent owns. Once it has actively clarified the vision, it is no longer responsible only for completing the listed tasks. It is responsible for the thing it built matching that vision.

That distinction applies everywhere. A polished UI can have the wrong hierarchy. A technically correct feature can misunderstand the workflow. A small request can become an unnecessary new abstraction. A long revision loop can reveal assumptions that should have been questions.

The next improvement in coding agents is not simply more autonomy, verification, or raw intelligence. It may just be a better default workflow: align first, plan second, then build something that matches the vision instead of something that merely functions.
