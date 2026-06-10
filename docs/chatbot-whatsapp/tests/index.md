# Testes

> Documentação dos testes unitários e BDD do bot de WhatsApp.

## Estrutura dos Testes

- `tests/unit/` — testes unitários (Jest)
- `tests/features/` — testes BDD (Cucumber)

## Configuração do Jest

O Jest está configurado no `package.json` para rodar testes unitários:

```json
{
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "coverage",
    "collectCoverageFrom": [
      "database/**/*.js",
      "services/**/*.js",
      "bot-service.js"
    ],
    "testMatch": [
      "**/tests/unit/**/*.test.js"
    ],
    "testPathIgnorePatterns": [
      "/node_modules/"
    ]
  }
}
```

### Scripts de Teste

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## Testes Unitários

Os testes unitários estão localizados em `tests/unit/` e cobrem:

### bot-service.test.js

Testa as principais funções do `bot-service.js`:
- `normalizeText()` — normalização de texto
- `isCurriculoFileName()` — filtro de currículos
- `getPdfFileNameWwebjs()` — geração de nome de arquivo
- `savePdfMetadataWwebjs()` — salvamento de metadados

### database.test.js

Testa a conexão e operações do banco de dados:
- Conexão com PostgreSQL
- Criação de tabela `raw_resumes`
- Execução de queries

### raw-resume-repository.test.js

Testa o repositório de `raw_resumes`:
- `getByFileName()` — obter por nome do arquivo
- `getAll()` — obter todos os registros
- `createRawResume()` — criar novo registro
- `deleteById()` — deletar por ID
- `getById()` — obter por ID

### raw-resume-service.test.js

Testa o serviço de `raw_resumes`:
- `uploadRawResume()` — upload de PDF
- `getAllRawResumes()` — obter todos os registros
- `deleteRawResume()` — deletar registro
- `getRawResumeById()` — obter por ID

---

## Testes BDD (Cucumber)

Os testes BDD estão localizados em `tests/features/` e definem cenários de comportamento:

### bot-service.feature

Define cenários para o serviço do bot:
- Cenário: Bot recebe PDF de currículo
- Cenário: Bot ignora PDF que não é currículo
- Cenário: Bot escaneia conversas antigas

### database.feature

Define cenários para o banco de dados:
- Cenário: Conexão com PostgreSQL
- Cenário: Criação de tabela raw_resumes
- Cenário: Inserção de registro

### raw-resume.feature

Define cenários para o serviço de raw_resumes:
- Cenário: Upload de PDF para banco
- Cenário: Upload de PDF duplicado
- Cenário: Listagem de PDFs

---

## Executar Testes

### Executar todos os testes unitários

```bash
npm test
```

### Executar testes em modo watch

```bash
npm run test:watch
```

### Executar testes com coverage

```bash
npm run test:coverage
```

---

## Exemplo de Teste Unitário

```javascript
describe('isCurriculoFileName', () => {
  test('deve retornar true para "Curriculo ANA CLARA.pdf"', () => {
    expect(isCurriculoFileName('Curriculo ANA CLARA.pdf')).toBe(true);
  });

  test('deve retornar true para "Currículo João Silva.pdf"', () => {
    expect(isCurriculoFileName('Currículo João Silva.pdf')).toBe(true);
  });

  test('deve retornar true para "Curriculum Maria Santos.pdf"', () => {
    expect(isCurriculoFileName('Curriculum Maria Santos.pdf')).toBe(true);
  });

  test('deve retornar true para "CV Pedro Costa.pdf"', () => {
    expect(isCurriculoFileName('CV Pedro Costa.pdf')).toBe(true);
  });

  test('deve retornar false para "Trabalho.pdf"', () => {
    expect(isCurriculoFileName('Trabalho.pdf')).toBe(false);
  });

  test('deve retornar false para "Conta_de_agua.pdf"', () => {
    expect(isCurriculoFileName('Conta_de_agua.pdf')).toBe(false);
  });
});
```

---

## Exemplo de Cenário BDD

```gherkin
Feature: Upload de PDF para Banco de Dados

  Scenario: Upload de PDF com sucesso
    Given o banco de dados está inicializado
    And o arquivo "Curriculo ANA CLARA.pdf" existe na pasta de downloads
    When o usuário faz upload do arquivo para o banco
    Then o arquivo deve ser salvo na tabela raw_resumes
    And o status deve ser "pending"

  Scenario: Upload de PDF duplicado
    Given o banco de dados está inicializado
    And o arquivo "Curriculo ANA CLARA.pdf" já existe no banco
    When o usuário tenta fazer upload do mesmo arquivo
    Then o upload deve falhar
    And uma mensagem de erro deve ser exibida
```

---

## Cobertura de Testes

A configuração do Jest gera relatórios de cobertura para os seguintes diretórios:
- `database/**/*.js`
- `services/**/*.js`
- `bot-service.js`

O relatório de cobertura é salvo no diretório `coverage/` após executar `npm run test:coverage`.
