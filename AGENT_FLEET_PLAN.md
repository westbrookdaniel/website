# Agent Fleet Plan: Autonomous Website Design Studio

A design for a fleet of AI agents that runs a website design business end-to-end —
customer engagement, strategy, building, and maintenance — optimised for token
efficiency so the business is profitable per-project, not just impressive.

## Guiding principles

1. **Deterministic first, LLM second.** Every step that can be a script, webhook,
   cron job, or template is not an LLM call. Agents sit only at judgment points:
   scoping, design decisions, writing copy, diagnosing failures. This is the single
   biggest token lever — most "agent work" in a web agency is actually plumbing.
2. **Template maximalism.** Every client site starts from one starter kit (this
   repo's stack: Bun static build, Mustache templates, Tailwind, htmx, deployed as
   a committed `_site/` to Cloudflare Pages). The Builder agent edits content,
   design tokens, and page composition — never architecture. Generating a site
   from scratch costs millions of tokens; specialising a template costs hundreds
   of thousands.
3. **Model tiering.** Haiku by default, Sonnet where quality-of-output is the
   product (design, code, client-facing prose), a frontier model (Opus/Fable) only
   for the low-frequency strategy loop. Roughly: 80% of calls on the cheapest
   model, 19% mid-tier, 1% frontier.
4. **Artifacts over conversation.** Agents never read each other's transcripts.
   They communicate through small structured files in a shared project repo
   (`brief.yaml`, `design-tokens.json`, `status.json`, `feedback.md`). A handoff
   is a file write plus an event, not a context transfer.
5. **Event-driven, never polling.** Webhooks (form submit, email reply, payment,
   CI result) wake agents. Crons only for genuinely periodic work (maintenance
   sweeps, weekly strategy). An idle business burns ~zero tokens.
6. **Bounded loops.** Revision rounds, retry counts, and email back-and-forth all
   have hard caps with human escalation. Unbounded client loops are the #1
   profitability killer.

## The fleet

Nine roles, but only ~6 distinct agents day-to-day. Costs assume prompt caching on
(stable system prompt + rate card + component docs at the prompt head) and Batch
API for anything not latency-sensitive (50% off).

### 1. Dispatcher — *Haiku, event-triggered*
The front door. Every inbound event (contact form, email reply, support request,
webhook) hits the Dispatcher first. It classifies and routes: new lead → Sales;
active-project message → Producer; bug report → Maintenance; spam → drop. Answers
FAQ-grade questions itself from a cached knowledge block. Never does creative work.

- Context budget: ~4k tokens (cached system prompt + the one message).
- Cost: fractions of a cent per event.

### 2. Sales & Client Relations — *Sonnet, event-triggered*
Owns the lead from first contact to signed deal. Qualifies via a short structured
email exchange (max 5 rounds before human escalation), quotes from a fixed rate
card, sends a templated proposal and contract link. On signature + deposit
(Stripe webhook), it writes `brief.yaml` and hands off to the Producer.

- Key efficiency: the proposal is a template with ~10 filled slots, not
  free-written each time. The rate card lives in the cached prompt prefix.
- Human gate: contracts above a price threshold, custom terms, refunds.

### 3. Producer / Project Manager — *Haiku, event- and cron-triggered*
The state machine of each project. Tracks milestones in `status.json`, chases the
client for assets (logo, copy, photos) with templated nudges, schedules review
rounds, and enforces the revision cap (e.g. 2 rounds included). Mostly moves
state and sends templated messages — that's why it can be Haiku.

- Daily cron sweep over active projects: one batched call, not one per project.

### 4. Designer — *Sonnet, per-project (2–3 invocations)*
Turns `brief.yaml` into `design-tokens.json` (palette, type scale, spacing) plus
a page plan (which template sections, in what order, with what content slots).
It does **not** produce pixel mockups — the template system *is* the design
system, so "design" means choosing and parameterising, which is cheap. Client
sees a live staging preview, not a mockup, collapsing the design→build gap.

### 5. Builder — *Sonnet running Claude Code, per-project*
Clones the starter kit, applies design tokens, composes pages from the component
library, drops in client copy (writing it where the brief allows), runs
`bun run build`, pushes to a staging branch on Cloudflare Pages. Revisions arrive
as a structured `feedback.md` (the Producer converts client emails into itemised,
file-anchored feedback first — this alone halves revision tokens).

- Budget: ~1.5–3M tokens per initial build on a template, ~300–600k per revision
  round. This is the biggest single cost centre; the template + component docs in
  the cached prefix are what keep it bounded.

### 6. QA & Release — *deterministic pipeline + Haiku summariser*
Lighthouse, link checker, HTML validation, responsive screenshots, accessibility
scan — all plain CI, zero tokens. An LLM is invoked only to (a) do one visual
pass over the screenshots against the brief, and (b) turn failures into a
Builder-ready fix list. Green pipeline + Producer sign-off → promote staging to
production, trigger final invoice.

