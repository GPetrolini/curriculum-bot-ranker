from fastapi import UploadFile


ALLOWED_EXTENSIONS = ["pdf", "docx"]


def validate_file(file: UploadFile):
    if not file.filename:
        raise ValueError("Arquivo sem nome")

    extension = file.filename.split(".")[-1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Formato inválido. Apenas PDF e DOCX são permitidos.")