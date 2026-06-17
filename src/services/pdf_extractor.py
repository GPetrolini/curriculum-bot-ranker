import re
from pathlib import Path
from typing import Dict, Optional, Union
from io import BytesIO

import fitz


class PDFExtractor:

    EMAIL_PATTERN = r"[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,6}"
    PHONE_PATTERN = r"(?:\+\d{1,3}[\s-]?)?(?:\(\d{2,3}\)|\d{2,3})[\s-]?\d{4,5}[\s-]?\d{4}"
    LINKEDIN_PATTERN = r"https?://(?:[\w]+\.)?linkedin\.com/[\w\-/]+"
    GITHUB_PATTERN = r"https?://(?:www\.)?github\.com/[\w\-]+"

    def extract(self, pdf_input: Union[Path, bytes], file_name: Optional[str] = None) -> Dict[str, Optional[str]]:
        raw_text = ""
        pages = 0

        try:
            if isinstance(pdf_input, bytes):
                pdf_stream = BytesIO(pdf_input)
                with fitz.open(stream=pdf_stream, filetype="pdf") as pdf:
                    pages = pdf.page_count
                    for page in pdf:
                        raw_text += page.get_text()
                pdf_name = file_name or "unknown.pdf"
                pdf_storage_url = "database"
            else:
                with fitz.open(pdf_input) as pdf:
                    pages = pdf.page_count
                    for page in pdf:
                        raw_text += page.get_text()
                pdf_name = pdf_input.name
                pdf_storage_url = str(pdf_input.resolve())
        except Exception as exc:
            input_desc = file_name if isinstance(pdf_input, bytes) else str(pdf_input)
            raise RuntimeError(f"Falha ao ler PDF {input_desc}: {exc}") from exc

        cleaned_text = self.clean_text(raw_text)
        contact_info = self._extract_contact_info(raw_text)

        return {
            "full_name": contact_info.get("full_name") or self._guess_full_name(raw_text) or Path(pdf_name).stem,
            "email": contact_info.get("email"),
            "phone": contact_info.get("phone"),
            "linkedin_url": contact_info.get("linkedin_url"),
            "github_url": contact_info.get("github_url"),
            "pdf_file_name": pdf_name,
            "pdf_storage_url": pdf_storage_url,
            "pdf_pages": pages,
            "extracted_text": raw_text,
            "cleaned_text": cleaned_text,
            "total_words": len(cleaned_text.split()),
            "total_characters": len(cleaned_text),
        }

    def clean_text(self, text: str) -> str:
        text = text or ""
        text = text.replace("\n", " ")
        text = re.sub(r"[^\wÀ-ÿ@.\-/ ]", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def _extract_contact_info(self, text: str) -> Dict[str, Optional[str]]:
        email = self._search_pattern(self.EMAIL_PATTERN, text)
        phone = self._search_pattern(self.PHONE_PATTERN, text)
        linkedin_url = self._search_pattern(self.LINKEDIN_PATTERN, text)
        github_url = self._search_pattern(self.GITHUB_PATTERN, text)
        full_name = self._search_name(text)

        return {
            "full_name": full_name,
            "email": email,
            "phone": phone,
            "linkedin_url": linkedin_url,
            "github_url": github_url,
        }

    def _search_pattern(self, pattern: str, text: str) -> Optional[str]:
        match = re.search(pattern, text, flags=re.IGNORECASE)
        return match.group(0).strip() if match else None

    def _search_name(self, text: str) -> Optional[str]:
        # Tenta encontrar nome com padrões comuns em currículos
        patterns = [
            r"(?:nome|name)\s*[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4})",
            r"(?:curriculum|currículo|cv|resume).*?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})",  # Nome após header
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, flags=re.IGNORECASE | re.MULTILINE)
            if match and match.lastindex >= 1:
                name = match.group(1).strip()
                # Verifica se parece um nome válido (não muito longo, não tem números)
                if len(name.split()) >= 2 and len(name.split()) <= 4 and not any(c.isdigit() for c in name):
                    return name
        
        return None

    def _guess_full_name(self, text: str) -> Optional[str]:
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        if not lines:
            return None

        first_line = lines[0]
        if 2 <= len(first_line.split()) <= 5:
            return first_line

        return None
