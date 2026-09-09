"""next-token: an interactive, teachable explainer of how LLMs work.

Built for the UMass Chan AI for Bioinformatics bootcamp (Session 1, Part A).
The whole app is a FastAPI server that renders one scrolling page of teaching
beats and serves a handful of tiny endpoints that make the core concepts
tangible: next-character prediction, tokenization, temperature, sampling, and
what training on more text actually changes.
"""

from __future__ import annotations

from pathlib import Path

import tiktoken
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from .corpus import CORPUS
from .lm import CharNGram

BASE_DIR = Path(__file__).resolve().parent
TEMPLATES = Jinja2Templates(directory=str(BASE_DIR / "templates"))

LM = CharNGram(CORPUS, order=6)
ENCODING = tiktoken.get_encoding("cl100k_base")

# Beat 4: one model per stage of reading. The held-out tail is excluded from
# training at every stage, so the falling surprise on it is honest learning,
# never memorization of the exact sentences being scored.
_HELD_OUT = CORPUS[-300:]
_TRAIN_TEXT = CORPUS[:-300]
_STAGE_FRACTIONS = [0.05, 0.15, 0.3, 0.5, 0.75, 1.0]
_TRAINING_PREFIX = "The cell "


def _build_stages() -> list[dict]:
    stages: list[dict] = []
    for frac in _STAGE_FRACTIONS:
        cut = max(int(len(_TRAIN_TEXT) * frac), 200)
        model = CharNGram(_TRAIN_TEXT[:cut], order=6)
        stages.append(
            {
                "frac": frac,
                "chars": cut,
                "bits": round(model.average_bits_per_char(_HELD_OUT), 2),
                "model": model,
            }
        )
    return stages


STAGES = _build_stages()

BEATS = [
    {"num": "01", "id": "beat-01", "label": "One trick"},
    {"num": "02", "id": "beat-02", "label": "Tokens"},
    {"num": "03", "id": "beat-03", "label": "Dice and temperature"},
    {"num": "04", "id": "beat-04", "label": "Training"},
    {"num": "05", "id": "beat-05", "label": "The big library"},
    {"num": "06", "id": "beat-06", "label": "Confidently wrong"},
    {"num": "07", "id": "beat-07", "label": "Scale"},
    {"num": "08", "id": "beat-08", "label": "Foundation models"},
    {"num": "09", "id": "beat-09", "label": "Limits and the handoff"},
    {"num": "10", "id": "beat-10", "label": "Take it with you"},
]

app = FastAPI(title="next-token", docs_url=None, redoc_url=None)
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")


def _display(ch: str | None) -> str:
    """Make whitespace visible so the demo never shows a mysterious blank."""
    if ch is None:
        return "?"
    return {" ": "␣", "\n": "↵"}.get(ch, ch)


def _clamp_temperature(value: float) -> float:
    return max(0.05, min(value, 2.0))


@app.get("/")
async def index(request: Request):
    ctx = {"beats": BEATS, "lm": LM}
    return TEMPLATES.TemplateResponse(request=request, name="index.html", context=ctx)


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "corpus_chars": LM.corpus_size,
        "vocab_size": LM.vocab_size,
        "contexts": LM.context_count,
        "stages": len(STAGES),
    }


@app.get("/api/continue")
async def continue_text(
    request: Request,
    prefix: str = "The polymerase chain reaction ",
    temperature: float = 0.8,
    n: int = 90,
):
    """Continue a prefix and return the result as an HTML fragment for htmx."""
    safe_prefix = prefix[-200:]
    continuation = LM.generate(
        safe_prefix,
        n_chars=max(10, min(n, 200)),
        temperature=_clamp_temperature(temperature),
    )
    ctx = {
        "prefix": safe_prefix,
        "continuation": continuation,
        "temperature": _clamp_temperature(temperature),
    }
    return TEMPLATES.TemplateResponse(request=request, name="partials/continue.html", context=ctx)


@app.get("/api/roll")
async def roll(
    request: Request,
    prefix: str = "The ",
    temperature: float = 0.8,
):
    """Sample one next character and show the distribution it came from."""
    t = _clamp_temperature(temperature)
    picked = LM.sample(prefix, temperature=t)
    shaped = LM.reshaped(prefix, t)
    top = sorted(shaped.items(), key=lambda kv: kv[1], reverse=True)[:8]
    ctx = {
        "top": [(_display(ch), p) for ch, p in top],
        "picked": _display(picked),
        "temperature": t,
    }
    return TEMPLATES.TemplateResponse(request=request, name="partials/roll.html", context=ctx)


@app.get("/api/tokenize")
async def tokenize(
    request: Request,
    text: str = "CRISPR-Cas9 edits deoxyribonucleic acid in the cell nucleus",
):
    """Show how a production tokenizer chops text, as chips with token IDs."""
    safe_text = text[:300]
    ids = ENCODING.encode(safe_text)
    tokens = [{"id": i, "piece": ENCODING.decode([i])} for i in ids]
    ctx = {"tokens": tokens, "count": len(tokens)}
    return TEMPLATES.TemplateResponse(request=request, name="partials/tokens.html", context=ctx)


@app.get("/api/training")
async def training(request: Request, stage: int = 6):
    """Show what the toy model writes, and how surprised it is, at a stage of reading."""
    idx = max(1, min(stage, len(STAGES))) - 1
    s = STAGES[idx]
    sample = s["model"].generate(_TRAINING_PREFIX, n_chars=90, temperature=0.75)
    ctx = {
        "stages": STAGES,
        "current": idx,
        "chars": s["chars"],
        "bits": s["bits"],
        "frac": int(s["frac"] * 100),
        "sample": sample,
    }
    return TEMPLATES.TemplateResponse(request=request, name="partials/training.html", context=ctx)
