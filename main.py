from __future__ import annotations

from typing import Any

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:  # pragma: no cover - runtime compatibility
    from .model_loader import load_model
    from .scoring import (
        LifestyleInputs,
        categorize_score,
        compute_lifestyle_score,
        compute_nfhs_score,
        list_states,
    )
except ImportError:
    from model_loader import load_model  # type: ignore
    from scoring import (  # type: ignore
        LifestyleInputs,
        categorize_score,
        compute_lifestyle_score,
        compute_nfhs_score,
        list_states,
    )

app = FastAPI(title="Maternal Health Risk Calculator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"]
    ,
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    age: float = Field(..., ge=15, le=60)
    systolic_bp: float = Field(..., ge=80, le=200)
    heart_rate: float = Field(..., ge=40, le=200)
    sleep_hours: float = Field(..., ge=0, le=14)
    stress_level: float = Field(..., ge=1, le=10)
    hydration: float = Field(..., ge=0.5, le=4)
    activity_minutes: float = Field(..., ge=0, le=300)
    state: str


class PredictResponse(BaseModel):
    final_score: float
    category: str
    ml_score: float
    lifestyle_score: float
    nfhs_score: float
    ml_probability: float
    lifestyle_breakdown: dict[str, float]
    vitals: dict[str, float]


@app.get("/states")
def get_states() -> dict[str, list[str]]:
    return {"states": list_states()}


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest) -> PredictResponse:
    try:
        model = load_model()
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    features = np.array([[payload.age, payload.systolic_bp, payload.heart_rate]])
    try:
        prob = float(model.predict_proba(features)[0][1])
    except Exception as exc:  # type: ignore[pragma]
        raise HTTPException(status_code=500, detail=f"Model inference failed: {exc}") from exc

    ml_score = prob * 60

    lifestyle_score, lifestyle_breakdown = compute_lifestyle_score(
        LifestyleInputs(
            sleep_hours=payload.sleep_hours,
            stress_level=payload.stress_level,
            hydration=payload.hydration,
            activity_minutes=payload.activity_minutes,
        )
    )

    try:
        nfhs_score = compute_nfhs_score(payload.state)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    final_score = ml_score + lifestyle_score + nfhs_score
    category = categorize_score(final_score)

    return PredictResponse(
        final_score=round(final_score, 2),
        category=category,
        ml_score=round(ml_score, 2),
        lifestyle_score=round(lifestyle_score, 2),
        nfhs_score=round(nfhs_score, 2),
        ml_probability=round(prob, 4),
        lifestyle_breakdown=lifestyle_breakdown,
        vitals={
            "Age": payload.age,
            "Systolic BP": payload.systolic_bp,
            "Heart Rate": payload.heart_rate,
        },
    )
