import pytest
from pytest_bdd import scenarios, given, when, then, parsers

from src.services import scoring_service, ranking_engine

scenarios("features/scoring_and_ranking.feature")


@given(parsers.parse('a candidate has skills "{skills}"'), target_fixture='candidate_skills')
def candidate_skills(skills):
    return [skill.strip() for skill in skills.split(",") if skill.strip()]


@given(parsers.parse('the job requires skills "{required_skills}"'), target_fixture='required_skills')
def required_skills(required_skills):
    return [skill.strip() for skill in required_skills.split(",") if skill.strip()]


@when("the score is calculated", target_fixture='score')
def score(candidate_skills, required_skills):
    return scoring_service.calculate_score(candidate_skills, required_skills)


@then(parsers.parse("the score should be {expected:g}"))
def score_should_be(score, expected):
    assert score == expected


@given(parsers.parse("the candidate has a score of {final_score:d}"), target_fixture='candidate_score')
def candidate_score(final_score):
    return final_score


@when("ranking is determined", target_fixture='determined_ranking')
def determined_ranking(candidate_score):
    return ranking_engine.RankingEngine.determine_ranking(candidate_score)


@then(parsers.parse("the ranking level should be \"{expected_ranking}\""))
def ranking_should_be(determined_ranking, expected_ranking):
    assert determined_ranking == expected_ranking


@given(parsers.parse("a candidate payload with final_score {final_score:d}"), target_fixture='candidate_payload')
def candidate_payload_with_score(final_score):
    return {"final_score": final_score}


@given("a candidate payload without final_score", target_fixture='candidate_payload')
def candidate_payload_without_score():
    return {}


@when("ranking is applied", target_fixture='payload_with_ranking')
def payload_with_ranking(candidate_payload):
    return ranking_engine.RankingEngine.apply(candidate_payload.copy())


@then(parsers.parse('the candidate payload ranking_level should be "{expected}"'))
def payload_ranking_should_be(payload_with_ranking, expected):
    assert payload_with_ranking["ranking_level"] == expected
