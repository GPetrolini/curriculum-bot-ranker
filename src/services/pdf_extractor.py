import fitz


def extract_text_from_pdf(pdf_path):
    text = ""

    try:
        with fitz.open(pdf_path) as pdf:
            for page in pdf:
                text += page.get_text()

        return text

    except Exception as e:
        print(f"Erro ao ler PDF: {e}")
        return None