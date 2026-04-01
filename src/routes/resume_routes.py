from fastapi import APIRouter, UploadFile, File, HTTPException
from src.services.file_service import save_temp_file
from src.services.extractor_service import extract_text
from src.utils.validators import validate_file

router = APIRouter()


@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    try:
        validate_file(file)

        file_path = await save_temp_file(file)

        text = extract_text(file_path)

        return {
            "file_name": file.filename,
            "file_type": file.filename.split(".")[-1],
            "extracted_text_preview": text[:500],
            "status": "success"
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))