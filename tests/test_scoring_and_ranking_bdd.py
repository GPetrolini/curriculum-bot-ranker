from pytest_bdd import scenarios, given, when, then, parsers

from src.services import scoring_service, ranking_engine

scenarios("features/scoring_and_ranking.feature")


@given(parsers.parse('o candidato tem skills "{skills}"'), target_fixture='candidate_skills')
def candidate_skills(skills):
    return [skill.strip() for skill in skills.split(",") if skill.strip()]


@given(parsers.parse('o trabalho exige skills "{required_skills}"'), target_fixture='required_skills')
def required_skills(required_skills):
    return [skill.strip() for skill in required_skills.split(",") if skill.strip()]


@when("o score é calculado", target_fixture='score')
def score(candidate_skills, required_skills):
    return scoring_service.calculate_score(candidate_skills, required_skills)


@then(parsers.parse("o score deve ser {expected:g}"))
def score_should_be(score, expected):
    assert score == expected


@given(parsers.parse("o candidato tem um score de {final_score:d}"), target_fixture='candidate_score')
def candidate_score(final_score):
    return final_score


@when("o ranking é determinado", target_fixture='determined_ranking')
def determined_ranking(candidate_score):
    return ranking_engine.RankingEngine.determine_ranking(candidate_score)


@then(parsers.parse("o nível de ranking deve ser \"{expected_ranking}\""))
def ranking_should_be(determined_ranking, expected_ranking):
    assert determined_ranking == expected_ranking


@given(parsers.parse("um payload de candidato com final_score {final_score:d}"), target_fixture='candidate_payload')
def candidate_payload_with_score(final_score):
    return {"final_score": final_score}


@given("um payload de candidato sem final_score", target_fixture='candidate_payload')
def candidate_payload_without_score():
    return {}


@when("o ranking é aplicado", target_fixture='payload_with_ranking')
def payload_with_ranking(candidate_payload):
    return ranking_engine.RankingEngine.apply(candidate_payload.copy())


@then(parsers.parse('o payload do candidato deve ter ranking_level "{expected}"'))
def payload_ranking_should_be(payload_with_ranking, expected):
    assert payload_with_ranking["ranking_level"] == expected
