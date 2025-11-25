from pathlib import Path
import joblib

_MODEL_CACHE = {}

MODEL_PATH = Path(__file__).resolve().parent / "data" / "stacking_model.joblib"

def load_model():
    """Load and cache the ML model from /data/stacking_model.joblib"""
    if "stacking" in _MODEL_CACHE:
        return _MODEL_CACHE["stacking"]

    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")

    model = joblib.load(MODEL_PATH)
    _MODEL_CACHE["stacking"] = model
    return model
