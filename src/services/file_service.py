import os
from pathlib import Path
from fastapi import UploadFile

TEMP_DIR = Path("temp")
TEMP_DIR.mkdir(exist_ok=True)


async def save_temp_file(file: UploadFile) -> str:
    file_path = TEMP_DIR / file.filename

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return str(file_path)