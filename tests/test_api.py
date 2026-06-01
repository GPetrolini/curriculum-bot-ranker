from fastapi.testclient import TestClient
from src.api import app


client = TestClient(app)


def test_home():
    response = client.get("/")

    assert response.status_code == 200
    assert "message" in response.json()


def test_health_check():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_list_candidates():
    response = client.get("/candidates")

    assert response.status_code == 200
    assert "candidates" in response.json()
    assert response.json()["total"] >= 1


def test_get_candidate_by_id():
    response = client.get("/candidates/1")

    assert response.status_code == 200
    assert response.json()["id"] == 1


def test_get_candidate_not_found():
    response = client.get("/candidates/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Candidato não encontrado"


def test_get_ranking():
    response = client.get("/ranking")

    assert response.status_code == 200
    assert "ranking" in response.json()


def test_list_skills():
    response = client.get("/skills")

    assert response.status_code == 200
    assert "skills" in response.json()


def test_create_candidate():
    new_candidate = {
        "id": 10,
        "name": "João Teste",
        "score": 88.0,
        "skills": ["Python", "FastAPI", "Pytest"]
    }

    response = client.post("/candidates", json=new_candidate)

    assert response.status_code == 200
    assert response.json()["message"] == "Candidato criado com sucesso"
    assert response.json()["candidate"]["name"] == "João Teste"