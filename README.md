# Maternal Health Risk Calculator

An end-to-end Maternal Health Risk Calculator that combines a FastAPI backend (ML + scoring) with a Vite + React + Tailwind frontend. The app blends three signals—machine learning probability, lifestyle behaviour scoring, and NFHS-5 contextual indicators—to present a 0–100 risk score with Low / Moderate / High categories.

## Tech Stack

- **Frontend:** React 19, Vite, TailwindCSS
- **Backend:** FastAPI, scikit-learn, pandas
- **Data:** `data/stacking_model.joblib`, `data/NFHS_Factsheet.csv`

## Project Structure

```
backend/
  main.py            # FastAPI app with /states and /predict
  scoring.py         # Lifestyle + NFHS scoring utilities
  model_loader.py    # Lazy model loader with /mnt/data fallback
  requirements.txt
frontend/
  src/
    components/      # Form cards, inputs, result card
    pages/Home.jsx   # Single-page experience
    App.jsx
  package.json
  tailwind.config.js
README.md
```

## Backend (FastAPI)

1. **Install deps**
   ```bash
   cd /Users/akshata/Desktop/Project/Pregnancy\ Risk\ Calculator
   python -m venv .venv && source .venv/bin/activate
   pip install -r backend/requirements.txt
   ```
2. **Run locally**
   ```bash
   uvicorn backend.main:app --reload
   ```
3. **Endpoints**
   - `GET /states` → `{ "states": ["Andhra Pradesh", ...] }`
   - `POST /predict` → returns ML, lifestyle, NFHS, and final scores

### Render Deployment Tips

- **Build command:** `pip install -r backend/requirements.txt`
- **Start command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
- Ensure the `data/` directory (with model + NFHS CSV) is available to the Render service (mount as persistent disk or bake into repo).

## Frontend (React + Vite)

1. **Install deps & run**
   ```bash
   cd /Users/akshata/Desktop/Project/Pregnancy\ Risk\ Calculator/frontend
   npm install
   npm run dev
   ```
2. **Environment**
   - `VITE_API_URL` → base URL of the FastAPI service (default `http://localhost:8000`). Add this in `.env` or project settings on Vercel.
3. **Build**
   ```bash
   npm run build
   npm run preview
   ```

### Vercel Deployment Tips

- Framework preset: **Vite** (auto-detected)
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://<your-render-backend>`

## Feature Checklist

- Clinical vitals, lifestyle, and NFHS state selection forms grouped in cards
- Random test-case generator cycling through balanced low/moderate/high presets
- Result card with color-coded category badges and breakdown for ML / Lifestyle / NFHS contributions
- Backend scoring: ML score (≤60), lifestyle (≤20), NFHS (≤20) with final categorisation (0–30 Low, 31–60 Moderate, 61–100 High)

## Testing

- **Backend:** use `uvicorn` locally, then call `GET /states` and `POST /predict` via `curl` or Thunder Client.
- **Frontend:** `npm run dev` and ensure random generator + API calls work.

## Notes

- If `/mnt/data/stacking_model_v2.joblib` exists (e.g., Render persistent storage), it is preferred; otherwise the bundled `data/stacking_model.joblib` is used.
- NFHS indicators are averaged per state (all available Urban/Rural rows) and converted into a 0–20 contextual score.
