from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Iterable

import numpy as np
import pandas as pd

DATA_PATH = "data/NFHS_Factsheet.csv"
STATE_COLUMN = "States/UTs"

GOOD_INDICATORS = [
    "Female population age 6 years and above who ever attended school (%)",
    "Population living in households with an improved drinking-water source1 (%)",
    "Population living in households that use an improved sanitation facility2 (%)",
    "Households using clean fuel for cooking3 (%)",
]

BAD_INDICATORS = [
    "Ever-married women age 18-49 years who have ever experienced spousal violence27 (%)",
    "Women age 15 years and above who use any kind of tobacco (%)",
    "Men age 15 years and above who use any kind of tobacco (%)",
    "Women age 15 years and above who consume alcohol (%)",
    "Men age 15 years and above who consume alcohol (%)",
]


@dataclass
class LifestyleInputs:
    sleep_hours: float
    stress_level: float
    hydration: float
    activity_minutes: float


@lru_cache(maxsize=1)
def load_nfhs_frame() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    df[STATE_COLUMN] = df[STATE_COLUMN].str.strip()
    return df


def list_states() -> list[str]:
    df = load_nfhs_frame()
    return sorted(df[STATE_COLUMN].unique())


def _safe_numeric(series: Iterable[str | float | int]) -> np.ndarray:
    numeric = []
    for value in series:
        if isinstance(value, (int, float)):
            numeric.append(float(value))
            continue
        if isinstance(value, str):
            cleaned = value.strip().replace("%", "")
            if not cleaned or cleaned.upper() in {"NA", "*"}:
                continue
            try:
                numeric.append(float(cleaned))
            except ValueError:
                continue
    return np.array(numeric, dtype=float)


def compute_nfhs_score(state: str) -> float:
    df = load_nfhs_frame()
    subset = df[df[STATE_COLUMN].str.casefold() == state.casefold()]
    if subset.empty:
        raise ValueError(f"State '{state}' not found in NFHS dataset")

    good_values: list[float] = []
    bad_values: list[float] = []

    for column in GOOD_INDICATORS:
        if column in subset:
            vals = _safe_numeric(subset[column])
            if vals.size:
                good_values.append(vals.mean())
    for column in BAD_INDICATORS:
        if column in subset:
            vals = _safe_numeric(subset[column])
            if vals.size:
                bad_values.append(vals.mean())

    good_avg = np.mean(good_values) if good_values else 50.0
    bad_avg = np.mean(bad_values) if bad_values else 10.0

    # Higher good indicators reduce risk; higher bad indicators increase risk
    good_component = (100 - np.clip(good_avg, 0, 100)) / 100 * 10
    bad_component = np.clip(bad_avg, 0, 100) / 100 * 10
    score = good_component + bad_component
    return float(np.clip(score, 0, 20))


def compute_lifestyle_score(inputs: LifestyleInputs) -> tuple[float, dict[str, float]]:
    if inputs.sleep_hours < 5:
        sleep_score = 8
    elif inputs.sleep_hours < 6:
        sleep_score = 6
    elif inputs.sleep_hours < 7:
        sleep_score = 3
    elif inputs.sleep_hours > 9:
        sleep_score = 2
    else:
        sleep_score = 1

    stress_score = np.interp(
        np.clip(inputs.stress_level, 1, 10),
        (1, 10),
        (0, 8),
    )
    hydration_score = np.interp(
        np.clip(inputs.hydration, 0.5, 3.0),
        (3.0, 0.5),
        (0, 4),
    )
    activity_score = np.interp(
        np.clip(inputs.activity_minutes, 0, 120),
        (120, 0),
        (0, 4),
    )

    total = float(np.clip(sleep_score + stress_score + hydration_score + activity_score, 0, 20))
    breakdown = {
        "sleep": float(sleep_score),
        "stress": float(stress_score),
        "hydration": float(hydration_score),
        "activity": float(activity_score),
    }
    return total, breakdown


def categorize_score(total: float) -> str:
    if total <= 30:
        return "Low"
    if total <= 60:
        return "Moderate"
    return "High"
