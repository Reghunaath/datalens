# CLAUDE.md — DataLens

## 1. Tech Stack

- **Frontend:** React with TypeScript, Vite for bundling, TailwindCSS for styling.
- **Backend:** Python 3.11+, FastAPI.
- **Data Processing:** pandas, numpy.
- **AI:** Google Gemini API (gemini-3.1-pro-preview model) for code generation.
- **Charting:** Recharts for frontend chart rendering.
- **Icons:** Material Symbols Outlined (Google Fonts).
- **Font:** Inter (Google Fonts).
- **HTTP Client:** Axios.
- **Session Storage:** In-memory Python dict. No database.

## 2. Project Structure

Two separate directories: `frontend/` and `backend/`. Not a monorepo.

- `frontend/` is a standard Vite + React project.
- `backend/` is a FastAPI project with an `app/` package.
- Running the project requires two terminal windows: one for `npm run dev` in `frontend/`, one for `uvicorn app.main:app --reload` in `backend/`.
- `.env` file lives in `backend/` and contains `GEMINI_API_KEY`.
- No database. No file persistence. Everything lives in memory for the session.

Refer to the PRD Section 6.3 for the exact folder structure. Follow it exactly.

## 3. PRD Is the Source of Truth

The file `PRD.md` in the project root contains all product requirements.

Follow the PRD exactly. Do not add features, screens, or UI elements not described in the PRD.

⚠️ **IMPORTANT:** If you need to deviate from the PRD for any reason (technical limitation, ambiguity, better approach), STOP and inform me in highlighted text before proceeding. Do not silently deviate.

⚠️ **IMPORTANT:** If any requirement in the PRD is unclear or missing detail, ASK me a clarifying question before implementing. Do not guess.

## 4. Code Quality

- All frontend code must be TypeScript. No `.js` or `.jsx` files. Use `.ts` and `.tsx` only.
- No `any` types unless absolutely necessary and documented with a comment explaining why.
- Use interfaces/types for all API request/response shapes, result objects, and component props. Define these in `src/types/index.ts`.
- Keep components small and focused. One component per file.
- Use custom hooks for shared logic (API calls, state management).
- Use concise variable names in dense logic but descriptive names for props, state, and functions.
- Backend code should have clear separation: routes handle HTTP, services handle logic, utils handle helpers.
- All API request/response shapes should match the PRD Section 6.4 exactly.
- Python code should follow PEP 8. Use type hints for function signatures.
- No unused imports, no commented-out code, no console.log statements in final output.

## 5. UI/UX Rules

Match the reference HTML files (Stitch-generated UI) exactly. The visual reference is the final authority on layout, spacing, and styling.

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `primary` | `#135bec` | Accent buttons, active states, chart highlights |
| `background-dark` | `#111318` | Page background (Analysis Screen). In Tailwind config, this is the single `background-dark` value. |
| `background-upload` | `#101622` | Page background (Upload Screen only). Use as inline style or a separate Tailwind token. |
| `surface-dark` | `#181b22` | Card backgrounds, input bar background |
| `border-dark` | `#282e39` | Card borders, dividers |
| Upload drop zone bg | `#1a202e` | Drop zone background (from reference HTML) |
| Upload drop zone hover | `#1f2636` | Drop zone hover background (from reference HTML) |
| Disabled input bar bg | `#151b28` | Input bar background on Upload Screen (from reference HTML) |
| Disabled EDA/send bg | `#20293a` | EDA button and send button bg in disabled state (from reference HTML) |
| `emerald-500` | Tailwind default | Positive indicators |
| `amber-500` | Tailwind default | Warning indicators |

### Typography

- Font: Inter, loaded via Google Fonts.
- App title: 4xl, font-black, tracking-tight.
- Card headings: lg, font-semibold.
- Card labels: xs, font-semibold, uppercase, tracking-wider.
- Body text: sm, leading-relaxed.
- Table headers: xs, uppercase, font-semibold, slate-500.
- Numbers in tables: font-mono.

### General Rules

