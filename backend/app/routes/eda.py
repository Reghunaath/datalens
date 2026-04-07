import json
import logging

from fastapi import APIRouter, HTTPException

from app.prompts.eda_prompt import build_eda_prompt
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


@router.post("/eda")
async def run_eda():
    if not session_manager.has_dataset():
        raise HTTPException(status_code=400, detail="Please upload a CSV file first.")

    df = session_manager.get_current_df()

    prompt = build_eda_prompt(df)
    try:
        code = generate_code(prompt)
    except Exception:
        logger.exception("Gemini API error during EDA")
        return {
            "status": "success",
            "results": _GEMINI_ERROR_RESULT,
            "dataset_modified": False,
        }

    results, dataset_modified = execute_code(code, df)
    formatted = format_results(results)

    session_manager.add_to_history("user", "Run EDA")
    session_manager.add_to_history("assistant", json.dumps(formatted))

    return {
        "status": "success",
        "results": formatted,
        "dataset_modified": dataset_modified,
    }
