import io

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.services import session_manager

router = APIRouter()


@router.get("/download")
def download_csv():
    if not session_manager.has_dataset():
        raise HTTPException(status_code=400, detail="No dataset available to download.")

    df = session_manager.get_current_df()
    buffer = io.StringIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=\"modified_data.csv\""},
    )
