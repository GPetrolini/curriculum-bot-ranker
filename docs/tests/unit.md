# Testes Unitários

Esta página mostra os testes unitários dos principais componentes do sistema com os trechos reais do código.

## PDFExtractor

`test_pdf_extractor.py` testa o serviço de extração de PDFs, incluindo limpeza de texto e extração de informações de contato.

### Limpeza de Texto

```python
def test_clean_text_removes_newlines():
    text = "Line 1\nLine 2\nLine 3"
    result = self.extractor.clean_text(text)
    assert "\n" not in result
    assert result == "Line 1 Line 2 Line 3"

def test_clean_text_removes_special_characters():
    text = "Hello@#$%World"
    result = self.extractor.clean_text(text)
    assert "#" not in result
    assert "%" not in result
    assert "@" in result  # @ é mantido por estar na lista permitida

def test_clean_text_removes_extra_spaces():
    text = "Hello    World   Test"
    result = self.extractor.clean_text(text)
    assert result == "Hello World Test"
```

### Extração de Informações de Contato

```python
def test_search_pattern_finds_email():
    text = "Contact: test@example.com for more info"
    result = self.extractor._search_pattern(self.extractor.EMAIL_PATTERN, text)
    assert result == "test@example.com"

def test_search_pattern_finds_phone():
    text = "Call me at (11) 98765-4321"
    result = self.extractor._search_pattern(self.extractor.PHONE_PATTERN, text)
    assert result == "(11) 98765-4321"

def test_search_pattern_finds_linkedin():
    text = "Profile: https://linkedin.com/in/johndoe"
    result = self.extractor._search_pattern(self.extractor.LINKEDIN_PATTERN, text)
    assert result == "https://linkedin.com/in/johndoe"

def test_search_pattern_finds_github():
    text = "Code: https://github.com/johndoe"
    result = self.extractor._search_pattern(self.extractor.GITHUB_PATTERN, text)
    assert result == "https://github.com/johndoe"
```

### Extração Completa de Contato

```python
def test_extract_contact_info_returns_dict_with_all_fields():
    text = """
    João Silva
    Email: joao@example.com
    Phone: (11) 98765-4321
    LinkedIn: https://linkedin.com/in/joaosilva
    GitHub: https://github.com/joaosilva
    """
    result = self.extractor._extract_contact_info(text)
    assert result["email"] == "joao@example.com"
    assert result["phone"] == "(11) 98765-4321"
    assert result["linkedin_url"] == "https://linkedin.com/in/joaosilva"
    assert result["github_url"] == "https://github.com/joaosilva"
```

---

## KeywordAnalyzer

`test_keyword_analyzer.py` testa o serviço de análise de keywords, incluindo limpeza de texto e cálculo de scores.

### Limpeza de Texto

```python
def test_clean_text_converts_to_lowercase():
    text = "HELLO WORLD"
    result = self.analyzer.clean_text(text)
    assert result == "hello world"

def test_clean_text_removes_newlines():
    text = "Line 1\nLine 2"
    result = self.analyzer.clean_text(text)
    assert "\n" not in result
    assert result == "line 1 line 2"

def test_clean_text_removes_special_characters():
    text = "Hello@#$%World"
    result = self.analyzer.clean_text(text)
    assert "#" not in result
    assert "%" not in result
    assert "@" in result  # @ é mantido por estar na lista permitida
```

### Análise de Keywords

```python
def test_analyze_vacancy_keywords_with_fallback_keywords():
    text = "python developer with sql and docker skills"
    result = self.analyzer.analyze_vacancy_keywords(text)
    
    assert "keyword_records" in result
    assert "must_have_score" in result
    assert "nice_to_have_score" in result
    assert "final_score" in result
    assert result["final_score"] > 0

def test_analyze_vacancy_keywords_counts_occurrences():
    text = "python python python"
    result = self.analyzer.analyze_vacancy_keywords(text)
    
    python_record = next((r for r in result["keyword_records"] if r["keyword"] == "python"), None)
    assert python_record is not None
    assert python_record["occurrences"] == 3

def test_analyze_vacancy_keywords_calculates_final_score():
    text = "python developer with sql and docker skills"
    result = self.analyzer.analyze_vacancy_keywords(text)
    
    expected_final = result["must_have_score"] + result["nice_to_have_score"]
    assert result["final_score"] == expected_final
```

---

## ScoringService

