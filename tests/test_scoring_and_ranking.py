import os
import sys

import pytest

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT_DIR)

from src.services import ranking_engine, scoring_service


class TestScoringService:
    def test_calculate_score_returns_zero_when_no_required_skills(self):
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
    def test_calculate_score_matches_expected_percentage(self, skills, required_skills, expected):
        score = scoring_service.calculate_score(skills, required_skills)

        assert score == expected

    def test_calculate_score_rounds_to_two_decimals(self):
        skills = ["python", "sql", "aws"]
        required_skills = ["python", "sql", "aws", "docker", "kubernetes"]

        score = scoring_service.calculate_score(skills, required_skills)

        assert score == 60.0


class TestRankingEngine:
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
    def test_determine_ranking_returns_expected_level(self, final_score, expected_ranking):
        ranking = ranking_engine.RankingEngine.determine_ranking(final_score)

        assert ranking == expected_ranking

    def test_apply_adds_ranking_level_to_candidate_payload(self):
        candidate_payload = {"final_score": 72}

        result = ranking_engine.RankingEngine.apply(candidate_payload.copy())

        assert result["ranking_level"] == "BOM"
        assert result["final_score"] == 72

    def test_apply_uses_default_score_when_missing(self):
        candidate_payload = {}

        result = ranking_engine.RankingEngine.apply(candidate_payload.copy())

        assert result["ranking_level"] == "FRACO"
        assert result.get("final_score") is None
