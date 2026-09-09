FROM python:3.12-slim

WORKDIR /app

# No build step, no node, nothing to compile: the whole app is Python plus
# static files, so a plain pip install keeps the image boring and portable.
# Versions are pinned to the tested lock so Friday's image is today's image.
COPY pyproject.toml README.md ./
RUN pip install --no-cache-dir \
    "fastapi==0.141.1" \
    "uvicorn[standard]==0.52.4" \
    "jinja2==3.1.6" \
    "tiktoken==0.14.0"

# Bake the tokenizer data into a stable layer (not /tmp, which hardened hosts
# may mount as scratch) so the app needs zero network access at runtime.
ENV TIKTOKEN_CACHE_DIR=/app/.tiktoken-cache
RUN python -c "import tiktoken; tiktoken.get_encoding('cl100k_base')"

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=2)"

COPY app ./app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
