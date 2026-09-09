# PLAN

The build and ship plan for next-token. This file is the source of truth while
the site is under construction; it gets trimmed to a short "what shipped" note
once Session 1 is delivered.

## Commission

Teach Part A of Session 1 ("How AI actually works", intuition, math-light) at
the UMass Chan AI for Bioinformatics bootcamp, Friday 2026-09-18, 1 to 4 pm,
Amphitheater II. The teach is 30 to 45 minutes inside a 3-hour session. The
deliverable is an interactive scrolling page, not slides: Eric teaches by
scrolling, driving the demos live in front of 75 participants (students through
famous PIs, mostly scientists rather than bioinformaticians).

From the 2026-09-04 planning call with Alper and Tommy:

- Eric builds the interactive page, sends Alper a test link plus source code;
  Alper deploys on his server (Docker/Compose supported).
- Core concept to demystify: next-token prediction, taken down to next-letter
  prediction, visual intuition first.
- The signature insight: models mimic a training distribution bigger than
  anything a brain could read, so out-of-distribution-looking prompts are
  actually in-distribution. Interpolation, not retrieval.
- Background anchors to link, not reproduce: Welch Labs, 3Blue1Brown.
- Consumer apps hide temperature and seed; API and eval contexts expose them.
- Session materials land in the bootcamp repo after each session.

## Milestones

| Date | Milestone | Status |
| --- | --- | --- |
| 2026-09-08 | Repo scaffolded, stack proven end to end, sections 1, 3, 5 live | done 2026-09-08 |
| 2026-09-09 | All ten sections drafted with working demos | done 2026-09-09 |
| 2026-09-09 | Ten-reviewer pass run and fixes applied | done 2026-09-09 |
| 2026-09-09 | Docker build verified offline; repo pushed; handoff email drafted | done 2026-09-09 |
| 2026-09-16 | Test link to Alper (needs his server), deploy | on Alper |
| 2026-09-17 | Dry run in the amphitheater | next |
| 2026-09-18 | Teach | |

## Multi-agent review pass, 2026-09-09

Ten reviewers ran against the built site (coherence ran last, on the fixed
state). Findings were consolidated and applied in one pass. The load-bearing
fixes:

- **Accuracy**: the Vernia citation card now quotes the real title ("The
  PPAR-alpha-FGF21 hormone axis contributes to metabolic regulation by the
  hepatic JNK signaling pathway"), Gellatly is K.J. with the positioning-not-
  recruitment finding stated correctly, Wang is Y.; the temperature demo now
  renders the reshaped distribution, so the bars move with the slider.
- **Voice/unslop**: hallucination-section opener de-antithesized, quiz de-anonymized to second
  person (no invented colleagues), contractions pass, straight quotes
  everywhere, zero em dashes in copy.
- **Pedagogy**: predict-first prompts on sections 1-5 and 8, removed say-back lines;
  a Monday-takeaway box at the end of the limits section, quiz gets a reset.
- **Accessibility**: skip link, pencil-faint swapped for pencil on all text
  roles, rule-strong darkened to pass 3:1 for component boundaries, scale/loss
  dim states raised, aria-live on all graded outcomes, presenter mode now
  scales the root plus role-level floors for the back row.
- **Design**: per-demo reserved output heights (no caption lurch), cloud labels
  repositioned and stroked, details cards get +/− affordances, pick-pop and
  bar-grow motion.
- **Deployment**: tiktoken cache moved out of /tmp into a stable image layer,
  HEALTHCHECK added, pip versions pinned to the lock, .dockerignore added.
  Measured: 75 concurrent viewers served with max 53 ms per request; the
  container serves everything with --network none.

## Draft PR on the bootcamp repo

Branch `eric/session1-part-a-explainer` on
`UMMS-Biocore/ai-for-bioinformatics-bootcamp`, opened as a **draft**:

- `session1-ai-foundations-responsible-ai.md`: under Part A, link the explainer
  as the teaching instrument for the section; add it to Materials.
- `materials/part-a/README.md`: how the explainer maps to the session sections,
  how to run it locally, how Alper deploys it.
- Stays draft until after the teach, then ready for review.

## Multi-agent review pipeline

Runs against the built site once all sections are drafted. Each reviewer gets the
rendered page plus the commission context above, and returns findings; fixes
are consolidated and applied in one pass.

1. **Coherence**: does the arc hang together, do sections build on each other, no orphan concepts.
2. **Audience spectrum**: two personas, a first-year grad student and a skeptical famous PI; does the page serve both without boring or insulting either.
3. **Accuracy**: ML correctness, including pressure-testing the interpolation framing so it earns the claim rather than overclaiming it.
4. **Aesthetics**: visual hierarchy, spacing, rhythm.
5. **Design (impeccable skill)**: interface quality pass.
6. **De-slop (unslop skill)**: copy audit for AI tells.
7. **Voice (write-like-eric skill)**: does it sound like Eric, first person, no em dashes, flowing prose.
8. **Pedagogy**: cognitive load, beat pacing against the 30-45 minute budget, active-recall moments, what the audience can do afterwards that they couldn't before.
9. **Amphitheater accessibility**: WCAG contrast in both themes, readable-from-the-back font sizes, colorblind-safe palettes, keyboard-only operation, reduced motion.
10. **Deployment robustness**: Docker build clean, offline-capable, and the 75-simultaneous-viewers moment when the room opens the page at once.

## Tech decisions

- FastAPI + Jinja2 + htmx (vendored) + vanilla JS/SVG. No build step, no
  framework, no runtime network dependencies.
- The toy model is a character-level n-gram with backoff, trained at startup on
  a small original corpus (`app/corpus.py`, written for this bootcamp, no
  licensing questions).
- Sampling happens server-side so temperature is real; nondeterminism across
  identical requests is a feature, it is the lesson.
- Deterministic seeded layout for the interpolation-section cloud so the picture is stable
  while it is being explained.