### 7. Maintenance & Support — *Haiku, cron + event*
Weekly batched sweep of all live sites: uptime history, dependency audit, broken
links, cert/domain expiry. Client-requested content edits ("change the phone
number") route here rather than to the Builder — small edits on a known template
are a Haiku-grade task. Anything structural gets promoted to a paid mini-project
via Sales.

- This is the margin engine: a $50–100/mo care plan should cost **under $2/mo in
  tokens** per site because almost all of it is deterministic checks.

### 8. Bookkeeper — *scripts + Haiku for edge cases*
Stripe handles invoicing, deposits, subscriptions, and dunning natively via
webhooks and its own retry logic. The agent only summarises weekly financials
into `finances.json` for the Strategist and drafts replies to billing questions.
Refunds always escalate to the human owner.

### 9. Strategist / "CEO" — *frontier model, weekly cron*
The only expensive brain, run once a week over pre-digested inputs (pipeline
stats, project margins, QA trends, client feedback themes — each already
summarised to a few hundred tokens by the agents that own them). Outputs: pricing
adjustments, template/component improvements to commission, marketing copy
experiments, and a short owner-facing memo. One ~50–100k-token session weekly is
~$5–15/mo — negligible, and it's what makes the business self-improving.

- Crucially, its improvement orders (e.g. "add a testimonials section variant to
  the starter kit") compound: every template improvement makes every future build
  cheaper.

## Pipeline at a glance

```
lead (form/email)
  → Dispatcher → Sales ⇄ client (≤5 rounds) → contract + deposit (Stripe)
  → Producer writes brief.yaml, chases assets
  → Designer → design-tokens.json + page plan
  → Builder → staging site on Cloudflare Pages
  → QA pipeline → fix list → Builder (≤3 loops)
  → client review ⇄ revisions (≤2 rounds, via structured feedback.md)
  → promote to production → final invoice → Maintenance takes ownership
```

Human owner touches: high-value contracts, refunds, scope disputes, anything
that exhausts its loop cap, and the weekly Strategist memo.

## Token & profitability model (per typical 5-page brochure site)

| Stage | Model | Est. tokens | Est. cost |
|---|---|---|---|
| Sales exchange + proposal | Sonnet | ~150k | ~$1–2 |
| Producer lifecycle (whole project) | Haiku | ~200k | <$0.50 |
| Design pass | Sonnet | ~200k | ~$1.50 |
| Initial build | Sonnet | ~2.5M | ~$15–25 |
| 2 revision rounds | Sonnet | ~1M | ~$6–10 |
| QA summaries | Haiku | ~100k | <$0.25 |
| **Total per project** | | **~4M** | **~$25–40** |

Against a $1,500–3,000 project price that's a 98%+ gross margin on inference;
the real costs are payment fees, hosting (near-zero on Pages), and the human
owner's escalation time. Ongoing: <$2/mo tokens against a $50–100/mo care plan.
Break-even is effectively the first client. The failure mode to engineer against
is not token price — it's **unbounded loops** (revision spirals, email
ping-pong, QA retry storms), hence the hard caps everywhere.

## Token-efficiency mechanisms (summary)

- **Prompt caching**: every agent's system prompt, rate card, component library
  docs, and brand guidelines sit in a stable cached prefix (90% read discount).
- **Batch API** for all non-interactive work — maintenance sweeps, QA
  summaries, strategy prep (50% discount).
- **Structured artifacts** (`brief.yaml`, `feedback.md`, `status.json`) instead
  of transcript-passing between agents.
- **Digest-up pattern**: each agent maintains a running ≤500-token summary of its
  domain; the Strategist reads digests, never raw history.
- **Context budgets per agent** with summarise-and-truncate, so no agent's
  context grows with business age.
- **Template + component library as compounding capital**: Strategist-directed
  improvements make every subsequent build cheaper.

## Implementation phasing

1. **Phase 1 — Build loop**: starter kit repo (generalise this site's build
   system), component library, Builder + QA on real staging deploys. Prove
   "brief in → live site out" under the token budget.
2. **Phase 2 — Client loop**: Dispatcher, Sales, Producer; Stripe integration;
   structured feedback flow; loop caps and human escalation paths.
3. **Phase 3 — Ownership loop**: Maintenance sweeps, Bookkeeper digests, weekly
   Strategist cron, and the owner memo.

Concretely on Claude Code: each role is a subagent definition
(`.claude/agents/*.md`) with its model, tools, and cached system prompt;
webhooks and crons (scheduled triggers) wake sessions; project state lives in
one git repo per client plus a small ops repo for pipeline/finance/strategy
artifacts.

## Open decisions

- **Scope of "design"**: template-parameterised only (cheapest, recommended to
  start) vs. offering semi-custom layouts at a higher price tier.
- **Client comms channel**: email-only (simplest to automate) vs. a client
  portal (better structured feedback, more to build).
- **How autonomous is Sales**: auto-sign below a price threshold, or human
  approval on every contract initially.
- **CMS question**: purely static rebuilds on request vs. wiring a headless CMS
  for clients who want self-serve edits (affects care-plan pricing).
