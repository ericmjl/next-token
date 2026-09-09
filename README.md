# next-token

An interactive explainer of how language models actually work, built for the
[AI for Bioinformatics bootcamp](https://github.com/UMMS-Biocore/ai-for-bioinformatics-bootcamp)
at UMass Chan (Session 1, Part A: intuition, math-light). It is a scrolling page
you teach from, with live demos behind every concept, and it ends where Part A
ends: at foundation models.

The toy model behind the demos is a real character-level n-gram language model
trained on a small original corpus of biology text at server startup. It contains
no neural network, so you can watch the bare mechanism, next-token prediction
and sampling, without the fog.

## Quickstart

With [uv](https://docs.astral.sh/uv/):

```bash
uv sync
uv run uvicorn app.main:app --reload
# open http://127.0.0.1:8000
```

With Docker (this is the path that ships to the bootcamp server):

```bash
docker compose up --build
# open http://<host>:8000
```

Health check for the deployment: `GET /api/health`.

## What is on the page

Ten sections, designed for a 30 to 45 minute teach in front of a mixed room of
students and PIs:

1. **One trick**: predict the next chunk, then let the toy model finish your sentence
2. **Tokens**: how text becomes numbers, straight from a production tokenizer
3. **Dice and temperature**: live probability bars and sampling, with the consumer-vs-API framing
4. **Training**: a loss ladder and growing generations as the toy model reads more text
5. **The big library**: the interpolation insight, training data so vast that out-of-distribution-looking questions land in-distribution
6. **Confidently wrong**: hallucination as the mechanism working normally, with a spot-the-fabricated-citation exercise
7. **Scale**: what changed at each order of magnitude, 1940s to frontier
8. **Foundation models**: train once, use everywhere; the bridge to AlphaFold, scGPT, Geneformer, Enformer
9. **Limits and the handoff**: failure modes become habits, a quiz, then hands off to the responsible-AI session
10. **Take it with you**: glossary, FAQ, background shelf

Teaching affordances: keyboard jumping between sections (`←` `→` or `J` `K`),
presenter mode (`P`) that rescales the whole page including demo cards for the
amphitheater, predict-first prompts and say-back lines for the room, a rail that
tracks where you are, dark mode, and zero runtime dependencies on the outside
world. Every demo runs against this app itself; if the room's wifi dies, the
page keeps working.

## Stack, and why

- **FastAPI + Jinja2**: serves the page and the demo endpoints (`/api/continue`,
  `/api/roll`), so sampling happens server-side and the temperature knob is a
  real knob, not theater.
- **htmx** (vendored, no CDN): the demos are plain HTML fragments swapped in on
  request. No build step, no framework, nothing to compile.
- **Vanilla JS + SVG** where a demo needs pixels: the interpolation cloud, the
  keyboard navigation, presenter mode.
- **No external calls at runtime**: the model, corpus, styles, and scripts all
  ship in the container.

## Layout

```text
app/
  main.py        FastAPI app: page + demo endpoints
  lm.py          the character-level n-gram model (count-based, backoff, temperature)
  corpus.py      the small original biology corpus the toy model reads
  templates/     base layout, page, section templates, htmx partials
  static/        css, vendored htmx, nav.js, interactions.js, cloud.js
Dockerfile       python:3.12-slim, pinned deps, tokenizer cache baked in, healthcheck
compose.yaml     single service, port 8000
PLAN.md          content plan, review pipeline, ship plan
```

## Deploy notes for Alper

The container listens on `8000`, stores nothing, and keeps no state between
requests, so it can sit behind any reverse proxy. Put it on its own port or
subpath, point the bootcamp site at it, and `GET /api/health` is the readiness
probe. Everything the app needs is in the image.
