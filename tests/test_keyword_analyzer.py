from src.services.keyword_analyzer import KeywordAnalyzer


class TestKeywordAnalyzer:
    def setup_method(self):
        self.analyzer = KeywordAnalyzer()

    def test_clean_text_converts_to_lowercase(self):
        text = "HELLO WORLD"
        result = self.analyzer.clean_text(text)
        assert result == "hello world"

    def test_clean_text_removes_newlines(self):
        text = "Line 1\nLine 2"
        result = self.analyzer.clean_text(text)
        assert "\n" not in result
        assert result == "line 1 line 2"

    def test_clean_text_removes_special_characters(self):
        text = "Hello@#$%World"
        result = self.analyzer.clean_text(text)
        assert "#" not in result
        assert "%" not in result
        assert "@" in result  # @ é mantido por estar na lista permitida

    def test_clean_text_removes_extra_spaces(self):
        text = "hello    world   test"
        result = self.analyzer.clean_text(text)
        assert result == "hello world test"

    def test_clean_text_handles_empty_string(self):
        result = self.analyzer.clean_text("")
        assert result == ""

    def test_clean_text_handles_none(self):
        result = self.analyzer.clean_text(None)
        assert result == ""

    def test_analyze_vacancy_keywords_with_fallback_keywords(self):
        text = "python developer with sql and docker skills"
        result = self.analyzer.analyze_vacancy_keywords(text)
        
        assert "keyword_records" in result
        assert "must_have_score" in result
        assert "nice_to_have_score" in result
        assert "final_score" in result
        assert result["final_score"] > 0

    def test_analyze_vacancy_keywords_with_custom_keywords(self):
        text = "react developer with javascript"
        custom_keywords = [
            {"keyword": "react", "keyword_type": "must_have", "keyword_weight": 10},
            {"keyword": "javascript", "keyword_type": "must_have", "keyword_weight": 8},
        ]
        result = self.analyzer.analyze_vacancy_keywords(text, custom_keywords)
        
        assert result["final_score"] > 0
        assert len(result["keyword_records"]) == 2

    def test_analyze_vacancy_keywords_counts_occurrences(self):
        text = "python python python"
        result = self.analyzer.analyze_vacancy_keywords(text)
        
        python_record = next((r for r in result["keyword_records"] if r["keyword"] == "python"), None)
        assert python_record is not None
        assert python_record["occurrences"] == 3

    def test_analyze_vacancy_keywords_calculates_must_have_score(self):
        text = "python developer with sql skills"
        result = self.analyzer.analyze_vacancy_keywords(text)
        
        assert result["must_have_score"] > 0

    def test_analyze_vacancy_keywords_calculates_nice_to_have_score(self):
        text = "developer with docker and kubernetes"
        result = self.analyzer.analyze_vacancy_keywords(text)
        
        assert result["nice_to_have_score"] > 0

    def test_analyze_vacancy_keywords_calculates_final_score(self):
        text = "python developer with sql and docker skills"
        result = self.analyzer.analyze_vacancy_keywords(text)
        
        expected_final = result["must_have_score"] + result["nice_to_have_score"]
        assert result["final_score"] == expected_final

    def test_analyze_vacancy_keywords_counts_total_words(self):
        text = "python developer with sql and docker skills"
        result = self.analyzer.analyze_vacancy_keywords(text)
        
        assert result["total_words"] == len(text.split())

    def test_analyze_vacancy_keywords_counts_total_characters(self):
        text = "python"
        result = self.analyzer.analyze_vacancy_keywords(text)
        
        assert result["total_characters"] == len(text)

    def test_analyze_vacancy_keywords_with_empty_text(self):
        text = ""
        result = self.analyzer.analyze_vacancy_keywords(text)
        
        assert result["final_score"] == 0
        assert result["must_have_score"] == 0
        assert result["nice_to_have_score"] == 0

    def test_analyze_vacancy_keywords_with_no_matches(self):
        text = "developer with no matching skills"
        result = self.analyzer.analyze_vacancy_keywords(text)
        
        assert result["final_score"] == 0

    def test_analyze_vacancy_keywords_with_vacancy_keyword_model(self):
        from database.models import VacancyKeywordModel
        
        text = "python developer with sql skills"
        keyword_model = VacancyKeywordModel(
            keyword="python",
            keyword_type="must_have",
            keyword_weight=10
        )
        
        result = self.analyzer.analyze_vacancy_keywords(text, [keyword_model])
        
        assert result["final_score"] > 0
        assert len(result["keyword_records"]) == 1
