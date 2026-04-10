# Product Requirements Document: Data Analytics Tool

## 1. Product Summary

A web-based data analytics tool that lets users upload CSV files and analyze them using natural language. Users type plain English queries, the system generates Python code via the Gemini API, executes it, and returns results as text, tables, or interactive charts. No coding knowledge required.

**Local deployment only.** Runs on the developer's machine. No cloud hosting, no auth, no multi-tenancy.

---

## 2. Target Users

- Business analysts who understand data concepts but cannot write code
- Students and researchers with some technical literacy
- Non-technical users (managers, small business owners) who want quick insights from their data

The interface must be approachable enough for the least technical user in this group while not feeling patronizing to the most technical.

---

## 3. Core User Flow

1. User opens the app in their browser (localhost)
2. User sees the Upload Screen with a drag-and-drop zone, and a disabled input bar at the bottom
3. User uploads a CSV file (max 10MB)
4. App transitions to the Analysis Screen showing file info in the top bar
5. The bottom input bar becomes active
6. User types a natural language query (e.g., "show me sales by region")
7. App sends the query + dataset context to Gemini API
8. Gemini returns Python code
9. Backend executes the code
10. Results render in the main content area as a vertical feed of cards (text insights, charts, tables)
11. User can ask follow-up questions (conversation context is maintained)
12. User can click "EDA MODE" for automated exploratory analysis
13. User can download the current (possibly modified) dataset at any time

---

## 4. Functional Requirements

### 4.1 CSV Upload

| Requirement | Detail |
|---|---|
| Upload method | Drag-and-drop zone + "Browse files" button |
| Max file size | 10MB |
| Accepted format | `.csv` only |
| On upload | Store original file in backend session. Transition to Analysis Screen. Display file name, row count, and column count in the top bar. |
| Validation | Reject non-CSV files. Reject files over 10MB. Show clear error messages for both cases. |
| Re-upload | "Upload New" button in the top bar. Clears current session (dataset, conversation history, modified data). Confirm with the user before clearing. Returns to Upload Screen. |

### 4.2 Natural Language Query Interface

| Requirement | Detail |
|---|---|
| Input | Fixed bottom input bar. Pill-shaped container with rounded-full corners. Contains: "EDA MODE" button on the left, text input in the center, circular send button on the right. |
| Disabled state | On the Upload Screen, the entire bottom bar appears dimmed (50% opacity, grayscale) with all elements disabled. Placeholder text: "Upload a CSV to start asking questions..." |
| Active state | On the Analysis Screen, the bar is fully active. Placeholder text: "Ask a question about your data (e.g., 'Show me sales trends for Q3')" |
| Display | Results appear as a vertical feed of full-width cards in the main content area (not chat bubbles). |
| Response types | Text insight cards, table cards, chart cards, or any combination. |
| Loading state | Show a loading indicator while the query is being processed. Disable the input field during processing. |
| Error display | If code execution fails, show a user-friendly error in a text card. Log the full error on the backend. |
| Disclaimer | Below the input bar, display: "DataLens AI can make mistakes. Verify important insights." in 10px muted text. |

### 4.3 Exploratory Data Analysis (EDA)

| Requirement | Detail |
|---|---|
| Trigger | "EDA MODE" pill button inside the bottom input bar. Only enabled after a CSV is uploaded. |
| Behavior | Single LLM call. Prompt asks Gemini to generate Python code for a comprehensive EDA: summary statistics, distributions of numeric columns, correlation matrix, value counts for categorical columns, missing data summary, and notable patterns. |
| Output | All results displayed as multiple cards in the main content feed. |
| Conversation | The EDA results are added to the conversation history so the user can ask follow-up questions about them. |

### 4.4 Dataset Versioning

| Requirement | Detail |
|---|---|
| Versions stored | Two only: original (as uploaded) and current (latest modified version). |
| Modification | If a user query modifies the dataset (e.g., "remove all rows where sales < 0"), the current version updates. |
| Download | "Download CSV" button in the top bar. Downloads the current version. If no modifications have been made, downloads the original. |
| No undo | No rollback to intermediate states. User can re-upload the original file if needed. |

