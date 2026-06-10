# Frontend — recruta.ai

Interface web do painel de candidatos do **Curriculum Bot Ranker**. SPA sem framework, construída com HTML, CSS e JavaScript vanilla.

---

## Navegação da documentação

| Arquivo | Conteúdo |
|---|---|
| [architecture.md](./architecture.md) | Visão geral, stack, estrutura de arquivos e fluxo de dados |
| [getting-started.md](./getting-started.md) | Como rodar localmente e conectar ao backend |
| [api-integration.md](./api-integration.md) | Contrato com o backend: endpoints, payload e tipos |
| [modules/](./modules/) | Referência técnica de cada módulo JavaScript |

---

## Estrutura de arquivos

```
frontend/
├── index.html
└── assets/
    ├── css/
    │   └── style.css
    └── js/
        ├── config.js
        ├── state.js
        ├── helpers.js
        ├── api.js
        ├── render.js
        ├── filters.js
        ├── status.js
        └── modal.js
```

---

## Páginas da interface

| Página | Descrição |
|---|---|
| **Candidatos** | Listagem completa com busca, filtros, ordenação e paginação |
| **Selecionados** | Filas de candidatos para entrevista e contratados |
