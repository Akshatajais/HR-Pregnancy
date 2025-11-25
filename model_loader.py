from pathlib import Path
import joblib

_MODEL_CACHE = {}

# Since main.py is in root, model_loader.py is also in root.
# The model is inside ./data/stacking_model.joblib
MODEL_PATH = Path(__file__).resolve().parent / "data" / "stacking_model.joblib"


def load_model():
    """Load and cache the stacking model from ./data."""
    if "stacking" in _MODEL_CACHE:
        return _MODEL_CACHE["stacking"]

    if MODEL_PATH.exists():
        model = joblib.load(MODEL_PATH)
        _MODEL_CACHE["stacking"] = model
        return model

    raise FileNotFoundError(f"Model not found at: {MODEL_PATH}")