### 4.5 Session Management

| Requirement | Detail |
|---|---|
| Storage | In-memory on the backend. No database. |
| Session lifetime | Lasts as long as the backend server is running. No timeout. |
| Concurrency | Single user assumed. No session isolation needed. |
| State | Stores: original CSV (pandas DataFrame), current CSV (pandas DataFrame), conversation history (list of `{"role": "user"|"assistant", "content": "string"}` objects). |

---

## 5. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| Query response time | Target under 15 seconds end-to-end for a typical query (depends on Gemini API latency). |
| Code execution timeout | 30-second hard timeout per execution. Kill the process and return an error if exceeded. |
| Memory limit | Reject datasets that cause pandas to consume more than 500MB of memory. |
| Browser support | Modern browsers (Chrome, Firefox, Edge). No IE support. |
| Responsive design | Desktop-first. Functional on tablet. Mobile not required. |

---

## 6. Technical Architecture

### 6.1 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React with TypeScript (Vite for build tooling) |
| Styling | Tailwind CSS |
| Font | Inter (Google Fonts) |
| Icons | Material Symbols Outlined (Google Fonts) |
| Charting | Recharts (React-native, composable, good defaults) |
| HTTP client | Axios |
| Backend | Python 3.11+, FastAPI |
| Data processing | pandas, numpy |
| LLM | Google Gemini API (gemini-3.1-pro-preview model) |
| Session storage | In-memory (Python dict) |
| CORS | fastapi-cors middleware (allow localhost origins) |

### 6.2 Design System

All colors, spacing, and styles must match the reference UI. Here are the exact design tokens.

#### Colors

| Token | Value | Usage |
|---|---|---|
| `primary` | `#135bec` | Accent buttons, active states, chart highlights, EDA MODE button background |
| `background-dark` | `#111318` | Page background (Analysis Screen). This is the Tailwind config value. |
| `background-upload` | `#101622` | Page background (Upload Screen only). Separate token or inline style. |
| `surface-dark` | `#181b22` | Card backgrounds, input bar background |
| `border-dark` | `#282e39` | Card borders, dividers, top bar border |
| Upload drop zone bg | `#1a202e` | Drop zone background (from reference HTML) |
| Upload drop zone hover | `#1f2636` | Drop zone hover background (from reference HTML) |
| Disabled input bar bg | `#151b28` | Input bar background on Upload Screen (from reference HTML) |
| Disabled EDA/send bg | `#20293a` | EDA button and send button background in disabled state (from reference HTML) |
| `emerald-500` | Tailwind default | Positive indicators (growth %, success status) |
| `amber-500` | Tailwind default | Warning indicators (churn risk, caution) |
| Text: white | `#ffffff` | Headings, primary data |
| Text: slate-300 | Tailwind default | Card titles, secondary text |
| Text: slate-400 | Tailwind default | Body text inside cards |
| Text: slate-500 | Tailwind default | Muted text, placeholders, axis labels |

#### Typography

| Element | Style |
|---|---|
| App title (upload) | 4xl, font-black, tracking-tight |
| Card headings | lg, font-semibold |
| Card subtitles/labels | xs, font-semibold, uppercase, tracking-wider |
| Body text | sm, leading-relaxed |
| Table headers | xs, uppercase, font-semibold, slate-500 |
| Table data | sm, slate-300. Font-mono for numbers. |
| Stat numbers | 2xl, font-bold, white |

#### Card Styles

All cards use: `bg-surface-dark border border-border-dark rounded-xl p-6`.

#### Chart Color Scheme

When generating charts via the LLM, the backend must instruct the LLM to use these colors so charts match the UI theme:

