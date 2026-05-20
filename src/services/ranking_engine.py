from typing import Dict


class RankingEngine:

    @staticmethod
    def determine_ranking(final_score: int) -> str:
        if final_score >= 80:
            return "EXCELENTE"
        if final_score >= 50:
            return "BOM"
        if final_score >= 30:
            return "MEDIANO"
        return "FRACO"

    @staticmethod
    def apply(candidate_payload: Dict) -> Dict:
        candidate_payload["ranking_level"] = RankingEngine.determine_ranking(
            candidate_payload.get("final_score", 0)
        )
        return candidate_payload
