from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.session_manager import store_dataframe
from app.utils.csv_parser import (
    extract_column_info,
    extract_preview,
    parse_csv,
    validate_file,
    validate_size,
)

router = APIRouter()


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    # Validate file extension
    error = validate_file(file)
    if error:
        raise HTTPException(status_code=400, detail=error)

    # Read contents and validate size
    contents = await file.read()
    error = await validate_size(contents)
    if error:
        raise HTTPException(status_code=400, detail=error)

    # Parse CSV
    df, error = parse_csv(contents)
    if error:
        raise HTTPException(status_code=400, detail=error)

    # Store in session
    store_dataframe(df, file.filename or "uploaded.csv")

    return {
        "status": "success",
        "filename": file.filename,
        "rows": len(df),
        "columns": len(df.columns),
        "column_info": extract_column_info(df),
        "preview": extract_preview(df),
    }
