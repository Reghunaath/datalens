from io import BytesIO

import pandas as pd
from fastapi import UploadFile

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_MEMORY_MB = 500


def validate_file(file: UploadFile) -> str | None:
    """Return an error message string, or None if valid."""
    if not file.filename or not file.filename.lower().endswith(".csv"):
        return "Please upload a CSV file."
    return None


async def validate_size(contents: bytes) -> str | None:
    """Return an error message string, or None if valid."""
    if len(contents) > MAX_FILE_SIZE:
        return "File size exceeds the 10MB limit."
    return None


def parse_csv(contents: bytes) -> tuple[pd.DataFrame | None, str | None]:
    """Parse CSV bytes into a DataFrame. Returns (df, error_message)."""
    try:
        df = pd.read_csv(BytesIO(contents))
    except Exception:
        return None, "Could not parse the file. Please check the CSV format."

    memory_usage_mb = df.memory_usage(deep=True).sum() / (1024 * 1024)
    if memory_usage_mb > MAX_MEMORY_MB:
        return None, "Dataset is too large to process. Please use a smaller file."

    return df, None


def extract_column_info(df: pd.DataFrame) -> list[dict]:
    """Extract column metadata for the upload response."""
    column_info = []
    for col in df.columns:
        sample = df[col].dropna().head(2).tolist()
        # Convert numpy types to native Python types for JSON serialization
        sample = [
            v.item() if hasattr(v, "item") else v
            for v in sample
        ]
        column_info.append({
            "name": str(col),
            "dtype": str(df[col].dtype),
            "sample_values": sample,
        })
    return column_info


def extract_preview(df: pd.DataFrame, n_rows: int = 5) -> list[list]:
    """Extract first n rows as a list of lists for preview."""
    preview_df = df.head(n_rows)
    rows = []
    for _, row in preview_df.iterrows():
        row_data = []
        for val in row:
            if hasattr(val, "item"):
                row_data.append(val.item())
            elif pd.isna(val):
                row_data.append(None)
            else:
                row_data.append(val)
        rows.append(row_data)
    return rows
