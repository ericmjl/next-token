# Part A teaching instrument: next-token

[How LLMs actually work](https://github.com/ericmjl/next-token) is an
interactive scrolling explainer built for Session 1, Part A. This note maps it
to the session and documents how it runs.

## Beat map (30 to 45 minute teach)

| Beat | Minutes | What happens |
| --- | --- | --- |
| Hero + Beat 1 One trick | 5 | The room predicts a sentence ending; the toy model takes over |
| Beat 2 Tokens | 3 | Tokenize CRISPR-Cas9 and lab vocabulary with a production tokenizer |
| Beat 3 Dice and temperature | 4 | Probability bars, sampling, the temperature knob, consumer vs API |
| Beat 4 Training | 4 | Slider drives how much text the model read; loss falls live |
| Beat 5 The big library | 4 | The interpolation insight; the room's niche questions land in-distribution |
| Beat 6 Confidently wrong | 6 | Spot the fabricated citation (anchor studies mixed with fakes) |
| Beat 7 Scale | 3 | Ten orders of magnitude, emergence hedged honestly |
| Beat 8 Foundation models | 4 | AlphaFold, scGPT, Geneformer, Enformer; hands off to Session 6 |
| Beat 9 Limits and the handoff | 5 | Failure table, quiz, the Monday takeaway, Alper takes Part B |
| Beat 10 Take it with you | 0-1 | Point at the glossary, FAQ, and background shelf |

The site drives the pacing: keyboard arrows jump between beats, `P` toggles
presenter mode for the amphitheater, and every demo has a reset.

## Run it

```bash
git clone https://github.com/ericmjl/next-token
cd next-token
docker compose up --build
# serves on port 8000; GET /api/health is the readiness probe
```

Or without Docker: `uv sync && uv run uvicorn app.main:app`.

## Deployment notes (for the bootcamp server)

The container listens on 8000, stores nothing, and keeps no state between
requests, so it sits cleanly behind a reverse proxy. The tokenizer data ships
inside the image, so the runtime needs zero internet access. Compose file
included; restart policy `unless-stopped`.
