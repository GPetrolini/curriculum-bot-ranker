Feature: Bot Service
  Como desenvolvedor
  Quero que o bot service processe e gerencie PDFs
  Para poder baixar currículos e fazer upload para o banco

  Scenario: Normalizar texto
    Given um texto com acentos
    When a função normalizeText é chamada
    Then os acentos devem ser removidos
    And o texto deve estar em minúsculas

  Scenario: Identificar arquivo de currículo
    Given um nome de arquivo
    When a função isCurriculoFileName é chamada
    Then deve retornar true se contiver palavras-chave
    And deve retornar false caso contrário

  Scenario: Listar PDFs da pasta de downloads
    Given que a pasta de downloads contém PDFs
    When a função getPdfList é chamada
    Then uma lista de PDFs deve ser retornada
    And os arquivos devem estar ordenados por data de modificação

  Scenario: Upload de múltiplos arquivos para o banco
    Given que o banco de dados está conectado
    And os arquivos existem na pasta de downloads
    When a função uploadToDatabase é chamada
    Then os arquivos devem ser enviados para o banco
    And o sucesso deve ser reportado

  Scenario: Upload de arquivo inexistente
    Given que o banco de dados está conectado
    And o arquivo não existe na pasta de downloads
    When a função uploadToDatabase é chamada
    Then um erro deve ser reportado
    And o contador de erros deve ser incrementado

  Scenario: Upload com erro parcial
    Given que o banco de dados está conectado
    And um arquivo falha no upload
    When a função uploadToDatabase é chamada
    Then os outros arquivos devem continuar sendo processados
    And os erros devem ser reportados