| Purpose | Color |
|---|---|
| Primary data series | `#135bec` (primary blue) |
| Secondary data series | `#10b981` (emerald-500) |
| Tertiary data series | `#f59e0b` (amber-500) |
| Quaternary data series | `#8b5cf6` (violet-500) |
| Additional series | `#ec4899` (pink-500) |
| Chart background | Transparent (inherits card background) |
| Grid lines | `#282e39` (border-dark) |
| Axis labels | `#64748b` (slate-500) |
| Tooltip background | `#1e293b` (slate-800) |
| Tooltip text | `#ffffff` (white) |
| Tooltip border | `#282e39` (border-dark) |

### 6.3 Project Structure

```
project-root/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.tsx        # Drag-and-drop zone + file picker
│   │   │   ├── AnalysisScreen.tsx    # Main analysis layout
│   │   │   ├── TopBar.tsx            # File info + Upload New / Download buttons
│   │   │   ├── InputBar.tsx          # Fixed bottom bar (EDA + input + send)
│   │   │   ├── ResultsFeed.tsx       # Scrollable vertical feed of result cards
│   │   │   ├── InsightCard.tsx       # Text insight with left accent border
│   │   │   ├── ChartCard.tsx         # Chart container with title + optional stat
│   │   │   ├── TableCard.tsx         # Data table with header
│   │   │   ├── ChartRenderer.tsx     # Maps chart_type to Recharts component
│   │   │   └── LoadingIndicator.tsx  # Shown while query is processing
│   │   ├── services/
│   │   │   └── api.ts                # Axios instance + API calls
│   │   ├── types/
│   │   │   └── index.ts              # Shared TypeScript interfaces (API responses, result types, props)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── vite.config.ts
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI app, CORS, route mounting
│   │   ├── routes/
│   │   │   ├── upload.py             # POST /upload
│   │   │   ├── query.py              # POST /query
│   │   │   └── eda.py                # POST /eda
│   │   ├── services/
│   │   │   ├── llm_service.py        # Gemini API integration
│   │   │   ├── code_executor.py      # Executes LLM-generated Python code
│   │   │   └── session_manager.py    # In-memory session state
│   │   ├── prompts/
│   │   │   ├── query_prompt.py       # Prompt template for user queries
│   │   │   └── eda_prompt.py         # Prompt template for EDA
│   │   └── utils/
│   │       ├── csv_parser.py         # CSV validation + parsing
│   │       └── response_formatter.py # Formats execution results for frontend
│   ├── requirements.txt
│   └── .env                          # GEMINI_API_KEY
├── .gitignore
└── README.md
```

### 6.4 API Endpoints

#### `POST /upload`

Upload a CSV file.

**Request:** `multipart/form-data` with a single file field named `file`.

**Response (200):**
```json
{
  "status": "success",
  "filename": "sales_data.csv",
  "rows": 1500,
  "columns": 12,
  "column_info": [
    {"name": "date", "dtype": "object", "sample_values": ["2024-01-01", "2024-01-02"]},
    {"name": "revenue", "dtype": "float64", "sample_values": [1200.50, 980.00]}
  ],
  "preview": [[...], [...], [...], [...], [...]]
}
```

**Error responses:**
- `400` — File is not a CSV, file exceeds 10MB, or file cannot be parsed.
- `500` — Internal server error.

#### `POST /query`

Send a natural language query.

**Request:**
```json
{
  "query": "show me monthly revenue trends"
}
```

**Response (200):**
```json
{
  "status": "success",
  "results": [
    {
      "type": "insight",
      "variant": "info",
      "title": "Revenue Spike Detected",
      "content": "Unexpected 15% increase in North American sales during Q3."
    },
    {
      "type": "chart",
      "chart_type": "bar",
      "title": "Revenue by Region",
      "subtitle": "Comparing Q3 performance across major markets",
      "summary_stat": {"value": "$4.2M", "change": "+12%", "trend": "up"},
      "data": {
        "labels": ["North", "South", "East", "West", "EMEA"],
        "datasets": [
          {
            "label": "Revenue",
            "data": [1200000, 2400000, 4200000, 1800000, 800000],
            "colors": ["#135bec"]
          }
        ]
      },
      "options": {
        "xAxisLabel": "Region",
        "yAxisLabel": "Revenue ($)"
      }
    },
    {
      "type": "table",
      "title": "Recent Transactions",
      "headers": ["Date", "Product", "Region", "Amount", "Status"],
      "rows": [
        ["Oct 24, 2023", "Enterprise Plan", "North America", "$2,499.00", "active"],
        ["Oct 23, 2023", "Pro License (x5)", "Europe", "$495.00", "active"]
      ]
    }
  ],
  "dataset_modified": false
}
```

