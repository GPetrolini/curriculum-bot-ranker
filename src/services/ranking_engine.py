class RankingEngine:

    @staticmethod
    def generate_ranking(candidate_data):

        score = candidate_data["final_score"]

        if score >= 80:
            level = "EXCELENTE"

        elif score >= 50:
            level = "BOM"

        elif score >= 30:
            level = "MEDIANO"

        else:
            level = "FRACO"

        candidate_data["ranking_level"] = level

        return candidate_data