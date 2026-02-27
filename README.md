# DataLens

A web-based data analytics tool that lets users upload CSV files and analyze them using natural language queries powered by Google Gemini AI.

## Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env     # Then add your GEMINI_API_KEY
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Tech Stack

- **Frontend:** React + TypeScript, Vite, TailwindCSS, Recharts
- **Backend:** Python, FastAPI, pandas, numpy
- **AI:** Google Gemini API (gemini-2.0-flash)
