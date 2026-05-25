Feature: Score e ranking de candidatos
  Validar o comportamento de cálculo de score e ranking do candidato com base nas skills exigidas.

  Scenario Outline: Calcular score com base nas skills correspondentes
    Given o candidato tem skills "<skills>"
    And o trabalho exige skills "<required_skills>"
    When o score é calculado
    Then o score deve ser <expected>

    Examples:
      | skills              | required_skills                    | expected |
      | python, sql         | python, sql                        | 100.0    |
      | python, sql         | python, aws                        | 50.0     |
      | python, sql, aws    | python, sql, aws, docker           | 75.0     |

  Scenario Outline: Determinar ranking a partir do score
    Given o candidato tem um score de <final_score>
    When o ranking é determinado
    Then o nível de ranking deve ser "<expected_ranking>"

    Examples:
      | final_score | expected_ranking |
      | 90          | EXCELENTE        |
      | 50          | BOM              |
      | 30          | MEDIANO          |
      | 0           | FRACO            |

  Scenario: Aplicar ranking ao payload do candidato
    Given um payload de candidato com final_score 72
    When o ranking é aplicado
    Then o payload do candidato deve ter ranking_level "BOM"

  Scenario: Aplicar ranking padrão quando final_score estiver ausente
    Given um payload de candidato sem final_score
    When o ranking é aplicado
    Then o payload do candidato deve ter ranking_level "FRACO"
