import json

import pandas as pd

from app.utils.csv_parser import extract_column_info

_PROMPT_TEMPLATE = """You are a data analysis assistant. The user has uploaded a CSV dataset. Generate Python code to answer their query.

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
{{"type": "insight", "variant": "info|warning|success", "title": "Short title", "content": "Detailed explanation"}}
- Use "info" for neutral observations, "warning" for risks or concerns, "success" for positive findings.

For charts, return:
{{"type": "chart", "chart_type": "line|bar|pie|scatter|area", "title": "Chart Title", "subtitle": "Optional description", "summary_stat": {{"value": "$4.2M", "change": "+12%", "trend": "up|down|neutral"}}, "data": {{"labels": [...], "datasets": [{{"label": "...", "data": [...], "colors": ["#135bec"]}}]}}, "options": {{"xAxisLabel": "...", "yAxisLabel": "..."}}}}
- summary_stat is optional. Only include when a single headline number is meaningful.
- For colors, use these in order: #135bec (blue), #10b981 (green), #f59e0b (amber), #8b5cf6 (violet), #ec4899 (pink).

For tables, return:
{{"type": "table", "title": "Table Title", "headers": [...], "rows": [[...], ...]}}
- Format numbers with commas and currency symbols where appropriate.
- Keep tables to 10 rows or fewer. If more data exists, show the most relevant rows and add an insight noting the full count.

Return ONLY the Python code, no markdown fences or explanations."""


def _format_history(conversation_history: list[dict[str, str]]) -> str:
    if not conversation_history:
        return "No previous conversation."
    lines = []
    for turn in conversation_history:
        role = "User" if turn["role"] == "user" else "Assistant"
        lines.append(f"{role}: {turn['content']}")
    return "\n".join(lines)


def build_query_prompt(
    df: pd.DataFrame,
    query: str,
    conversation_history: list[dict[str, str]],
) -> str:
    column_info_json = json.dumps(extract_column_info(df), indent=2)
    sample_rows_json = df.head(3).to_json(orient="records", indent=2)
    basic_stats_json = df.describe(include="all").to_json(indent=2)
    conversation_str = _format_history(conversation_history)

    return _PROMPT_TEMPLATE.format(
        column_info_json=column_info_json,
        sample_rows_json=sample_rows_json,
        basic_stats_json=basic_stats_json,
        conversation_history=conversation_str,
        user_query=query,
    )
