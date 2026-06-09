from fastapi.testclient import TestClient
from src.main import app


client = TestClient(app)


def test_home():
    response = client.get("/")

    assert response.status_code == 200
    assert "message" in response.json()


def test_list_candidates():
    response = client.get("/candidates")

    assert response.status_code == 200
    assert "status" in response.json()
    assert "candidates" in response.json()
    assert response.json()["status"] == "success"


def test_list_candidates_returns_list():
    response = client.get("/candidates")

    assert response.status_code == 200
    candidates = response.json()["candidates"]
    assert isinstance(candidates, list)


def test_list_candidates_has_required_fields():
    response = client.get("/candidates")

    assert response.status_code == 200
    candidates = response.json()["candidates"]
    if candidates:
        candidate = candidates[0]
        assert "candidate_id" in candidate
        assert "full_name" in candidate
        assert "email" in candidate
        assert "final_score" in candidate
        assert "ranking_level" in candidate