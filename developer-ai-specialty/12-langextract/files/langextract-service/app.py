"""LangExtract REST service for the AI Specialty labs.

Wraps Google's langextract library behind the small HTTP contract the
LangExtract module's transformations call:

    POST /extract
        {
          "text": "...", "prompt": "...",
          "examples": [ { "text": "...", "extractions": [
              { "extraction_class": "...", "extraction_text": "..." } ] } ],
          "model_id": "llama3.2:3b",        # optional
          "max_char_buffer": 1200,           # optional
          "overlap": 100,                    # optional
          "extraction_passes": 2             # optional
        }
    ->  { "extractions": [ { "class": "...", "text": "...",
                             "start": 0, "end": 10 } ] }

Backend is a local Ollama by default, so lab data never leaves the
machine. Run with:

    uvicorn app:app --host 0.0.0.0 --port 8765
"""

import inspect
import os
from typing import Any

import langextract as lx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

MODEL_URL = os.getenv("LX_MODEL_URL", "http://localhost:11434")
DEFAULT_MODEL = os.getenv("LX_DEFAULT_MODEL", "llama3.2:3b")

app = FastAPI(title="LangExtract service", version="1.0.0")


class ExampleExtraction(BaseModel):
    extraction_class: str
    extraction_text: str


class Example(BaseModel):
    text: str
    extractions: list[ExampleExtraction] = Field(default_factory=list)


class ExtractRequest(BaseModel):
    text: str
    prompt: str
    examples: list[Example] = Field(default_factory=list)
    model_id: str | None = None
    max_char_buffer: int | None = None
    overlap: int | None = None
    extraction_passes: int | None = None


class ExtractionOut(BaseModel):
    # "class" is a Python keyword - expose it via an alias.
    cls: str = Field(serialization_alias="class")
    text: str
    start: int | None = None
    end: int | None = None


class ExtractResponse(BaseModel):
    extractions: list[ExtractionOut]


def _supported_kwargs(candidate: dict[str, Any]) -> dict[str, Any]:
    """Keep only kwargs this langextract version's extract() accepts -
    the optional tuning knobs vary between releases. Some releases wrap
    extract() as (*args, **kwargs); treat that as accept-everything."""
    params = inspect.signature(lx.extract).parameters
    accepts_any = any(p.kind is inspect.Parameter.VAR_KEYWORD for p in params.values())
    return {k: v for k, v in candidate.items() if v is not None and (accepts_any or k in params)}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model": DEFAULT_MODEL, "model_url": MODEL_URL}


@app.post("/extract", response_model=ExtractResponse)
def extract(req: ExtractRequest) -> ExtractResponse:
    examples = [
        lx.data.ExampleData(
            text=e.text,
            extractions=[
                lx.data.Extraction(
                    extraction_class=x.extraction_class,
                    extraction_text=x.extraction_text,
                )
                for x in e.extractions
            ],
        )
        for e in req.examples
    ]

    optional = _supported_kwargs(
        {
            "max_char_buffer": req.max_char_buffer,
            "overlap": req.overlap,
            "extraction_passes": req.extraction_passes,
        }
    )

    try:
        result = lx.extract(
            text_or_documents=req.text,
            prompt_description=req.prompt,
            examples=examples,
            model_id=req.model_id or DEFAULT_MODEL,
            model_url=MODEL_URL,
            fence_output=False,
            use_schema_constraints=False,
            **optional,
        )
    except Exception as exc:  # surface the real cause to the lab user
        raise HTTPException(status_code=502, detail=f"langextract failed: {exc}") from exc

    out: list[ExtractionOut] = []
    for ex in result.extractions or []:
        start = end = None
        interval = getattr(ex, "char_interval", None)
        if interval is not None:
            start = getattr(interval, "start_pos", None)
            end = getattr(interval, "end_pos", None)
        if start is None and ex.extraction_text and ex.extraction_text in req.text:
            start = req.text.index(ex.extraction_text)
            end = start + len(ex.extraction_text)
        out.append(
            ExtractionOut(cls=ex.extraction_class, text=ex.extraction_text or "", start=start, end=end)
        )
    return ExtractResponse(extractions=out)
