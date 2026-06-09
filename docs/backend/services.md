# Backend / Serviços

Esta página mostra os principais serviços do backend com os trechos reais do código.

## Extração de PDF

`src/services/pdf_extractor.py` contém a classe `PDFExtractor`.

A função `extract()` agora aceita tanto `Path` quanto `bytes` como entrada, permitindo leitura de PDFs do banco de dados ou de arquivos locais:

```python
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
```

A classe também define padrões regex para extração de informações de contato:
- `EMAIL_PATTERN`: extrai endereços de e-mail
- `PHONE_PATTERN`: extrai números de telefone
- `LINKEDIN_PATTERN`: extrai URLs do LinkedIn
- `GITHUB_PATTERN`: extrai URLs do GitHub

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

## Ranking Engine

`src/services/ranking_engine.py` define a classe `RankingEngine`.

O método `determine_ranking()` classifica o candidato em níveis baseado no score final:

```python
@staticmethod
def determine_ranking(final_score: int) -> str:
    if final_score >= 80:
        return "EXCELENTE"
    elif final_score >= 50:
        return "BOM"
    elif final_score >= 30:
        return "MEDIANO"
    else:
        return "FRACO"
```

O método `apply()` adiciona o `ranking_level` ao payload do candidato:

```python
@staticmethod
def apply(candidate_payload: dict) -> dict:
    final_score = candidate_payload.get("final_score", 0)
    candidate_payload["ranking_level"] = RankingEngine.determine_ranking(final_score)
    return candidate_payload
```
