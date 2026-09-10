"""Vercel serverless entry point: expose the FastAPI app as an ASGI function.

The Vercel Python runtime detects the `app` attribute and bridges HTTP
requests to it, so every route in app/main.py works unchanged.

tiktoken normally downloads its encoding file on first use and caches it,
but the serverless filesystem is read-only. We vendor the cache file in
api/tiktoken-cache/ and point TIKTOKEN_CACHE_DIR at it BEFORE importing
app.main (which calls get_encoding at module scope).
"""

from __future__ import annotations

import os
from pathlib import Path

os.environ.setdefault(
    "TIKTOKEN_CACHE_DIR", str(Path(__file__).resolve().parent / "tiktoken-cache")
)

from app.main import app  # noqa: E402,F401
