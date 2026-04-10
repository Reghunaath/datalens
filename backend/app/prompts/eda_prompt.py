import json

import pandas as pd

from app.utils.csv_parser import extract_column_info

_EDA_PROMPT_TEMPLATE = """You are a senior data analyst performing exploratory data analysis. Study the dataset below and write Python code that generates a thorough, insightful EDA — choosing the most appropriate visualizations for THIS specific data.

DATASET SCHEMA:
{column_info_json}

SAMPLE DATA (first 3 rows):
{sample_rows_json}

DESCRIPTIVE STATISTICS:
{basic_stats_json}

NUMERIC CORRELATIONS (Pearson r):
{correlation_json}

━━━ YOUR TASK ━━━

Generate a `results` list with 8–15 items. Think about what domain this data is from and what a domain expert would want to know. Cover:

  • Data quality    — missing values, duplicates, suspicious values
  • Distributions   — how each important column's values are spread
  • Relationships   — which numeric variables move together (use the correlation matrix above)
  • Patterns        — skewness, clusters, interesting segments
  • Key takeaways   — 2–4 summary insight cards with concrete observations

━━━ AVAILABLE CHART TYPES — pick the right one for each analysis ━━━

  "bar"     → distributions (bin numeric data into 8–10 ranges), frequency counts,
               category comparisons. Best for "how many fall in each bucket?"

  "line"    → trends over time or sequential progression. Use when there is a
               date/datetime column or a meaningful ordered index.

  "area"    → like line but emphasises volume. Use for multi-series time trends
               or when the filled area carries meaning.

  "pie"     → composition — "what share is each slice?" Use when there are
               ≤ 8 categories and the proportion is the insight.
               Good for: rating scales, boolean flags, small enumerations.

  "scatter" → correlation between two numeric variables. Use for every pair
               where |r| > 0.4 in the correlation matrix above.
               DATA FORMAT: put Column A values in `labels` (as numbers) and
               Column B values in `datasets[0]["data"]`. Set xAxisLabel/yAxisLabel.
               Example:
                 "labels": df["col_a"].tolist(),
                 "datasets": [{{"label": "col_b", "data": df["col_b"].tolist(), "colors": ["#135bec"]}}]

━━━ COLUMN ANALYSIS GUIDE ━━━

Check `df[col].nunique()` to classify each column — dtype does NOT determine the rule:

  • Any column with ≤ 8 unique values         → pie chart  (regardless of dtype — this
                                                 covers binary 0/1 flags, rating scales,
                                                 small enumerations, and booleans)
  • Numeric, > 8 unique values (continuous)  → bar chart with 8–10 bins (use pd.cut)
  • Categorical,  9–20 unique values          → bar chart  (top 10 by frequency)
  • Categorical,  > 20 unique values          → skip unless it is the key dimension
  • Date / datetime columns                   → line or area chart over time
  • ID columns (all values unique)            → skip

━━━ RESULT OBJECT FORMATS ━━━

Insight:
{{"type": "insight", "variant": "info|warning|success", "title": "Short title", "content": "Detailed explanation"}}
  Use "success" for positive findings, "warning" for issues/concerns, "info" for neutral observations.

Chart:
{{"type": "chart", "chart_type": "bar|line|area|pie|scatter", "title": "...", "subtitle": "optional",
  "data": {{"labels": [...], "datasets": [{{"label": "...", "data": [...], "colors": ["#hex"]}}]}},
  "options": {{"xAxisLabel": "...", "yAxisLabel": "..."}}}}
  Color order: #135bec, #10b981, #f59e0b, #8b5cf6, #ec4899
  Max 10 bars or slices per chart. Group remaining values as "Other" if needed.
  For bar charts with binned data, use string labels like "290–300" not raw numbers.

Table:
{{"type": "table", "title": "...", "headers": [...], "rows": [[...], ...]}}
  Max 10 rows. Round floats to 2 decimal places.

━━━ CODING RULES ━━━

- `df` is already available. Do NOT import pandas or any other library.
- Assign the final list to `results`. Set `dataset_modified = False`.
- No print statements. Handle NaN/missing values gracefully (dropna, fillna).
- Do not generate a chart for any column with only 1 unique value.
- For pie charts with > 8 slices, group the smallest slices into "Other".
- Always include a summary statistics table (use df.describe() rounded to 2dp).
- Always include at least one data quality insight card.

Return ONLY the Python code. No markdown fences. No explanations."""


def build_eda_prompt(df: pd.DataFrame) -> str:
    column_info_json = json.dumps(extract_column_info(df), indent=2)
    sample_rows_json = df.head(3).to_json(orient="records", indent=2)
    basic_stats_json = df.describe(include="all").round(2).to_json(indent=2)

    numeric_df = df.select_dtypes(include="number")
    if len(numeric_df.columns) >= 2:
        correlation_json = numeric_df.corr().round(3).to_json(indent=2)
    else:
        correlation_json = "Not enough numeric columns for correlation."

    return _EDA_PROMPT_TEMPLATE.format(
        column_info_json=column_info_json,
        sample_rows_json=sample_rows_json,
        basic_stats_json=basic_stats_json,
        correlation_json=correlation_json,
    )
