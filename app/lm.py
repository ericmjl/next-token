"""A tiny character-level n-gram language model, built for teaching.

This is the toy that makes "next token prediction" visceral. It reads a small
corpus once at startup, counts which characters follow which short contexts,
and samples from those counts at request time. It has no neurons, no matrix
multiplication, and no idea what biology is, yet it still produces
biology-shaped words. That gap between what it knows and what it produces is
exactly the lesson.
"""

from __future__ import annotations

import math
import random
from collections import defaultdict


class CharNGram:
    """An order-n character n-gram model with backoff to shorter contexts."""

    def __init__(self, text: str, order: int = 6) -> None:
        self.order = order
        self.text = " ".join(text.split())  # collapse whitespace so the model learns prose, not line breaks
        # counts[k][context][next_char]: counts at every context length from 1
        # to order, so short prefixes can back off instead of finding nothing.
        self.counts: dict[int, defaultdict[str, defaultdict[str, int]]] = {
            k: defaultdict(lambda: defaultdict(int)) for k in range(1, order + 1)
        }
        t = self.text
        for i, nxt in enumerate(t):
            for k in range(1, self.order + 1):
                if i - k < 0:
                    break
                self.counts[k][t[i - k : i]][nxt] += 1

    # ------------------------------------------------------------------ info

    @property
    def vocab_size(self) -> int:
        return len(set(self.text))

    @property
    def corpus_size(self) -> int:
        return len(self.text)

    @property
    def context_count(self) -> int:
        return sum(len(v) for v in self.counts.values())

    def average_bits_per_char(self, text: str, smoothing: float = 0.05) -> float:
        """How surprised the model is by text it did not train on, in bits/char.

        Used by the Beat 4 demo to make 'the model is learning' visible: the
        number falls as the model reads more of the corpus. A little smoothing
        keeps unseen characters from producing infinities at tiny stages.
        """
        total_bits = 0.0
        counted = 0
        vocab = max(self.vocab_size, 1)
        for i, ch in enumerate(text):
            dist = self.distribution(text[:i])
            if not dist:
                continue
            p = dist.get(ch, 0.0)
            p = (1.0 - smoothing) * p + smoothing / vocab
            total_bits += -math.log2(p)
            counted += 1
        return total_bits / max(counted, 1)

    # ------------------------------------------------------------ prediction

    def distribution(self, prefix: str) -> dict[str, float]:
        """Return the next-character probability distribution for a prefix."""
        for k in range(min(self.order, len(prefix)), 0, -1):
            counts = self.counts[k].get(prefix[-k:])
            if counts:
                total = sum(counts.values())
                return {ch: n / total for ch, n in counts.items()}
        return {}

    def reshaped(self, prefix: str, temperature: float) -> dict[str, float]:
        """The distribution after temperature reshaping: the list the die rolls."""
        dist = self.distribution(prefix)
        if not dist:
            return {}
        if temperature <= 0.01:
            best = max(dist.values())
            return {ch: (1.0 if p == best else 0.0) for ch, p in dist.items()}
        weights = {ch: p ** (1.0 / temperature) for ch, p in dist.items()}
        total = sum(weights.values())
        return {ch: w / total for ch, w in weights.items()}

    def top(self, prefix: str, k: int = 8) -> list[tuple[str, float]]:
        """The k most likely next characters with their (untouched) probabilities."""
        dist = self.distribution(prefix)
        ranked = sorted(dist.items(), key=lambda kv: kv[1], reverse=True)
        return ranked[:k]

    def sample(self, prefix: str, temperature: float = 1.0, rng: random.Random | None = None) -> str | None:
        """Draw one next character, reshaping the distribution by temperature.

        temperature < 1 sharpens the distribution (the model plays it safe),
        temperature > 1 flattens it (the model takes risks), and temperature
        approaching 0 collapses it to the single most likely character.
        """
        rng = rng or random.Random()
        dist = self.distribution(prefix)
        if not dist:
            return None
        chars = sorted(dist)
        probs = [dist[c] for c in chars]
        if temperature <= 0.01:
            return chars[max(range(len(chars)), key=lambda i: probs[i])]
        weights = [p ** (1.0 / temperature) for p in probs]
        total = sum(weights)
        weights = [w / total for w in weights]
        idx = rng.choices(range(len(chars)), weights=weights, k=1)[0]
        return chars[idx]

    def generate(self, prefix: str, n_chars: int = 90, temperature: float = 0.8, rng: random.Random | None = None) -> str:
        """Continue a prefix for n_chars sampled characters."""
        rng = rng or random.Random()
        out = prefix
        for _ in range(n_chars):
            ch = self.sample(out, temperature=temperature, rng=rng)
            if ch is None:
                break
            out += ch
        return out[len(prefix) :]