- Dark mode only. No light mode.
- All cards use: `bg-surface-dark border border-border-dark rounded-xl p-6`.
- Every screen must handle: loading state, error state, empty state, and populated state.
- All interactive elements need hover states.
- Generous whitespace. Do not crowd elements.
- Bottom input bar is always visible and fixed to the bottom.
- Charts must use the color palette from PRD Section 6.2. Never use default Recharts colors.

## 6. API and Data

- All API routes are defined in PRD Section 6.4. Follow the exact request/response shapes.
- CORS must be configured to allow requests from the frontend's localhost port.
- File uploads via multipart/form-data. Max 10MB. CSV only.
- Session state is a single Python dict in memory. No database, no Redis, no file-based storage.
- Conversation history is stored in the session dict and sent with every LLM request. Format: `{"role": "user"|"assistant", "content": "string"}`.
- LLM prompts are defined in PRD Section 6.5. Use them exactly, including the chart color hex codes.
- Generated Python code is executed via `exec()` with a restricted globals dict. No sandboxing for MVP.
- Code execution has a 30-second timeout. Enforce it.
- On code execution failure, retry once with the error message appended to the prompt. If the retry also fails, show the user-friendly error.

## 7. Build Order

Follow this exact order. Complete each step fully before moving to the next.

⚠️ **IMPORTANT:** After completing each step, restart the client and server, then STOP and inform me what was done. Wait for my approval before starting the next step. Do not proceed to the next step without my explicit go-ahead.

1. **Project scaffolding** — Vite + React + TypeScript + Tailwind frontend, FastAPI backend, folder structure, health check, Upload Screen static UI with disabled input bar.
2. **CSV upload (backend)** — Session manager, CSV parser, POST /upload endpoint with validation.
3. **CSV upload (frontend)** — Wire upload UI, build Analysis Screen shell (TopBar, InputBar, empty ResultsFeed).
4. **LLM integration (backend)** — Gemini API connection, query prompt builder, test with hardcoded query.
5. **Code execution (backend)** — Executor with timeout, error handling, restricted globals.
6. **Query endpoint (backend)** — POST /query wiring everything together, response formatter, conversation history.
7. **Result cards (frontend)** — InsightCard, TableCard, wire input to /query, render results feed.
8. **Chart rendering (frontend)** — ChartRenderer, ChartCard, dark theme styling, side-by-side layout.
9. **EDA feature** — EDA prompt, POST /eda endpoint, wire EDA MODE button.
10. **Polish** — Download CSV, Upload New with confirmation, disabled states, error states, cleanup.

Refer to PRD Section 10 for detailed acceptance criteria for each step.

## 8. Do NOT Build

- User authentication or accounts
- Multiple simultaneous datasets
- File formats other than CSV
- Cloud deployment configuration
- Persistent storage or database
- Collaborative features
- Export to PDF/image
- Custom chart styling UI
- Docker sandboxing
- Rate limiting
- Usage analytics
- Recent uploads history
- Chart filter dropdowns (e.g., "This Year" / "Last Year" — present in reference HTML but out of scope)
- "View All" buttons on tables (present in reference HTML but out of scope)
- Three-dot "more options" button on cards (present in reference HTML but non-functional/decorative — omit entirely)
- Light mode
- Settings page
- User avatar or profile icon

## 9. File Management

- Keep `README.md` updated with setup instructions and how to run both frontend and backend.
- `.env.example` in `backend/` must list `GEMINI_API_KEY=your_key_here`.
- `requirements.txt` in `backend/` must list all Python dependencies with pinned versions.
- `package.json` in `frontend/` must have all JS dependencies.
- `.gitignore`: `node_modules/`, `__pycache__/`, `.env`, `*.pyc`, `dist/`, `.venv/`.

## 10. Chart Colors

This is critical. Every chart rendered in the app must use these colors. Never use Recharts defaults.

```
Primary series:    #135bec (blue)
Secondary series:  #10b981 (emerald)
Tertiary series:   #f59e0b (amber)
Quaternary series: #8b5cf6 (violet)
Additional series: #ec4899 (pink)
Grid lines:        #282e39
Axis labels:       #64748b
Tooltip background:#1e293b
Tooltip text:      #ffffff
Tooltip border:    #282e39
```

These hex values must appear in both the LLM prompt templates (so the generated code outputs them) and in the Recharts component styling (as fallback/override).
