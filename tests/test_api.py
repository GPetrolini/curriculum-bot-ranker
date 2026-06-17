from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from src.main import app


client = TestClient(app)


def test_home():
    response = client.get("/")

    assert response.status_code == 200
    assert "message" in response.json()


@patch('database.connection.SessionLocal')
def test_list_candidates(mock_session):
    mock_session_instance = MagicMock()
    mock_session.return_value.__enter__.return_value = mock_session_instance

    mock_candidate = MagicMock()
    mock_candidate.id = "test-id"
    mock_candidate.full_name = "Test User"
    mock_candidate.email = "test@example.com"
    mock_candidate.phone = None
    mock_candidate.age = None
    mock_candidate.linkedin_url = None
    mock_candidate.github_url = None
    mock_candidate.vacancy_applied = "Software Engineer"
    mock_candidate.pdf_file_name = "test.pdf"
    mock_candidate.pdf_storage_url = "test/path"
    mock_candidate.pdf_pages = 1
    mock_candidate.extracted_text = "test text"
    mock_candidate.cleaned_text = "test cleaned"
    mock_candidate.total_words = 2
    mock_candidate.total_characters = 12
    mock_candidate.must_have_score = 10
    mock_candidate.nice_to_have_score = 5
    mock_candidate.final_score = 15
    mock_candidate.ranking_level = "FRACO"
    mock_candidate.ai_summary = None
    mock_candidate.ai_strengths = None
    mock_candidate.ai_weaknesses = None
    mock_candidate.ai_seniority = None
    mock_candidate.selected_for_interview = False
    mock_candidate.interview_selected_at = None

    with patch('database.repository.CandidateRepository.get_all') as mock_get_all:
        mock_get_all.return_value = [mock_candidate]

        response = client.get("/candidates")

        assert response.status_code == 200
        assert "status" in response.json()
        assert "candidates" in response.json()
        assert response.json()["status"] == "success"


@patch('database.connection.SessionLocal')
def test_list_candidates_returns_list(mock_session):
    mock_session_instance = MagicMock()
    mock_session.return_value.__enter__.return_value = mock_session_instance

    with patch('database.repository.CandidateRepository.get_all') as mock_get_all:
        mock_get_all.return_value = []

        response = client.get("/candidates")

        assert response.status_code == 200
        candidates = response.json()["candidates"]
        assert isinstance(candidates, list)


@patch('database.connection.SessionLocal')
def test_list_candidates_has_required_fields(mock_session):
    mock_session_instance = MagicMock()
    mock_session.return_value.__enter__.return_value = mock_session_instance

    mock_candidate = MagicMock()
    mock_candidate.id = "test-id"
    mock_candidate.full_name = "Test User"
    mock_candidate.email = "test@example.com"
    mock_candidate.phone = None
    mock_candidate.age = None
    mock_candidate.linkedin_url = None
    mock_candidate.github_url = None
    mock_candidate.vacancy_applied = "Software Engineer"
    mock_candidate.pdf_file_name = "test.pdf"
    mock_candidate.pdf_storage_url = "test/path"
    mock_candidate.pdf_pages = 1
    mock_candidate.extracted_text = "test text"
    mock_candidate.cleaned_text = "test cleaned"
    mock_candidate.total_words = 2
    mock_candidate.total_characters = 12
    mock_candidate.must_have_score = 10
    mock_candidate.nice_to_have_score = 5
    mock_candidate.final_score = 15
    mock_candidate.ranking_level = "FRACO"
    mock_candidate.ai_summary = None
    mock_candidate.ai_strengths = None
    mock_candidate.ai_weaknesses = None
    mock_candidate.ai_seniority = None
    mock_candidate.selected_for_interview = False
    mock_candidate.interview_selected_at = None

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
        assert "selected_for_interview" in candidate
        assert "interview_selected_at" in candidate