**Note on `insight` type:** The `variant` field controls the accent color of the left border and icon:
- `"info"` — primary blue (#135bec), sparkle icon
- `"warning"` — amber (#f59e0b), lightbulb icon
- `"success"` — emerald (#10b981), check icon

**Error responses:**
- `400` — No dataset uploaded yet, or empty query.
- `500` — Code execution failed or Gemini API error.

#### `POST /eda`

Run automated EDA.

**Request:** Empty body (uses the current session's dataset).

**Response:** Same structure as `/query` but typically contains multiple result objects (several charts, tables, and insight cards).

#### `GET /download`

Download the current version of the dataset.

**Response:** CSV file download. `Content-Disposition: attachment; filename="modified_data.csv"`. Returns the original if no modifications have been made.

### 6.5 LLM Integration

#### Prompt Structure for `/query`

```
You are a data analysis assistant. The user has uploaded a CSV dataset. Generate Python code to answer their query.

DATASET SCHEMA:
{column_info_json}

SAMPLE DATA (first 3 rows):
{sample_rows_json}

BASIC STATISTICS:
{basic_stats_json}

CONVERSATION HISTORY:
{conversation_history}

USER QUERY: {user_query}

INSTRUCTIONS:
- Use pandas. The DataFrame is available as `df`.
- Return a Python list of result objects. Assign it to a variable called `results`.
- If the query requires modifying the dataset, modify `df` in place and set `dataset_modified = True`. Otherwise set `dataset_modified = False`.
- Do not use print statements. Do not import pandas (it is already imported).
- Handle potential errors in the data (missing values, wrong types) gracefully.

RESULT OBJECT FORMATS:

For text insights, return:
{"type": "insight", "variant": "info|warning|success", "title": "Short title", "content": "Detailed explanation"}
- Use "info" for neutral observations, "warning" for risks or concerns, "success" for positive findings.

For charts, return:
{"type": "chart", "chart_type": "line|bar|pie|scatter|area", "title": "Chart Title", "subtitle": "Optional description", "summary_stat": {"value": "$4.2M", "change": "+12%", "trend": "up|down|neutral"}, "data": {"labels": [...], "datasets": [{"label": "...", "data": [...], "colors": ["#135bec"]}]}, "options": {"xAxisLabel": "...", "yAxisLabel": "..."}}
- summary_stat is optional. Only include when a single headline number is meaningful.
- For colors, use these in order: #135bec (blue), #10b981 (green), #f59e0b (amber), #8b5cf6 (violet), #ec4899 (pink).

For tables, return:
{"type": "table", "title": "Table Title", "headers": [...], "rows": [[...], ...]}
- Format numbers with commas and currency symbols where appropriate.
- Keep tables to 10 rows or fewer. If more data exists, show the most relevant rows and add an insight noting the full count.
```

#### Prompt Structure for `/eda`

```
You are a data analysis assistant. Perform a comprehensive exploratory data analysis on the given dataset. Generate Python code that produces multiple result objects.

DATASET SCHEMA:
{column_info_json}

SAMPLE DATA (first 3 rows):
{sample_rows_json}

BASIC STATISTICS:
{basic_stats_json}

INSTRUCTIONS:
- Use pandas. The DataFrame is available as `df`.
- Generate results for ALL of the following:
  1. Summary statistics (as a table)
  2. Missing values summary (as an insight or table)
  3. Distribution of each numeric column (as bar charts)
  4. Correlation matrix for numeric columns (as a table)
  5. Value counts for categorical columns with fewer than 20 unique values (as bar charts)
  6. Any notable patterns or outliers (as insight cards)
- Return a Python list of result objects. Assign it to `results`.
- Set `dataset_modified = False`.
- Use the same result object formats as regular queries (insight, chart, table).
- For chart colors, use these in order: #135bec, #10b981, #f59e0b, #8b5cf6, #ec4899.
```

### 6.6 Code Execution

The `code_executor.py` service runs LLM-generated Python code.

| Concern | Implementation |
|---|---|
| Execution method | `exec()` with a restricted globals dict containing only `pandas`, `numpy`, `json`, and the `df` variable. |
| Timeout | Use `signal.alarm(30)` (Unix) or `threading.Timer` (cross-platform) to enforce a 30-second limit. |
| Output capture | After `exec()`, read `results` and `dataset_modified` from the local scope. |
| Error handling | Wrap in try/except. On failure, return a user-friendly error message. Log the full traceback. On code generation failure, retry once with the error message appended to the prompt. If retry also fails, return the user-friendly error. |
| Security | MVP accepts the risk of running arbitrary code locally. No sandboxing. Add a comment/TODO for future Docker-based sandboxing. |

### 6.7 Response Formatting

The `response_formatter.py` service normalizes execution output before sending to the frontend.

- Validate that each result object has a valid `type` field ("insight", "chart", or "table").
- For insights, validate `variant` is one of "info", "warning", "success". Default to "info".
- For charts, validate that `chart_type` is one of the supported types (line, bar, pie, scatter, area).
- Strip any unexpected fields.
- If `dataset_modified` is true, update the session's current DataFrame.

---

## 7. UI Specification

The frontend must match the reference HTML provided by the Stitch-generated design. The exact Tailwind config, color tokens, and component structure are defined in the reference HTML files.

### 7.1 Screen: Upload

- Centered layout, vertically and horizontally
- App logo (Material Symbol: `analytics`) + title "DataLens" (4xl, font-black)
- Subtitle in muted text
- Drag-and-drop zone: dashed border (`border-2 border-dashed`), rounded-xl, hover state changes border to primary color
- Upload cloud icon in a circular container
- "Browse files" pill button in primary color
- "Max file size: 10MB" in xs uppercase muted text below the zone
- Fixed bottom input bar: identical to Analysis Screen bar but with 50% opacity and grayscale filter applied. All elements disabled.

### 7.2 Screen: Analysis

**Top bar:**
- Left: DataLens icon + name, vertical divider, filename, row count, column count (all in muted text)
- Right: "Upload New" and "Download CSV" ghost buttons with icons
- Bottom border in border-dark

**Main content area:**
- Centered column, max-width 960px, scrollable
- Vertical feed of result cards with 24px (gap-6) spacing
- Padded bottom (pb-32) to account for fixed input bar

**Result card types:**

1. **Insight Card** (`InsightCard.jsx`)
   - Left accent border (4px wide): primary blue for info, amber for warning, emerald for success
   - Icon in a circular tinted background (matches variant color)
   - Label text: variant name in uppercase (e.g., "AI INSIGHT"), colored to match variant
   - Title: lg, font-semibold, slate-100
   - Body: sm, slate-400, max-w-2xl

2. **Chart Card** (`ChartCard.jsx`)
   - Title: base, font-medium, slate-300
   - Optional subtitle below title
   - Optional summary stat in top-right: value in 2xl font-bold white, change badge with trend icon in emerald (up) or red (down) tinted background
   - Recharts component rendered below, responsive to card width
   - Tooltip styled with slate-800 background, white text, border-dark border

3. **Table Card** (`TableCard.jsx`)
   - Title in header row with border-b separator
   - Column headers: xs, uppercase, font-semibold, slate-500
   - Rows: sm, slate-300, alternating subtle background (background-dark/20)
   - Hover state on rows (white/5 background)
   - Numbers in font-mono

4. **Side-by-side layout:** When two smaller charts are returned consecutively, render them in a 2-column grid (`grid grid-cols-1 md:grid-cols-2 gap-6`). The LLM can signal this by adding `"layout": "half"` to chart objects.

**Bottom input bar:**
- Fixed to bottom, centered, max-width 800px
- Pill-shaped container: `rounded-full`, surface-dark background with backdrop-blur, border-dark border, ring-1 ring-white/10, shadow-2xl
- "EDA MODE" button: primary/20 background, primary text, rounded-full, xs font-bold, with science icon. Follow the Analysis Screen reference HTML for active styling. Disabled state uses `#20293a` bg with green dot (per Upload Screen reference HTML).
- Text input: transparent background, no border, sm text, slate-200 text, slate-500 placeholder
- Send button: circular, primary background, white arrow_upward icon, shadow glow (shadow-primary/40)
- Disclaimer text below: 10px, slate-500, centered

---

## 8. Error Handling

| Scenario | Behavior |
|---|---|
| Non-CSV file uploaded | Reject with message: "Please upload a CSV file." |
| File over 10MB | Reject with message: "File size exceeds the 10MB limit." |
| CSV parsing fails | Reject with message: "Could not parse the file. Please check the CSV format." |
| No dataset uploaded when querying | Return message: "Please upload a CSV file first." |
| Gemini API error (rate limit, network) | Show an insight card (variant: warning) with message: "Something went wrong connecting to the AI service. Please try again." Log full error. |
| Generated code fails to execute | Retry once with the error appended to the prompt. If retry also fails, show an insight card (variant: warning) with message: "I had trouble processing that query. Could you try rephrasing it?" Log the error + generated code. |
| Execution timeout (>30s) | Kill execution. Show an insight card (variant: warning) with message: "That query took too long to process. Try a simpler question or work with a smaller dataset." |
| Empty query submitted | Prevent submission on frontend. If it reaches backend, return 400. |

---

## 9. MVP Scope Boundaries

### In Scope
- Single CSV upload and analysis
- Natural language querying with conversation context
- One-click EDA
- Chart rendering (line, bar, pie, scatter, area) in the dark theme color palette
- Table rendering with dark theme styling
- Text insight cards with variant-based styling
- Side-by-side chart layout support
- Dataset download
- Basic error handling
- "DataLens AI can make mistakes" disclaimer

### Explicitly Out of Scope
- User authentication
- Multiple simultaneous datasets
- File formats other than CSV (Excel, JSON, Parquet)
- Cloud deployment
- Persistent storage / database
- Collaborative features
- Export to PDF/image
- Custom chart styling by the user
- Docker sandboxing for code execution
- Rate limiting
- Usage analytics
- Recent uploads history
- Chart filter dropdowns (e.g., "This Year" / "Last Year" — present in reference HTML, omit)
- "View All" buttons on tables (present in reference HTML, omit)
- Three-dot "more options" button on cards (present in reference HTML, omit entirely)

---

## 10. Build Order

Each step is a self-contained deliverable. Build one step at a time. Stop after each step and wait for validation before proceeding.

### Step 1: Project Scaffolding

Set up both projects with all dependencies installed and a basic health check.

- Initialize React frontend with Vite using the React + TypeScript template. Install axios, recharts, and tailwindcss.
- Configure Tailwind with the exact design tokens from Section 6.2 (colors, fonts, border-radius).
- Add Inter font and Material Symbols Outlined via Google Fonts links in `index.html`.
- Initialize FastAPI backend. Install fastapi, uvicorn, pandas, numpy, python-dotenv.
- Set up CORS middleware on the backend to allow requests from the frontend's localhost port.
- Create the folder structure exactly as defined in Section 6.3.
- Frontend: Render the Upload Screen with the DataLens title, subtitle, and drag-and-drop zone matching the reference HTML. Include the disabled bottom input bar at 50% opacity with grayscale. No functionality yet, just the static UI.
- Backend: Create a `GET /health` endpoint that returns `{"status": "ok"}`.
- Frontend should successfully call `/health` and log the response to the console.

**Validate:** Both servers run. Frontend loads in the browser and visually matches the reference Upload Screen. Health check call works.

---

### Step 2: CSV Upload (Backend)

Build the upload endpoint and session storage.

- Implement `session_manager.py` — stores original DataFrame, current DataFrame, and conversation history in a Python dict (single-session, in-memory).
- Implement `csv_parser.py` — validates file is CSV, checks size limit (10MB), parses with pandas, extracts column info (name, dtype, sample values) and row count.
- Implement `POST /upload` endpoint with the exact request/response format from Section 6.4.
- Handle all error cases: non-CSV, oversized, unparseable.
- On successful upload, store the DataFrame in session and return file metadata.

**Validate:** Test with curl or Postman. Upload a valid CSV and get back correct metadata. Upload a non-CSV and get a 400 error. Upload a large file and get a 400 error.

---

### Step 3: CSV Upload (Frontend)

Connect the upload UI to the backend and build the Analysis Screen shell.

- Wire `FileUpload.tsx` to call `POST /upload` via axios on file drop or file pick.
- On success, store the response metadata in React state and transition to the Analysis Screen.
- On error, display the error message to the user.
- Build `AnalysisScreen.tsx` as the main layout container.
- Build `TopBar.tsx` matching the reference HTML: DataLens icon + name, divider, filename/rows/columns from the upload response, "Upload New" and "Download CSV" ghost buttons.
- Build `InputBar.tsx` matching the reference HTML: EDA MODE pill, text input, send button. Active state (full opacity, enabled). Disclaimer text below.
- Build `ResultsFeed.tsx` as an empty scrollable container.
- The bottom input bar should not do anything yet, just render.

**Validate:** Upload a CSV through the browser. See the Analysis Screen with correct file info in the top bar. Bottom input bar is visible and active-looking. Try uploading a bad file and see the error.

---

### Step 4: LLM Integration (Backend)

Connect to Gemini and get code generation working.

- Set up `.env` with `GEMINI_API_KEY`.
- Implement `llm_service.py` — sends prompts to the Gemini API and returns the generated Python code as a string. Use `gemini-2.0-flash`.
- Implement `query_prompt.py` — builds the full prompt using the template from Section 6.5, injecting dataset schema, sample data, basic stats, conversation history, and the user query. Include the chart color palette instructions.
- Test with a hardcoded query (not wired to the endpoint yet). Verify the LLM returns valid Python code.

**Validate:** Run a test script that sends a sample query about a test CSV to Gemini and prints the generated code. Confirm the code looks correct and uses the expected output format (insight/chart/table objects with correct color values).

---

### Step 5: Code Execution (Backend)

Build the executor that safely runs LLM-generated code.

- Implement `code_executor.py` — takes a code string, executes it with `exec()` using a restricted globals dict (pandas, numpy, json, and the df variable). Reads `results` and `dataset_modified` from the local scope after execution.
- Add 30-second timeout.
- Add try/except error handling. On failure, return a structured error as an insight card with variant "warning".
- If `dataset_modified` is true, update the current DataFrame in session.

**Validate:** Manually pass in a few Python code snippets (both valid and broken). Verify correct results come back, errors are caught cleanly, and timeout works.

---

### Step 6: Query Endpoint (Backend)

Wire everything together for `/query`.

- Implement `POST /query` endpoint — receives user query, builds prompt via `query_prompt.py`, calls `llm_service.py`, passes generated code to `code_executor.py`, formats the result via `response_formatter.py`.
- Implement `response_formatter.py` — validates each result object has a valid type and variant, strips unexpected fields, normalizes chart configs, ensures colors match the design system.
- Add the user message and system response to conversation history in session.
- Handle all error cases from Section 8.

**Validate:** Test with curl. Send a natural language query and get back a properly formatted JSON response with results that include correct types, variants, and color values.

---

### Step 7: Result Cards (Frontend)

Build the result card components and connect to the query endpoint.

- Build `InsightCard.tsx` — renders text insights with left accent border, icon, label, title, and body. Variant prop controls colors (info=blue, warning=amber, success=emerald). Match the reference HTML structure exactly.
- Build `TableCard.tsx` — renders tables with title header, uppercase column headers, alternating row backgrounds, hover states, and font-mono for numbers. Match the reference HTML.
- Wire `InputBar.tsx` to call `POST /query`. Display a loading indicator while waiting.
- Render results in `ResultsFeed.tsx` by mapping each result object to the appropriate card component.
- For now, render chart results as a placeholder card showing the chart title (chart rendering comes next step).

**Validate:** Upload a CSV, type a question, see insight and table cards render correctly with proper styling. Follow-up questions maintain context.

---

### Step 8: Chart Rendering (Frontend)

Add visualization support.

- Build `ChartRenderer.tsx` — receives chart config and maps `chart_type` to the correct Recharts component (LineChart, BarChart, PieChart, ScatterChart, AreaChart).
- Apply the design system colors: primary blue for first series, emerald for second, amber for third, etc.
- Style tooltips: slate-800 background, white text, border-dark border.
- Style grid lines in border-dark color. Axis labels in slate-500.
- Make all charts responsive to container width.
- Build `ChartCard.tsx` — wraps ChartRenderer with title, optional subtitle, and optional summary stat badge (value + change with trend icon).
- Support side-by-side layout: when a result has `"layout": "half"`, render consecutive half-width cards in a 2-column grid.
- Handle edge cases: empty data, single data point, missing labels.

**Validate:** Ask questions that produce charts. Confirm charts render with correct colors matching the dark theme, tooltips work, and the side-by-side layout functions.

---

### Step 9: EDA Feature

Build the one-click EDA flow.

- Implement `eda_prompt.py` — builds the EDA prompt from Section 6.5. Include color palette instructions.
- Implement `POST /eda` endpoint — uses the EDA prompt, executes the code, returns multiple result objects.
- Wire the EDA MODE button in `InputBar.tsx` to call `POST /eda`. Display loading state.
- Display all results (multiple insight cards, charts, tables) in the results feed.
- Add EDA results to conversation history so users can follow up.

**Validate:** Upload a CSV, click EDA MODE. See a comprehensive set of insight cards, charts, and tables render with correct styling. Ask a follow-up question referencing the EDA results.

---

### Step 10: Download, Re-upload, and Polish

Final features and cleanup.

- Implement `GET /download` endpoint — returns the current DataFrame as a CSV file download.
- Wire the "Download CSV" button in `TopBar.tsx`.
- Wire the "Upload New" button — show a confirmation dialog, then clear session state, reset frontend to the Upload Screen.
- Add empty/disabled states: disable query input and EDA button before a file is uploaded (50% opacity + grayscale on Upload Screen).
- Disable input while a query is processing.
- Review all error messages for clarity (displayed as warning insight cards).
- Verify the disclaimer text appears below the input bar.
- Clean up any console.log statements, TODOs, or placeholder text.

**Validate:** Full end-to-end test. Upload, query, EDA, follow-up query, download modified dataset, upload new file. All flows work without errors. All cards and charts match the dark theme.

---

## 11. Supported Chart Types

| Type | Use Case | Recharts Component |
|---|---|---|
| Line | Trends over time | `<LineChart>` |
| Bar | Categorical comparisons | `<BarChart>` |
| Pie | Proportional breakdowns | `<PieChart>` |
| Scatter | Correlation between two variables | `<ScatterChart>` |
| Area | Cumulative trends | `<AreaChart>` |

The `ChartRenderer.tsx` component receives chart config from the backend and maps `chart_type` to the appropriate Recharts component. All charts must use the color palette from Section 6.2, have tooltips enabled and styled to match the dark theme, and be responsive to container width.
