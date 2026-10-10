---
name: cerebras
description: Use this to write code to call an LLM using LiteLLM and OpenRouter with the Cerebras inference provider
---

# Calling an LLM via Cerebras

These instructions allow you write code to call an LLM with Cerebras specified as the inference provider.
This method uses LiteLLM and OpenRouter.

## Setup

The OPENROUTER_API_KEY must be set in the `.env` file in the project root (gitignored; create it if missing) and loaded in as an environment variable.
When running in Docker, pass it to the container (e.g. `docker run --env-file .env ...` in the start scripts); never `COPY` the `.env` file into the image.

The backend uv project (`backend/`) must include litellm and pydantic. From `backend/`:
`uv add litellm pydantic`

## Code snippets

Use code like these examples in order to use Cerebras.

### Imports and constants

```python
from litellm import completion
MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}
```

### Code to call via Cerebras for a text response

```python
response = completion(model=MODEL, messages=messages, reasoning_effort="low", extra_body=EXTRA_BODY)
result = response.choices[0].message.content
```

### Code to call via Cerebras for a Structured Outputs response

```python
response = completion(model=MODEL, messages=messages, response_format=MyBaseModelSubclass, reasoning_effort="low", extra_body=EXTRA_BODY)
result = response.choices[0].message.content
result_as_object = MyBaseModelSubclass.model_validate_json(result)
```

### Calling from FastAPI

`completion` is blocking. Call it from a plain `def` endpoint (FastAPI runs those in a threadpool), or use `litellm.acompletion` with `await` inside an `async def` endpoint — never call `completion` directly inside `async def`, as it blocks the event loop.
