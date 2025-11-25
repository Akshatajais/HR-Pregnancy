from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib


_MODEL_CACHE: dict[str, Any] = {}


MODEL_CANDIDATES = [
    Path("/mnt/data/stacking_model_v2.joblib"),
    Path(__file__).resolve().parent.parent / "data" / "stacking_model.joblib",
]


def load_model() -> Any:
    """Lazy load and cache the stacking model."""
    if "stacking" in _MODEL_CACHE:
        return _MODEL_CACHE["stacking"]

    for candidate in MODEL_CANDIDATES:
        if candidate.exists():
            _MODEL_CACHE["stacking"] = joblib.load(candidate)
            return _MODEL_CACHE["stacking"]

    searched = ", ".join(str(p) for p in MODEL_CANDIDATES)
    raise FileNotFoundError(
        f"Unable to locate stacking model. Searched: {searched}"
    )
