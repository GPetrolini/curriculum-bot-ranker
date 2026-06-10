Feature: Raw Resume Management
  Como desenvolvedor
  Quero gerenciar currículos PDFs no banco de dados
  Para poder armazenar, recuperar e deletar currículos

  Scenario: Upload de currículo com sucesso
    Given que o banco de dados está conectado
    And o arquivo "curriculo.pdf" não existe no banco
    When o upload do currículo é realizado
    Then o currículo deve ser salvo no banco
    And o status deve ser "pending"

  Scenario: Upload de currículo com nome duplicado
    Given que o banco de dados está conectado
    And o arquivo "curriculo.pdf" já existe no banco
    When o upload do currículo é realizado
    Then um erro deve ser lançado
    And a transação deve ser revertida

  Scenario: Listar todos os currículos
    Given que o banco de dados está conectado
    When a lista de currículos é solicitada
    Then todos os currículos devem ser retornados
    And devem estar ordenados por data de criação

  Scenario: Deletar currículo por ID
    Given que o banco de dados está conectado
    And o currículo com ID "123" existe
    When a deleção é solicitada
    Then o currículo deve ser removido do banco
    And o currículo deletado deve ser retornado

  Scenario: Buscar currículo por ID
    Given que o banco de dados está conectado
    And o currículo com ID "123" existe
    When a busca por ID é realizada
    Then o currículo deve ser retornado