`test_scoring_and_ranking.py` testa o serviço de cálculo de score com base em skills.

### Cálculo de Score

```python
def test_calculate_score_returns_zero_when_no_required_skills():
    skills = ["python", "sql"]
    required_skills = []
    
    score = scoring_service.calculate_score(skills, required_skills)
    
    assert score == 0

@pytest.mark.parametrize(
    "skills, required_skills, expected",
    [
        (["python", "sql"], ["python", "sql"], 100.0),
        (["python", "sql"], ["python", "aws"], 50.0),
        (["python", "sql", "aws"], ["python", "sql", "aws", "docker"], 75.0),
    ],
)
def test_calculate_score_matches_expected_percentage(skills, required_skills, expected):
    score = scoring_service.calculate_score(skills, required_skills)
    
    assert score == expected

def test_calculate_score_rounds_to_two_decimals():
    skills = ["python", "sql", "aws"]
    required_skills = ["python", "sql", "aws", "docker", "kubernetes"]
    
    score = scoring_service.calculate_score(skills, required_skills)
    
    assert score == 60.0
```

---

## RankingEngine

`test_scoring_and_ranking.py` testa o motor de ranking que determina o nível do candidato.

### Determinação de Ranking

```python
@pytest.mark.parametrize(
    "final_score, expected_ranking",
    [
        (90, "EXCELENTE"),
        (80, "EXCELENTE"),
        (65, "BOM"),
        (50, "BOM"),
        (35, "MEDIANO"),
        (30, "MEDIANO"),
        (10, "FRACO"),
        (0, "FRACO"),
    ],
)
def test_determine_ranking_returns_expected_level(final_score, expected_ranking):
    ranking = ranking_engine.RankingEngine.determine_ranking(final_score)
    
    assert ranking == expected_ranking
```

### Aplicação de Ranking

```python
def test_apply_adds_ranking_level_to_candidate_payload():
    candidate_payload = {"final_score": 72}
    
    result = ranking_engine.RankingEngine.apply(candidate_payload.copy())
    
    assert result["ranking_level"] == "BOM"
    assert result["final_score"] == 72

def test_apply_uses_default_score_when_missing():
    candidate_payload = {}
    
    result = ranking_engine.RankingEngine.apply(candidate_payload.copy())
    
    assert result["ranking_level"] == "FRACO"
    assert result.get("final_score") is None
```

---

## API

`test_api.py` testa os endpoints da API FastAPI usando o TestClient.

### Endpoint Raiz

```python
def test_home():
    response = client.get("/")
    
    assert response.status_code == 200
    assert "message" in response.json()
```

### Endpoint de Candidatos

```python
@patch('database.connection.SessionLocal')
def test_list_candidates(mock_session):
    mock_session_instance = MagicMock()
    mock_session.return_value.__enter__.return_value = mock_session_instance
    
    mock_candidate = MagicMock()
    mock_candidate.id = "test-id"
    mock_candidate.full_name = "Test User"
    mock_candidate.email = "test@example.com"
    mock_candidate.final_score = 15
    mock_candidate.ranking_level = "FRACO"
    
    with patch('database.repository.CandidateRepository.get_all') as mock_get_all:
        mock_get_all.return_value = [mock_candidate]
        
        response = client.get("/candidates")
        
        assert response.status_code == 200
        assert "status" in response.json()
        assert "candidates" in response.json()
        assert response.json()["status"] == "success"
```

### Validação de Campos

```python
@patch('database.connection.SessionLocal')
def test_list_candidates_has_required_fields(mock_session):
    mock_session_instance = MagicMock()
    mock_session.return_value.__enter__.return_value = mock_session_instance
    
    mock_candidate = MagicMock()
    mock_candidate.id = "test-id"
    mock_candidate.full_name = "Test User"
    mock_candidate.email = "test@example.com"
    mock_candidate.final_score = 15
    mock_candidate.ranking_level = "FRACO"
    
    with patch('database.repository.CandidateRepository.get_all') as mock_get_all:
        mock_get_all.return_value = [mock_candidate]
        
        response = client.get("/candidates")
        
        assert response.status_code == 200
        candidates = response.json()["candidates"]
        assert len(candidates) == 1
        candidate = candidates[0]
        assert "candidate_id" in candidate
        assert "full_name" in candidate
        assert "email" in candidate
        assert "final_score" in candidate
        assert "ranking_level" in candidate
```
