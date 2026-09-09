# Bootcamp PR staging

Everything needed to open the draft PR on
`UMMS-Biocore/ai-for-bioinformatics-bootcamp` the moment contributor access
lands (Alper was to add Eric after the 2026-09-04 call).

## Steps

1. Clone the bootcamp repo and branch:
   `git clone git@github.com:UMMS-Biocore/ai-for-bioinformatics-bootcamp.git`
   `git switch -c eric/session1-part-a-explainer`
2. Apply `session1-part-a.diff.md` to `session1-ai-foundations-responsible-ai.md`
   (it links the explainer under Part A and in Materials).
3. Copy `materials-part-a-README.md` to `materials/part-a/README.md`.
4. Commit, push the branch, open the PR **as a draft**, with the summary below.
5. Flip the PR to ready after the Sept 18 teach.

## PR summary (paste into the description)

Adds Session 1 Part A's teaching instrument: "next-token", an interactive
scrolling explainer of how LLMs actually work, built for this bootcamp. It
covers Part A's skeleton end to end: next-token prediction demystified down to
next-letter prediction (a tiny character-level model trains at page load),
tokens, temperature and sampling, training, the interpolation insight,
hallucination (with a spot-the-fabricated-citation exercise built on our anchor
studies), scale, and a bridge to foundation models (AlphaFold, scGPT,
Geneformer, Enformer) that hands off to Session 6.

- Live site: deployed by Alper (Docker/Compose; see the repo README)
- Source: https://github.com/ericmjl/next-token
- Zero runtime network dependencies; presenter mode for the amphitheater
- Stays draft until after the Sept 18 teach
