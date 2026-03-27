import json
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.prompts.query_prompt import build_query_prompt
from app.services import session_manager
from app.services.code_executor import execute_code
from app.services.llm_service import generate_code
from app.utils.response_formatter import format_results

logger = logging.getLogger(__name__)

router = APIRouter()

_GEMINI_ERROR_RESULT = [
    {
        "type": "insight",
        "variant": "warning",
        "title": "AI Service Error",
        "content": "Something went wrong connecting to the AI service. Please try again.",
    }
]


class QueryRequest(BaseModel):
    query: str


def _is_execution_error(results: list[dict]) -> bool:
    return len(results) == 1 and results[0].get("title") == "Query Error"


@router.post("/query")
async def run_query(request: QueryRequest):
    if not session_manager.has_dataset():
        raise HTTPException(status_code=400, detail="Please upload a CSV file first.")

    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    df = session_manager.get_current_df()
    history = session_manager.get_conversation_history()
    query = request.query.strip()

    # Generate code from Gemini
    prompt = build_query_prompt(df, query, history)
    try:
        code = generate_code(prompt)
    except Exception:
        logger.exception("Gemini API error for query: %r", query)
        return {
            "status": "success",
            "results": _GEMINI_ERROR_RESULT,
            "dataset_modified": False,
        }

    # Execute generated code
    results, dataset_modified = execute_code(code, df)

    # Retry once if execution failed
    if _is_execution_error(results):
        logger.info("Execution failed, retrying with error context.")
        retry_query = query + "\n\n[Previous attempt failed with an execution error. Please try a different approach.]"
        retry_prompt = build_query_prompt(df, retry_query, history)
        try:
            retry_code = generate_code(retry_prompt)
        except Exception:
            logger.exception("Gemini API error on retry for query: %r", query)
            results = _GEMINI_ERROR_RESULT
            dataset_modified = False
        else:
            results, dataset_modified = execute_code(retry_code, df)

    formatted = format_results(results)

    session_manager.add_to_history("user", query)
    session_manager.add_to_history("assistant", json.dumps(formatted))

    return {
        "status": "success",
        "results": formatted,
        "dataset_modified": dataset_modified,
    }
