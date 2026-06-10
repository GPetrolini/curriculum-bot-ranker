Feature: Database Integration
  Como desenvolvedor
  Quero ter uma integração robusta com o banco de dados PostgreSQL
  Para poder armazenar e gerenciar currículos PDFs

  Scenario: Inicializar tabela raw_resumes
    Given que o banco de dados está conectado
    When a função initializeDatabase é chamada
    Then a tabela raw_resumes deve ser criada se não existir
    And a conexão deve ser liberada

  Scenario: Executar query com sucesso
    Given que o banco de dados está conectado
    When uma query SQL é executada
    Then o resultado deve ser retornado
    And a query deve ter sido executada com os parâmetros corretos

  Scenario: Executar query com erro
    Given que o banco de dados está conectado
    When uma query SQL falha
    Then um erro deve ser lançado
