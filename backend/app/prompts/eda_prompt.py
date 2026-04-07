import json

import pandas as pd

from app.utils.csv_parser import extract_column_info

_EDA_PROMPT_TEMPLATE = """You are a data analysis assistant. Perform a comprehensive exploratory data analysis on the given dataset. Generate Python code that produces multiple result objects.

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

RESULT OBJECT FORMATS:

For text insights, return:
{{"type": "insight", "variant": "info|warning|success", "title": "Short title", "content": "Detailed explanation"}}

For charts, return:
{{"type": "chart", "chart_type": "line|bar|pie|scatter|area", "title": "Chart Title", "subtitle": "Optional description", "data": {{"labels": [...], "datasets": [{{"label": "...", "data": [...], "colors": ["#135bec"]}}]}}, "options": {{"xAxisLabel": "...", "yAxisLabel": "..."}}}}

For tables, return:
{{"type": "table", "title": "Table Title", "headers": [...], "rows": [[...], ...]}}
- Keep tables to 10 rows or fewer.

Return ONLY the Python code, no markdown fences or explanations."""


def build_eda_prompt(df: pd.DataFrame) -> str:
    column_info_json = json.dumps(extract_column_info(df), indent=2)
    sample_rows_json = df.head(3).to_json(orient="records", indent=2)
    basic_stats_json = df.describe(include="all").to_json(indent=2)

    return _EDA_PROMPT_TEMPLATE.format(
        column_info_json=column_info_json,
        sample_rows_json=sample_rows_json,
        basic_stats_json=basic_stats_json,
    )
