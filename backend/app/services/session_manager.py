from typing import Any

import pandas as pd

_session: dict[str, Any] = {
    "original_df": None,
    "current_df": None,
    "conversation_history": [],
    "filename": None,
}


def store_dataframe(df: pd.DataFrame, filename: str) -> None:
    _session["original_df"] = df.copy()
    _session["current_df"] = df.copy()
    _session["conversation_history"] = []
    _session["filename"] = filename


def get_original_df() -> pd.DataFrame | None:
    return _session["original_df"]


def get_current_df() -> pd.DataFrame | None:
    return _session["current_df"]


def update_current_df(df: pd.DataFrame) -> None:
    _session["current_df"] = df


def get_conversation_history() -> list[dict[str, str]]:
    return _session["conversation_history"]


def add_to_history(role: str, content: str) -> None:
    _session["conversation_history"].append({"role": role, "content": content})


def get_filename() -> str | None:
    return _session["filename"]


def has_dataset() -> bool:
    return _session["current_df"] is not None


def clear_session() -> None:
    _session["original_df"] = None
    _session["current_df"] = None
    _session["conversation_history"] = []
    _session["filename"] = None
