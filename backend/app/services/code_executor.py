import json
import logging
import threading
import traceback

import numpy as np
import pandas as pd

from app.services import session_manager

logger = logging.getLogger(__name__)

TIMEOUT_SECONDS = 30

_ERROR_CARD = {
    "type": "insight",
    "variant": "warning",
    "title": "Query Error",
    "content": "I had trouble processing that query. Could you try rephrasing it?",
}

_TIMEOUT_CARD = {
    "type": "insight",
    "variant": "warning",
    "title": "Query Timeout",
    "content": "That query took too long to process. Try a simpler question or work with a smaller dataset.",
}


def execute_code(code: str, df: pd.DataFrame) -> tuple[list[dict], bool]:
    """Execute LLM-generated code and return (results, dataset_modified).

    Runs in a worker thread with a 30-second timeout. On error or timeout,
    returns a warning insight card. If the code sets dataset_modified=True,
    updates the session's current DataFrame.
    """
    result_container: dict = {}
    exception_container: dict = {}

    def _run() -> None:
        global_vars = {"pd": pd, "np": np, "json": json}
        local_vars: dict = {"df": df.copy()}
        try:
            exec(code, global_vars, local_vars)  # noqa: S102
            result_container["results"] = local_vars.get("results", [])
            result_container["dataset_modified"] = bool(local_vars.get("dataset_modified", False))
            result_container["df"] = local_vars["df"]
        except Exception:
            exception_container["traceback"] = traceback.format_exc()

    thread = threading.Thread(target=_run, daemon=True)
    thread.start()
    thread.join(timeout=TIMEOUT_SECONDS)

    if thread.is_alive():
        logger.error("Code execution timed out after %s seconds.\nCode:\n%s", TIMEOUT_SECONDS, code)
        return [_TIMEOUT_CARD], False

    if exception_container:
        logger.error("Code execution failed.\nTraceback:\n%s\nCode:\n%s", exception_container["traceback"], code)
        return [_ERROR_CARD], False

    results = result_container.get("results", [])
    dataset_modified = result_container.get("dataset_modified", False)

    if dataset_modified:
        session_manager.update_current_df(result_container["df"])

    return results, dataset_modified
