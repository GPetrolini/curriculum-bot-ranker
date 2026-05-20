import re
from typing import Dict, List, Optional, Union

from database.models import VacancyKeywordModel


class KeywordAnalyzer:

    FALLBACK_KEYWORDS = [
        {"keyword": "python", "keyword_type": "must_have", "keyword_weight": 10},
        {"keyword": "sql", "keyword_type": "must_have", "keyword_weight": 8},
        {"keyword": "rest", "keyword_type": "must_have", "keyword_weight": 7},
        {"keyword": "docker", "keyword_type": "nice_to_have", "keyword_weight": 5},
        {"keyword": "kubernetes", "keyword_type": "nice_to_have", "keyword_weight": 5},
    ]

    def clean_text(self, text: str) -> str:
        text = text or ""
        text = text.lower()
        text = re.sub(r"\n", " ", text)
        text = re.sub(r"[^a-z0-9à-ÿ@.\-/ ]", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def analyze_vacancy_keywords(
        self,
        text: str,
        vacancy_keywords: Optional[List[Union[VacancyKeywordModel, Dict]]] = None,
    ) -> Dict:
        text = self.clean_text(text)
        source_keywords = vacancy_keywords or self.FALLBACK_KEYWORDS

        keyword_records = []
        must_have_score = 0
        nice_to_have_score = 0

        for item in source_keywords:
            if hasattr(item, "keyword"):
                keyword = getattr(item, "keyword").lower()
                keyword_type = getattr(item, "keyword_type", "nice_to_have")
                keyword_weight = getattr(item, "keyword_weight", 1)
            else:
                keyword = item["keyword"].lower()
                keyword_type = item.get("keyword_type", "nice_to_have")
                keyword_weight = item.get("keyword_weight", 1)

            occurrences = len(re.findall(re.escape(keyword), text))
            keyword_score = int(occurrences * keyword_weight)

            if keyword_type == "must_have":
                must_have_score += keyword_score
            else:
                nice_to_have_score += keyword_score

            keyword_records.append(
                {
                    "keyword": keyword,
                    "occurrences": occurrences,
                    "keyword_type": keyword_type,
                    "keyword_weight": keyword_weight,
                    "keyword_score": keyword_score,
                }
            )

        final_score = must_have_score + nice_to_have_score

        return {
            "keyword_records": keyword_records,
            "must_have_score": must_have_score,
            "nice_to_have_score": nice_to_have_score,
            "final_score": final_score,
            "total_words": len(text.split()),
            "total_characters": len(text),
        }
