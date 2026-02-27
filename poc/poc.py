"""
DataLens POC — CLI tool to test Gemini code generation for CSV analysis.

Usage:
    python poc.py <csv_file> "<query>"

Example:
    python poc.py sales.csv "show me total revenue by region"
"""

import json
import sys
import os

import pandas as pd
from google import genai

PROMPT_TEMPLATE = """You are a data analysis assistant. The user has uploaded a CSV dataset. Generate Python code to answer their query.

DATASET SCHEMA:
{column_info}

SAMPLE DATA (first 3 rows):
{sample_data}

BASIC STATISTICS:
{basic_stats}

USER QUERY: {query}

INSTRUCTIONS:
- Use pandas. The DataFrame is available as `df`.
- Return a Python list of result objects. Assign it to a variable called `results`.
- If the query requires modifying the dataset, modify `df` in place and set `dataset_modified = True`. Otherwise set `dataset_modified = False`.
- Do not use print statements. Do not import pandas (it is already imported).
- Handle potential errors in the data (missing values, wrong types) gracefully.

RESULT OBJECT FORMATS:

For text insights, return:
{{"type": "insight", "variant": "info|warning|success", "title": "Short title", "content": "Detailed explanation"}}

For charts, return:
{{"type": "chart", "chart_type": "line|bar|pie|scatter|area", "title": "Chart Title", "subtitle": "Optional description", "data": {{"labels": [...], "datasets": [{{"label": "...", "data": [...], "colors": ["#135bec"]}}]}}, "options": {{"xAxisLabel": "...", "yAxisLabel": "..."}}}}
- For colors, use these in order: #135bec (blue), #10b981 (green), #f59e0b (amber), #8b5cf6 (violet), #ec4899 (pink).

For tables, return:
{{"type": "table", "title": "Table Title", "headers": [...], "rows": [[...], ...]}}
- Format numbers with commas and currency symbols where appropriate.
- Keep tables to 10 rows or fewer.

Return ONLY the Python code, no markdown fences or explanations.
"""


def get_column_info(df: pd.DataFrame) -> str:
    info = []
    for col in df.columns:
        sample = df[col].dropna().head(2).tolist()
        sample = [v.item() if hasattr(v, "item") else v for v in sample]
        info.append({"name": str(col), "dtype": str(df[col].dtype), "sample_values": sample})
    return json.dumps(info, indent=2)


def load_api_key() -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        if os.path.exists(env_path):
            for line in open(env_path):
                if line.strip().startswith("GEMINI_API_KEY="):
                    api_key = line.strip().split("=", 1)[1]
    if not api_key:
        print("Error: Set GEMINI_API_KEY in environment or poc/.env")
        sys.exit(1)
    return api_key


def run_query(client: genai.Client, df: pd.DataFrame, query: str) -> None:
    import numpy as np

    prompt = PROMPT_TEMPLATE.format(
        column_info=get_column_info(df),
        sample_data=df.head(3).to_json(orient="records", indent=2),
        basic_stats=df.describe(include="all").to_json(indent=2),
        query=query,
    )

    print("\n--- Sending to Gemini (gemini-3.0-flash) ---\n")
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt,
    )
    code = response.text.strip()

    # Strip markdown fences if present
    if code.startswith("```"):
        lines = code.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        code = "\n".join(lines)

    print("--- Generated Code ---")
    print(code)
    print("\n--- Executing Code ---\n")

    local_vars: dict = {}
    global_vars = {"df": df, "pd": pd, "np": np, "json": json}
    try:
        exec(code, global_vars, local_vars)
        results = local_vars.get("results", [])
        modified = local_vars.get("dataset_modified", False)

        print(f"dataset_modified: {modified}")
        print(f"Number of results: {len(results)}\n")

        for i, r in enumerate(results):
            print(f"--- Result {i + 1} ({r.get('type', 'unknown')}) ---")
            print(json.dumps(r, indent=2, default=str))
            print()

    except Exception as e:
        print(f"Execution error: {e}\n")


def main():
    print("\n=== DataLens POC ===\n")

    api_key = load_api_key()
    client = genai.Client(api_key=api_key)

    csv_path = input("CSV file path: ").strip()
    if not csv_path:
        print("No file provided.")
        sys.exit(1)

    print(f"\n--- Loading {csv_path} ---")
    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        print(f"Error loading CSV: {e}")
        sys.exit(1)

    print(f"Shape: {df.shape[0]} rows x {df.shape[1]} columns")
    print(f"Columns: {', '.join(df.columns)}")

    while True:
        print()
        query = input("Query (or 'quit' to exit): ").strip()
        if not query or query.lower() in ("quit", "exit", "q"):
            print("Bye!")
            break
        run_query(client, df, query)


if __name__ == "__main__":
    main()
