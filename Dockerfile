# syntax=docker/dockerfile:1

# ---- Frontend: static export of the Next.js app ----
FROM node:24-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
# The NDA page reads the legal templates from ../templates at build time.
COPY templates /app/templates
COPY frontend ./
RUN npm run build

# ---- Runtime: FastAPI serves the API and the exported frontend ----
FROM python:3.13-slim
COPY --from=ghcr.io/astral-sh/uv:0.9.30 /uv /usr/local/bin/uv
WORKDIR /app/backend
ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev
COPY backend/app ./app
COPY --from=frontend /app/frontend/out /app/static
ENV PATH="/app/backend/.venv/bin:$PATH" \
    PRELEGAL_STATIC_DIR=/app/static
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
