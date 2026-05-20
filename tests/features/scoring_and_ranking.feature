Feature: Candidate scoring and ranking
  Validate the candidate score and ranking behavior based on required skills.

  Scenario Outline: Calculate score based on matched required skills
    Given a candidate has skills "<skills>"
    And the job requires skills "<required_skills>"
    When the score is calculated
    Then the score should be <expected>

    Examples:
      | skills              | required_skills                    | expected |
      | python, sql         | python, sql                        | 100.0    |
      | python, sql         | python, aws                        | 50.0     |
      | python, sql, aws    | python, sql, aws, docker           | 75.0     |

  Scenario Outline: Determine ranking from score
    Given the candidate has a score of <final_score>
    When ranking is determined
    Then the ranking level should be "<expected_ranking>"

    Examples:
      | final_score | expected_ranking |
      | 90          | EXCELENTE        |
      | 50          | BOM              |
      | 30          | MEDIANO          |
      | 0           | FRACO            |

  Scenario: Apply ranking to candidate payload
    Given a candidate payload with final_score 72
    When ranking is applied
    Then the candidate payload ranking_level should be "BOM"

  Scenario: Apply default ranking when final_score is missing
    Given a candidate payload without final_score
    When ranking is applied
    Then the candidate payload ranking_level should be "FRACO"
