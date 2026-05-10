---
title: "Closing the Loop"
description: "AI coding gets useful when it can move from intent to verified change"
date: "2026-05-10T00:00:00.000Z"
snippet: "AI coding gets interesting when it stops just writing the code. The useful loop is not writing code, but moving from intent to verified change so we can do more."
tags: post
layout: layouts/post.njk
---

I've been moving more agentic work from just writing code toward closing the loop.

The useful loop is not to write some code, or even to write all the code. If that was the case, a software engineer's job would already be gone. Agents need to move toward understanding the task, changing the system, running it, verifying it, surfacing the risk, and leaving the codebase better than it started.

Most AI coding tools are still strongest at generating code, explaining files, refactoring functions sometimes, and scaffolding tests. That's useful, but it still leaves the engineer holding the bag. True confidence and verification that allows agents to ship unsupervised is now the missing link.

The shape of the codebase is starting to matter more. Simple stacks are easier for agents to operate without intervention. Complex codebases are not impossible to use with agents, but every extra service, partial migration, conflicting approach, build step, and hidden dependency increases the amount of context needed to safely make a change. The cost has always been there, but now we pay it on every agent run instead of every hire.

Can’t make cloud agents work with your stack? Maybe the local setup is unclear or too complex. Maybe tests are missing. Maybe the browser QA path is not documented. That should be taken as feedback on your system and addressed or documented.

If agents can close more of the implementation loop, we can spend more energy on the work around it. What problems are we patching around? What security assumption only holds because humans are careful? What product flows are too hard to test?

Closing the loop is not just about making agents better. It is about making the whole system easier to understand, verify, and safely change.
