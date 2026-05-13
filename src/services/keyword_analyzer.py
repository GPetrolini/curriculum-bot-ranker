import re


class KeywordAnalyzer:

    def __init__(self):
        self.keywords = {
            "must_have": [
                ".net",
                "c#",
                "sql",
                "api",
                "rest",
                "entity framework"
            ],
            "nice_to_have": [
                "azure",
                "docker",
                "microservices",
                "kubernetes",
                "rabbitmq"
            ]
        }

    def clean_text(self, text):

        text = text.lower()

        text = re.sub(r"\n", " ", text)

        text = re.sub(r"[^a-zA-Z0-9À-ÿ.# ]", "", text)

        text = re.sub(r"\s+", " ", text)

        return text.strip()

    def count_keywords(self, text):

        result = {
            "must_have": {},
            "nice_to_have": {}
        }

        must_have_score = 0
        nice_to_have_score = 0

        # MUST HAVE
        for keyword in self.keywords["must_have"]:

            occurrences = text.count(keyword.lower())

            result["must_have"][keyword] = occurrences

            must_have_score += occurrences * 10

        # NICE TO HAVE
        for keyword in self.keywords["nice_to_have"]:

            occurrences = text.count(keyword.lower())

            result["nice_to_have"][keyword] = occurrences

            nice_to_have_score += occurrences * 5

        final_score = must_have_score + nice_to_have_score

        return {
            "keywords_found": result,
            "must_have_score": must_have_score,
            "nice_to_have_score": nice_to_have_score,
            "final_score": final_score,
            "total_words": len(text.split()),
            "total_characters": len(text)
        }