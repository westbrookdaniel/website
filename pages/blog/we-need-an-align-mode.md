---
title: "We Need an Align Mode"
description: "Some thoughts on understanding each other before we start building"
date: "2026-07-13T00:00:00.000Z"
snippet: "I've spent a lot of time thinking about how agents can better verify their own work. Lately, I have started to wonder whether verification is already too late. Before plan mode, perhaps we need an align mode."
tags: post
layout: layouts/post.njk
---

I've spent a lot of time thinking about how agents can better verify their own work. If an agent can run the tests, open the browser, inspect the result, and fix what it finds, it can close more of the loop without handing everything back to me.

I still believe that. Lately, though, I have started to wonder whether verification is already too late.

The uncomfortable failures are rarely broken builds anymore. They are polished implementations of the wrong idea. The code is typed, the tests pass, and the interface works, but something about the result does not match what I imagined. Sometimes the hierarchy is wrong. Sometimes a workflow has been interpreted too literally. Sometimes a small request has quietly become a new abstraction.

It functions, which makes the misunderstanding harder to see.

## The Limit of Verification

My first instinct was to ask for more evidence. More tests, screenshots, browser checks, logs, and measurements. These all help, but they can only prove the things we know to check.

There is also an uncomfortable scaling problem. Agents make producing code cheaper, but they do not make deeply reviewing code equally cheap. If generation keeps accelerating, asking the human to verify everything in greater detail eventually gives the advantage back.

More importantly, no test can recover a vision that was never shared. A test can prove that a button opens a panel. It cannot prove that a panel was the right interaction in the first place.

I began thinking this was a verification problem. I now think much of it is an alignment problem.

## Before the Plan

Plan modes are useful because they make an agent pause before changing things. But most plans describe how an interpretation will be implemented. They do not spend much time testing the interpretation itself.

A neat sequence of tasks feels reassuring. It can still be a precise route to the wrong destination.

What I want before that is something closer to an **Align Mode**. Not a giant specification, and not an attempt to remove every small decision from the agent. Just a conversation that keeps going while there are glaring assumptions hiding inside the request.

It might ask what I mean by "simple." It might show me two interpretations that sound similar but produce very different products. It might use a concrete example because examples reveal disagreement faster than another paragraph of requirements. It might inspect the existing system so that we are talking about the same users, states, and constraints.

The output is not really a plan. It is the feeling that we mean the same thing.

## Ownership Starts With Understanding

There is a subtle difference between asking an agent to complete a task and asking it to take ownership of the result. A task can be completed when the code works. Ownership means caring whether the thing built matches the vision that motivated it.

That seems difficult to ask of an agent if it was never encouraged to understand the vision. We hand it a few sentences, let it silently fill the gaps, and then act surprised when its perfectly reasonable assumptions are not ours.

The interesting part is that I don't think this requires a dramatically smarter model. Today's models can already ask good questions, explore a codebase, compare interpretations, and explain a system back to us. When pushed in that direction, they are often quite good at it.

Align Mode might be nothing more than a default skill and a small adjustment in `AGENTS.md`. The important shift is giving the model permission to stay with the problem for longer, rather than rewarding it for reaching implementation as quickly as possible.

We've spent years making agents more capable of acting without us. Perhaps the next step is teaching them when not to start.
