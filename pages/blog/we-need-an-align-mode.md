---
title: "We Need an Align Mode"
description: "Some thoughts on understanding each other before we start building"
date: "2026-07-13T00:00:00.000Z"
snippet: "I've spent a lot of time thinking about how agents can better verify their own work. Lately, I have started to wonder whether verification is already too late. Before plan mode, perhaps we need an align mode."
tags: post
layout: layouts/post.njk
---

I've spent a lot of time thinking about how agents can verify their own work: run the tests, inspect the interface, and fix what they find.

I still believe in closing that loop, but verification may already be too late. The uncomfortable failures are polished implementations of the wrong idea—typed, tested, and functional, but based on an assumption I never noticed the agent make.

Functionality can hide misunderstanding.

## The Limit of Verification

Tests only prove what we knew to check. They can prove that a button opens a panel, but not that a panel was the right interaction.

Agents also make code cheaper without making deep review equally cheap. Generating more and asking a human to verify everything eventually gives the advantage back.

I began thinking this was a verification problem. I now think much of it is an alignment problem.

## Before the Plan

Plan modes usually describe how an interpretation will be built rather than testing the interpretation itself. A precise plan can still lead precisely to the wrong destination.

What I want first is an **Align Mode**: a conversation that continues while glaring assumptions remain.

It could compare interpretations, turn fuzzy language into concrete examples, and inspect the existing system. Its output would be confidence that we mean the same thing, not another task list.

This is not a giant specification or an attempt to remove every decision from the agent. Important product assumptions just should not be mistaken for implementation details.

## Understanding Creates Ownership

Completing a task means producing code that works. Owning the result means matching the vision behind it, which is difficult when we let the agent silently fill every gap.

I don't think this requires a smarter model. Today's models can already ask useful questions and explain systems back to us when pushed in that direction.

Align Mode might only be a default skill with some guidance in `AGENTS.md`: permission for the model to stay with the problem instead of racing toward implementation.

We've taught agents how to act without us. Perhaps the next step is teaching them when not to start.
