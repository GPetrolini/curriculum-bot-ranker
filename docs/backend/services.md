# Backend / Serviços

Esta página mostra os principais serviços do backend com os trechos reais do código.

## Extração de PDF

`src/services/pdf_extractor.py` contém a classe `PDFExtractor`.

A função `extract()` lê o PDF, faz limpeza de texto e extrai informações de contato:

```python
def extract(self, pdf_path: Path) -> Dict[str, Optional[str]]:
    raw_text = ""
    pages = 0

    try:
        with fitz.open(pdf_path) as pdf:
            pages = pdf.page_count
            for page in pdf:
                raw_text += page.get_text()
    except Exception as exc:
        raise RuntimeError(f"Falha ao ler PDF {pdf_path}: {exc}") from exc

    cleaned_text = self.clean_text(raw_text)
    contact_info = self._extract_contact_info(raw_text)

    return {
        "full_name": contact_info.get("full_name") or self._guess_full_name(raw_text) or pdf_path.stem,
        "email": contact_info.get("email"),
        "phone": contact_info.get("phone"),
        "linkedin_url": contact_info.get("linkedin_url"),
        "github_url": contact_info.get("github_url"),
        "pdf_file_name": pdf_path.name,
        "pdf_storage_url": str(pdf_path.resolve()),
        "pdf_pages": pages,
        "extracted_text": raw_text,
        "cleaned_text": cleaned_text,
        "total_words": len(cleaned_text.split()),
        "total_characters": len(cleaned_text),
    }
```

## Análise de Keywords

`src/services/keyword_analyzer.py` define `KeywordAnalyzer.analyze_vacancy_keywords()`.

Ele limpa o texto, busca ocorrências por palavra-chave e calcula `must_have_score`, `nice_to_have_score` e `final_score`:

```python
for item in source_keywords:
    keyword = item["keyword"].lower()
    keyword_type = item.get("keyword_type", "nice_to_have")
    keyword_weight = item.get("keyword_weight", 1)

    occurrences = len(re.findall(re.escape(keyword), text))
    keyword_score = int(occurrences * keyword_weight)

    if keyword_type == "must_have":
        must_have_score += keyword_score
    else:
        nice_to_have_score += keyword_score
```

A saída inclui `keyword_records` e `final_score`.

## Orquestração de análise

`src/services/resume_service.py` orquestra a extração, a análise de palavras-chave e a chamada de IA.

No método `analyze_existing_candidate()` ele obtém o candidato e chama o cliente OpenAI:

```python
ai_analysis = analyze_resume_text(text_to_use)
ai_data = parse_ai_analysis(ai_analysis)

updates = {
    "ai_summary": ai_data.get("summary"),
    "ai_strengths": ", ".join(ai_data.get("skills", [])) if ai_data.get("skills") else None,
    "ai_weaknesses": None,
    "ai_seniority": (
        str(ai_data.get("experience_years"))
        if ai_data.get("experience_years") is not None
        else None
    ),
}

candidate = CandidateRepository.update_candidate(session, candidate, updates)
```

E em `analyze_missing_candidates()` a mesma lógica é aplicada em lote para candidatos sem `ai_summary`.
